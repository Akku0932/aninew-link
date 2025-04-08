import { Suspense } from "react";
import ClientAuthCallback from "./client-component";
import Logo from "@/components/logo";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 dark:bg-gray-900 bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-md">
        <div className="flex flex-col items-center text-center">
          <Logo size="large" />
          <h1 className="mt-6 text-xl font-semibold">Initializing...</h1>
          <p className="mt-2 text-sm text-muted-foreground">Loading authentication...</p>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientAuthCallback />
    </Suspense>
  );
} 