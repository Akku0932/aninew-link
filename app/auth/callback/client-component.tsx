"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Logo from "@/components/logo";

export default function ClientAuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithAniList } = useAuth();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        
        // Check for error parameter from AniList
        if (error) {
          setStatus("error");
          setErrorMessage(`AniList returned an error: ${error}`);
          return;
        }
        
        // If code is missing, redirect to login
        if (!code) {
          setStatus("error");
          setErrorMessage("Authorization code missing. Please try again.");
          return;
        }

        console.log("Attempting to login with code:", code);
        
        // Authentication handled in auth context
        await loginWithAniList(code);
        setStatus("success");
        
        // Redirect to homepage after successful login
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
      }
    }

    handleAuthCallback();
  }, [searchParams, loginWithAniList, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 dark:bg-gray-900 bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-md">
        <div className="flex flex-col items-center text-center">
          <Logo size="large" />
          
          {status === "loading" && (
            <>
              <h1 className="mt-6 text-xl font-semibold">Authenticating with AniList</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please wait while we verify your account...</p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-primary"></div>
              </div>
            </>
          )}
          
          {status === "success" && (
            <>
              <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-4 text-xl font-semibold">Successfully logged in!</h1>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting you to the homepage...</p>
            </>
          )}
          
          {status === "error" && (
            <>
              <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="mt-4 text-xl font-semibold">Authentication failed</h1>
              <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errorMessage}</p>
              <button 
                onClick={() => router.push("/login")}
                className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Return to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 