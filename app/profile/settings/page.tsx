"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Moon, Sun, Globe, Bell, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Settings state
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("english");
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSkipIntro, setAutoSkipIntro] = useState(true);
  const [autoNextEpisode, setAutoNextEpisode] = useState(true);
  const [videoQuality, setVideoQuality] = useState("auto");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    
    // Load settings from localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "system";
      const savedLanguage = localStorage.getItem("language") || "english";
      const savedAutoplay = localStorage.getItem("autoplay");
      const savedNotifications = localStorage.getItem("notifications");
      const savedAutoSkipIntro = localStorage.getItem("autoSkipIntro");
      const savedAutoNextEpisode = localStorage.getItem("autoNextEpisode");
      const savedVideoQuality = localStorage.getItem("videoQuality") || "auto";
      
      setTheme(savedTheme);
      setLanguage(savedLanguage);
      setAutoplay(savedAutoplay === null ? true : savedAutoplay === "true");
      setNotifications(savedNotifications === null ? true : savedNotifications === "true");
      setAutoSkipIntro(savedAutoSkipIntro === null ? true : savedAutoSkipIntro === "true");
      setAutoNextEpisode(savedAutoNextEpisode === null ? true : savedAutoNextEpisode === "true");
      setVideoQuality(savedVideoQuality);
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      // Save settings to localStorage
      localStorage.setItem("theme", theme);
      localStorage.setItem("language", language);
      localStorage.setItem("autoplay", String(autoplay));
      localStorage.setItem("notifications", String(notifications));
      localStorage.setItem("autoSkipIntro", String(autoSkipIntro));
      localStorage.setItem("autoNextEpisode", String(autoNextEpisode));
      localStorage.setItem("videoQuality", videoQuality);
      
      // Apply theme change
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
      }
      
      setTimeout(() => {
        setSaveMessage("Settings saved successfully!");
        setIsSaving(false);
      }, 800);
    } catch (error) {
      setSaveMessage("Failed to save settings. Please try again.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // This should not happen due to the redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/profile" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Sun className="h-5 w-5 mr-2 text-orange-500" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how the app looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color theme
                </p>
              </div>
              <Select
                value={theme}
                onValueChange={setTheme}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="language">Language</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Playback */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-500" />
              <CardTitle>Playback</CardTitle>
            </div>
            <CardDescription>
              Control your anime viewing experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay">Autoplay</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically play videos when the page loads
                </p>
              </div>
              <Switch
                id="autoplay"
                checked={autoplay}
                onCheckedChange={setAutoplay}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSkipIntro">Auto-skip Intro</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically skip opening sequences when available
                </p>
              </div>
              <Switch
                id="autoSkipIntro"
                checked={autoSkipIntro}
                onCheckedChange={setAutoSkipIntro}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoNextEpisode">Auto-play Next Episode</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically play the next episode when the current one ends
                </p>
              </div>
              <Switch
                id="autoNextEpisode"
                checked={autoNextEpisode}
                onCheckedChange={setAutoNextEpisode}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="videoQuality">Video Quality</Label>
                <p className="text-sm text-muted-foreground">
                  Set your preferred video streaming quality
                </p>
              </div>
              <Select
                value={videoQuality}
                onValueChange={setVideoQuality}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Recommended)</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="360p">360p</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-red-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Control how and when we notify you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about new episodes and updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
              Saving...
            </>
          ) : "Save Settings"}
        </Button>
      </div>
      
      {saveMessage && (
        <div className="mt-4 rounded-md bg-green-50 p-4 dark:bg-green-950/30">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {saveMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 