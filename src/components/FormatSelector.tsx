import { FileSpreadsheet, FileText, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExportFormat = "xlsx" | "csv" | "json";

interface FormatSelectorProps {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  disabled?: boolean;
}

const formats: { value: ExportFormat; label: string; icon: typeof FileSpreadsheet; description: string }[] = [
  {
    value: "xlsx",
    label: "Excel",
    icon: FileSpreadsheet,
    description: "Formatted spreadsheet",
  },
  {
    value: "csv",
    label: "CSV",
    icon: FileText,
    description: "Universal format",
  },
  {
    value: "json",
    label: "JSON",
    icon: FileJson,
    description: "Structured data",
  },
];

export function FormatSelector({ selectedFormat, onFormatChange, disabled }: FormatSelectorProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <p className="text-sm font-medium text-foreground mb-3 text-center">
        Select output format
      </p>
      <div className="grid grid-cols-3 gap-3">
        {formats.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.value;

          return (
            <button
              key={format.value}
              onClick={() => onFormatChange(format.value)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "font-medium text-sm",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {format.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {format.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
