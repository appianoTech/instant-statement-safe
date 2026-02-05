import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, SignIn } from "@clerk/clerk-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Auth() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/");
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <SignIn 
          routing="hash"
          signUpUrl="/auth"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
              footer: "hidden",
              footerAction: "hidden",
              badge: "hidden",
              dividerRow: "hidden",
            }
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
