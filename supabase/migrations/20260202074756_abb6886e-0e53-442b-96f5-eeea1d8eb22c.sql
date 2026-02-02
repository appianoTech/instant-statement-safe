-- Create table for tracking conversion usage (rate limiting)
-- Note: We only track usage counts, NEVER file content

CREATE TABLE public.conversion_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier_hash TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (identifier_hash, usage_date)
);

-- Enable Row Level Security
ALTER TABLE public.conversion_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversion_usage
-- Users can only see their own usage records
CREATE POLICY "Users can view their own usage" 
ON public.conversion_usage 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR identifier_type = 'ip'
);

-- Allow insert for tracking (needed by edge function with service role)
CREATE POLICY "Service role can insert usage" 
ON public.conversion_usage 
FOR INSERT 
WITH CHECK (true);

-- Allow update for tracking (needed by edge function with service role)
CREATE POLICY "Service role can update usage" 
ON public.conversion_usage 
FOR UPDATE 
USING (true);

-- Create index for fast lookups
CREATE INDEX idx_conversion_usage_lookup 
ON public.conversion_usage (identifier_hash, usage_date);

-- Create index for user lookups
CREATE INDEX idx_conversion_usage_user 
ON public.conversion_usage (user_id) 
WHERE user_id IS NOT NULL;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_conversion_usage_updated_at
BEFORE UPDATE ON public.conversion_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check and increment usage (returns remaining conversions)
-- Returns -1 if rate limit exceeded
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
  p_identifier_hash TEXT,
  p_identifier_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_daily_limit INTEGER DEFAULT 3
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Try to get existing record for today
  SELECT conversion_count INTO v_current_count
  FROM public.conversion_usage
  WHERE identifier_hash = p_identifier_hash
    AND usage_date = CURRENT_DATE
  FOR UPDATE;

  IF v_current_count IS NULL THEN
    -- No record exists, create one
    INSERT INTO public.conversion_usage (identifier_hash, identifier_type, user_id, conversion_count, usage_date)
    VALUES (p_identifier_hash, p_identifier_type, p_user_id, 1, CURRENT_DATE);
    v_remaining := p_daily_limit - 1;
  ELSE
    -- Record exists, check limit
    IF v_current_count >= p_daily_limit THEN
      -- Rate limit exceeded
      RETURN -1;
    END IF;
    
    -- Increment count
    UPDATE public.conversion_usage
    SET conversion_count = conversion_count + 1
    WHERE identifier_hash = p_identifier_hash
      AND usage_date = CURRENT_DATE;
    
    v_remaining := p_daily_limit - v_current_count - 1;
  END IF;

  RETURN v_remaining;
END;
$$;

-- Function to get current usage without incrementing
CREATE OR REPLACE FUNCTION public.get_usage_count(
  p_identifier_hash TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT conversion_count INTO v_count
  FROM public.conversion_usage
  WHERE identifier_hash = p_identifier_hash
    AND usage_date = CURRENT_DATE;
  
  RETURN COALESCE(v_count, 0);
END;
$$;