"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Logo from "@/components/logo";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithAniList } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        
        if (!code) {
          setError("Authentication failed: No code provided");
          setIsLoading(false);
          return;
        }
        
        // Process the auth code
        await loginWithAniList(code);
        
        // Redirect after successful login
        router.push("/profile");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
        setIsLoading(false);
      }
    }
    
    handleCallback();
  }, [loginWithAniList, router]);

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-8">
        <Logo size="large" />
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400">Authentication Error</h1>
          <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-8">
      <Logo size="large" />
      <div className="mt-8 flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h1 className="mt-4 text-xl font-bold">Authenticating with AniList</h1>
        <p className="mt-2 text-muted-foreground">Please wait while we complete your authentication...</p>
      </div>
    </div>
  );
} 