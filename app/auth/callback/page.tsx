"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const { loginWithMAL } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          setError(`Authentication failed: ${error}`);
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError("No authentication code received");
          setIsProcessing(false);
          return;
        }

        // Get the code verifier we stored earlier
        const codeVerifier = localStorage.getItem('mal_code_verifier');
        if (!codeVerifier) {
          console.warn("No code verifier found, using default");
        }

        // Process authentication with the code and code verifier
        await loginWithMAL(code, codeVerifier || undefined);
        
        // Remove the code verifier from storage
        localStorage.removeItem('mal_code_verifier');
        
        // Redirect to home page after successful login
        router.push("/");
      } catch (err: any) {
        console.error("Authentication error:", err);
        setError(err.message || "Authentication failed");
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [loginWithMAL, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Authentication Error</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h1 className="mt-4 text-xl font-bold">Authenticating with MyAnimeList</h1>
          <p className="mt-2 text-muted-foreground">Please wait while we complete the process...</p>
        </div>
      </div>
    </div>
  );
} 