import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExportFormat } from "@/components/FormatSelector";
import { ConversionStep } from "@/components/ConversionProgress";

interface ConversionResult {
  blob: Blob;
  fileName: string;
  transactionCount: number;
  remainingConversions: number;
}

interface ConversionError {
  error: string;
  message: string;
  remaining?: number;
  limit?: number;
}

export function useConversion() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ConversionStep>("uploading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(
    async (
      file: File,
      format: ExportFormat
    ): Promise<ConversionResult | null> => {
      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setStep("uploading");

      try {
        // Simulate upload progress
        setProgress(10);
        await new Promise((r) => setTimeout(r, 200));
        setStep("parsing");
        setProgress(20);

        // Prepare form data
        const formData = new FormData();
        formData.append("file", file);
        formData.append("format", format);

        setProgress(30);
        setStep("extracting");

        // Get auth token if logged in
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        setProgress(40);

        // Call the edge function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-statement`,
          {
            method: "POST",
            headers,
            body: formData,
          }
        );

        setProgress(70);
        setStep("generating");

        // Handle error responses
        if (!response.ok) {
          const errorData: ConversionError = await response.json();
          
          if (response.status === 429) {
            throw new Error(errorData.message || "Rate limit exceeded. Try again tomorrow.");
          }
          
          throw new Error(errorData.message || errorData.error || "Conversion failed");
        }

        setProgress(90);

        // Get the response as blob
        const blob = await response.blob();
        const transactionCount = parseInt(
          response.headers.get("X-Transactions-Count") || "0",
          10
        );
        const remainingConversions = parseInt(
          response.headers.get("X-Remaining-Conversions") || "0",
          10
        );

        // Generate filename
        const originalName = file.name.replace(/\.pdf$/i, "");
        const fileName = `${originalName}.${format}`;

        setProgress(100);
        setStep("complete");

        return {
          blob,
          fileName,
          transactionCount,
          remainingConversions,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed";
        setError(message);
        console.error("Conversion error:", err);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsProcessing(false);
    setStep("uploading");
    setProgress(0);
    setError(null);
  }, []);

  return {
    convert,
    reset,
    isProcessing,
    step,
    progress,
    error,
  };
}
