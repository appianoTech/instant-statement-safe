import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Trash2, Lock, Server, Eye, Clock } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Our zero-retention commitment to your financial data
            </p>
          </div>

          {/* Last updated */}
          <p className="text-sm text-muted-foreground text-center">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          {/* Key principles */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 bg-card border border-border rounded-lg">
              <Server className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">No File Storage</h3>
              <p className="text-sm text-muted-foreground">
                Your files are processed entirely in memory. We never write your data to disk, databases, or any permanent storage.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <Trash2 className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Immediate Deletion</h3>
              <p className="text-sm text-muted-foreground">
                After you download your converted file, all data is immediately purged from our servers' memory.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <Lock className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Encrypted Transfer</h3>
              <p className="text-sm text-muted-foreground">
                All file uploads and downloads are encrypted using TLS/HTTPS. Your data is protected in transit.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <Eye className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">No Data Mining</h3>
              <p className="text-sm text-muted-foreground">
                We don't analyze, sell, or share your financial data. We can't—because we don't keep it.
              </p>
            </div>
          </div>

          {/* Detailed policy */}
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
              Our Zero-Retention Policy
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  What We Process
                </h3>
                <p>
                  When you upload a bank statement PDF, our system processes it to extract transaction data including dates, descriptions, amounts, and balances. This processing happens entirely in memory (RAM) on our servers.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  How Long We Keep Data
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>During processing:</strong> Your data exists only while being converted (typically seconds)
                  </li>
                  <li>
                    <strong>After download:</strong> Data is immediately purged from memory
                  </li>
                  <li>
                    <strong>On timeout:</strong> If you don't download within 5 minutes, data is automatically deleted
                  </li>
                  <li>
                    <strong>On error:</strong> Any errors trigger immediate data cleanup
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  What We Don't Do
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Store files on disk or in databases</li>
                  <li>Create backups of your financial documents</li>
                  <li>Log or track your transaction data</li>
                  <li>Share data with any third parties</li>
                  <li>Use your data for training AI models</li>
                  <li>Retain any copy after processing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Rate Limiting
                </h3>
                <p>
                  To prevent abuse, we track conversion counts by IP address or user account. We store only:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>A hashed version of your IP address (for anonymous users)</li>
                  <li>A count of conversions per day</li>
                  <li>No file content or financial data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Optional Account
                </h3>
                <p>
                  If you create an account for higher conversion limits, we store only:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your email address</li>
                  <li>Your password (securely hashed)</li>
                  <li>Daily conversion count</li>
                </ul>
                <p className="mt-2">
                  We never store your uploaded files or converted data, regardless of account status.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Your Rights
                </h3>
                <p>
                  Because we don't store your financial data, there's nothing to delete. However, if you have an account, you can request deletion of your email and account information at any time.
                </p>
              </div>

              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg mt-8">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Technical Implementation
                    </h4>
                    <p className="text-sm">
                      All file processing occurs in Edge Functions using in-memory streams. We use BytesIO-equivalent buffers in our serverless functions, which are automatically garbage-collected after each request. No filesystem access is used at any point in the conversion process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center pt-8 border-t border-border">
            <p className="text-muted-foreground">
              Questions about our privacy practices?{" "}
              <a href="mailto:privacy@example.com" className="text-primary hover:underline">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
