import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { UploadZone } from "@/components/UploadZone";
import { FormatSelector, ExportFormat } from "@/components/FormatSelector";
import { ConversionProgress } from "@/components/ConversionProgress";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConversion } from "@/hooks/useConversion";

export default function Index() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("xlsx");
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [remainingConversions, setRemainingConversions] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { convert, reset, isProcessing, step, progress, error } = useConversion();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setDownloadBlob(null);
    setTransactionCount(0);
    reset();
  }, [reset]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setDownloadBlob(null);
    setTransactionCount(0);
    reset();
  }, [reset]);

  const handleConvert = useCallback(async () => {
    if (!selectedFile) return;

    const result = await convert(selectedFile, selectedFormat);
    
    if (result) {
      setDownloadBlob(result.blob);
      setTransactionCount(result.transactionCount);
      setRemainingConversions(result.remainingConversions);
      
      toast({
        title: "Conversion complete!",
        description: `Extracted ${result.transactionCount} transactions. ${result.remainingConversions} conversions remaining today.`,
      });
    }
  }, [selectedFile, selectedFormat, convert, toast]);

  const handleDownload = useCallback(() => {
    if (!downloadBlob || !selectedFile) return;

    const url = URL.createObjectURL(downloadBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedFile.name.replace(".pdf", "")}.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear data after download (privacy feature)
    toast({
      title: "Download started",
      description: "Your data has been cleared from memory.",
    });

    setTimeout(() => {
      URL.revokeObjectURL(url);
      handleClear();
    }, 1000);
  }, [downloadBlob, selectedFile, selectedFormat, toast, handleClear]);

  const handleAuthClick = useCallback(() => {
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onAuthClick={handleAuthClick} />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Hero />

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Upload zone */}
          <UploadZone
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            selectedFile={selectedFile}
            onClear={handleClear}
          />

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Conversion failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {/* Format selector - show when file is selected */}
          {selectedFile && !isProcessing && !downloadBlob && !error && (
            <FormatSelector
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
              disabled={isProcessing}
            />
          )}

          {/* Convert button */}
          {selectedFile && !isProcessing && !downloadBlob && !error && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleConvert}
                className="px-8"
              >
                Convert to {selectedFormat.toUpperCase()}
              </Button>
            </div>
          )}

          {/* Progress indicator */}
          {isProcessing && (
            <ConversionProgress step={step} progress={progress} />
          )}

          {/* Download section */}
          {downloadBlob && (
            <div className="flex flex-col items-center gap-4 p-6 bg-success/10 border border-success/30 rounded-xl">
              <p className="text-lg font-medium text-foreground">
                Your file is ready!
              </p>
              <p className="text-sm text-muted-foreground">
                Extracted {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-3">
                <Button size="lg" onClick={handleDownload}>
                  <Download className="w-5 h-5 mr-2" />
                  Download {selectedFormat.toUpperCase()}
                </Button>
                <Button variant="outline" size="lg" onClick={handleClear}>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Convert Another
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your data will be cleared after download
              </p>
              {remainingConversions !== null && (
                <p className="text-xs text-muted-foreground">
                  {remainingConversions} conversion{remainingConversions !== 1 ? "s" : ""} remaining today
                </p>
              )}
            </div>
          )}

          {/* Retry after error */}
          {error && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
