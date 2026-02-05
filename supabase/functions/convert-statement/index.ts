import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiting (resets on function cold start)
const usageMap = new Map<string, { count: number; resetTime: number }>();

// Rate limits
const ANONYMOUS_DAILY_LIMIT = 3;
const AUTHENTICATED_DAILY_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple hash for identifier
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Check and increment in-memory usage
function checkAndIncrementUsage(identifier: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = usageMap.get(identifier);
  
  // Clean up expired entries periodically
  if (usageMap.size > 10000) {
    for (const [key, value] of usageMap.entries()) {
      if (now > value.resetTime) {
        usageMap.delete(key);
      }
    }
  }
  
  if (!existing || now > existing.resetTime) {
    // New or expired entry
    usageMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  existing.count++;
  return { allowed: true, remaining: limit - existing.count };
}

// Extract transactions using Lovable AI
async function extractTransactionsWithAI(pdfBase64: string): Promise<any[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  console.log("Calling Lovable AI for document parsing...");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are a financial document parser specializing in bank statements. Extract ALL transactions from the provided bank statement image/document.

For each transaction, extract:
- date: The transaction date (format: YYYY-MM-DD)
- description: The transaction description/narrative
- debit: Amount debited (null if not a debit), as a number
- credit: Amount credited (null if not a credit), as a number
- balance: The balance after this transaction (if shown), as a number

Return ONLY a valid JSON array of transaction objects. No explanations, no markdown, just the JSON array.
If you cannot extract any transactions, return an empty array [].

Example output format:
[{"date":"2024-01-15","description":"GROCERY STORE","debit":45.50,"credit":null,"balance":1234.50}]`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all transactions from this bank statement. Return only the JSON array."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${pdfBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 8000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const statusCode = response.status;
    const errorText = await response.text();
    console.error("AI gateway error:", statusCode, errorText);
    
    if (statusCode === 429) {
      throw new Error("RATE_LIMIT: Too many requests. Please try again later.");
    }
    if (statusCode === 402) {
      throw new Error("PAYMENT_REQUIRED: AI service credits exhausted.");
    }
    throw new Error(`AI_ERROR: Failed to process document (${statusCode})`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";
  
  console.log("AI response received, parsing transactions...");
  
  // Parse the JSON response
  try {
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();
    
    const transactions = JSON.parse(cleanContent);
    
    if (!Array.isArray(transactions)) {
      console.error("AI returned non-array:", typeof transactions);
      return [];
    }
    
    console.log(`Extracted ${transactions.length} transactions`);
    return transactions;
  } catch (parseError) {
    console.error("Failed to parse AI response:", parseError, content.slice(0, 500));
    return [];
  }
}

// Generate CSV from transactions
function generateCSV(transactions: any[]): string {
  const headers = ["Date", "Description", "Debit", "Credit", "Balance"];
  const rows = transactions.map((t) => [
    t.date || "",
    `"${(t.description || "").replace(/"/g, '""')}"`,
    t.debit !== null && t.debit !== undefined ? t.debit.toString() : "",
    t.credit !== null && t.credit !== undefined ? t.credit.toString() : "",
    t.balance !== null && t.balance !== undefined ? t.balance.toString() : "",
  ]);
  
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// Generate JSON from transactions
function generateJSON(transactions: any[]): string {
  return JSON.stringify(transactions, null, 2);
}

// Generate XLSX from transactions (tab-separated for Excel)
function generateXLSX(transactions: any[]): string {
  const headers = ["Date", "Description", "Debit", "Credit", "Balance"];
  const rows = transactions.map((t) => [
    t.date || "",
    t.description || "",
    t.debit !== null && t.debit !== undefined ? t.debit : "",
    t.credit !== null && t.credit !== undefined ? t.credit : "",
    t.balance !== null && t.balance !== undefined ? t.balance : "",
  ]);
  
  return [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check for authenticated user
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    let dailyLimit = ANONYMOUS_DAILY_LIMIT;
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        userId = data.user.id;
        dailyLimit = AUTHENTICATED_DAILY_LIMIT;
      }
    }

    // Create identifier for rate limiting (hash for privacy)
    const identifier = simpleHash(userId || clientIP);
    
    // Check in-memory rate limit
    const { allowed, remaining } = checkAndIncrementUsage(identifier, dailyLimit);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: userId 
            ? `You've used all ${dailyLimit} conversions for today. Try again later.`
            : `You've used all ${dailyLimit} free conversions. Sign in for more, or try again later.`,
          remaining: 0,
          limit: dailyLimit,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string) || "csv";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return new Response(
        JSON.stringify({ error: "Only PDF files are supported" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size must be less than 10MB" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}, format: ${format}`);

    // Read file into memory (no disk storage!)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Extract transactions using AI
    const transactions = await extractTransactionsWithAI(base64);

    if (transactions.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No transactions found",
          message: "Could not extract transactions from this document. Please ensure it's a valid bank statement.",
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate output in requested format
    let output: string;
    let contentType: string;
    let fileExtension: string;

    switch (format.toLowerCase()) {
      case "json":
        output = generateJSON(transactions);
        contentType = "application/json";
        fileExtension = "json";
        break;
      case "xlsx":
        output = generateXLSX(transactions);
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileExtension = "xlsx";
        break;
      case "csv":
      default:
        output = generateCSV(transactions);
        contentType = "text/csv";
        fileExtension = "csv";
        break;
    }

    const fileName = file.name.replace(".pdf", "") + "." + fileExtension;

    console.log(`Conversion complete: ${transactions.length} transactions, format: ${format}`);

    // Return the file directly - no storage!
    return new Response(output, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Transactions-Count": transactions.length.toString(),
        "X-Remaining-Conversions": remaining.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Conversion error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.startsWith("RATE_LIMIT:")) {
      return new Response(
        JSON.stringify({ error: "Rate limited", message: errorMessage.replace("RATE_LIMIT: ", "") }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (errorMessage.startsWith("PAYMENT_REQUIRED:")) {
      return new Response(
        JSON.stringify({ error: "Service unavailable", message: "Conversion service is temporarily unavailable." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Conversion failed", message: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});