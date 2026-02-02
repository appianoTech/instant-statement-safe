import { useCallback, useState } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadZone({ onFileSelect, isProcessing, selectedFile, onClear }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.includes("pdf")) {
      return "Please upload a PDF file";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  if (selectedFile) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <File className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <label
        htmlFor="file-upload"
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all",
          "bg-upload-bg hover:bg-upload-hover",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-upload-border hover:border-primary/50",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all",
              isDragOver ? "bg-primary/20" : "bg-primary/10"
            )}
          >
            <Upload
              className={cn(
                "w-7 h-7 transition-all",
                isDragOver ? "text-primary animate-upload-bounce" : "text-primary"
              )}
            />
          </div>
          <p className="mb-2 text-lg font-medium text-foreground">
            {isDragOver ? "Drop your PDF here" : "Drag & drop your bank statement"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          <p className="text-xs text-muted-foreground">
            PDF files only, max 10MB
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
        />
      </label>

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
