import { Shield, Lock, Trash2 } from "lucide-react";
import { TrustBadge } from "./TrustBadge";

export function Hero() {
  return (
    <div className="text-center space-y-8 mb-12">
      {/* Main headline */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
          Zero Storage.{" "}
          <span className="text-primary">Complete Privacy.</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Convert bank statement PDFs to Excel, CSV, or JSON instantly.
          <br className="hidden md:block" />
          <span className="font-medium text-foreground">Your files never touch a disk.</span>
        </p>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
        <TrustBadge
          icon={Shield}
          title="No Disk Storage"
          description="Files exist only in memory during processing"
        />
        <TrustBadge
          icon={Trash2}
          title="Data Destroyed"
          description="Everything is purged after your download"
        />
        <TrustBadge
          icon={Lock}
          title="HTTPS Encrypted"
          description="End-to-end encryption for all transfers"
        />
      </div>
    </div>
  );
}
