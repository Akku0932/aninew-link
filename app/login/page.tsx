"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ANILIST_CLIENT_ID = "15054";
const ANILIST_REDIRECT_URI = "http://localhost:3000/auth/callback";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAniListLogin = () => {
    setIsLoading(true);
    const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${ANILIST_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      ANILIST_REDIRECT_URI
    )}&response_type=code`;
    window.location.href = authUrl;
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card className="border-2 border-gray-800 bg-gradient-to-b from-gray-900 to-black">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-3 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-9 w-9 text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">
              Connect with your AniList account to sync your anime lists and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              onClick={handleAniListLogin}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <path d="M6.36 0L0 12.93V24H6.36V12.93L12.72 0H6.36Z" fill="currentColor"/>
                <path d="M17.52 6.3H23.88L17.52 19.41L11.34 6.3H17.52Z" fill="currentColor"/>
                <path d="M17.52 24H23.88V6.3H17.52V24Z" fill="currentColor"/>
              </svg>
              {isLoading ? "Connecting..." : "Continue with AniList"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-400">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-blue-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-blue-400">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 