import { Progress } from "@/components/ui/progress";
import { Loader2, FileSearch, Brain, FileOutput, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConversionStep = "uploading" | "parsing" | "extracting" | "generating" | "complete";

interface ConversionProgressProps {
  step: ConversionStep;
  progress: number;
}

const steps: { key: ConversionStep; label: string; icon: typeof Loader2 }[] = [
  { key: "uploading", label: "Uploading PDF", icon: Loader2 },
  { key: "parsing", label: "Reading document", icon: FileSearch },
  { key: "extracting", label: "Extracting transactions", icon: Brain },
  { key: "generating", label: "Generating file", icon: FileOutput },
  { key: "complete", label: "Complete!", icon: CheckCircle },
];

export function ConversionProgress({ step, progress }: ConversionProgressProps) {
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-center">{progress}% complete</p>
      </div>

      <div className="flex justify-between">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={s.key}
              className={cn(
                "flex flex-col items-center gap-2 transition-all",
                isPending && "opacity-40"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isComplete && "bg-success/20",
                  isActive && "bg-primary/20",
                  isPending && "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isComplete && "text-success",
                    isActive && "text-primary animate-spin",
                    isPending && "text-muted-foreground",
                    s.key === "complete" && isComplete && "animate-none"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[80px]",
                  isComplete && "text-success",
                  isActive && "text-primary",
                  isPending && "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
