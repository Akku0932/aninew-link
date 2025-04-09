"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, User as UserIcon, Clock, Settings, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-24 w-24">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-3xl font-semibold text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.provider === "anilist" && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.36 0L0 12.93V24H6.36V12.93L12.72 0H6.36Z" fill="#02A9FF"/>
                      <path d="M17.52 6.3H23.88L17.52 19.41L11.34 6.3H17.52Z" fill="#02A9FF"/>
                      <path d="M17.52 24H23.88V6.3H17.52V24Z" fill="#02A9FF"/>
                    </svg>
                    <span className="text-xs text-muted-foreground">AniList User</span>
                  </div>
                )}
              </div>
              
              <div className="flex w-full flex-col space-y-2">
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="/profile/edit">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="favorites">
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="watch-history">
                <Clock className="mr-2 h-4 w-4" />
                Watch History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="mt-6">
              <h3 className="mb-4 text-lg font-semibold">Favorite Anime</h3>
              
              {!user.favorites || user.favorites.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <Heart className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-30" />
                  <h4 className="text-lg font-medium">No favorites yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Anime you save will appear here
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/">Browse Anime</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.favorites.map((anime) => (
                    <Link 
                      key={anime.id} 
                      href={`/info/${anime.id}`}
                      className="group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[2/3] w-full">
                        <Image
                          src={anime.image}
                          alt={anime.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="line-clamp-2 font-medium">{anime.title}</h4>
                        <div className="mt-1 flex justify-between">
                          <span className="text-xs text-muted-foreground">{anime.type || "Anime"}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(anime.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {anime.anilistId && (
                          <div className="mt-2 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6.36 0L0 12.93V24H6.36V12.93L12.72 0H6.36Z" fill="#02A9FF"/>
                              <path d="M17.52 6.3H23.88L17.52 19.41L11.34 6.3H17.52Z" fill="#02A9FF"/>
                              <path d="M17.52 24H23.88V6.3H17.52V24Z" fill="#02A9FF"/>
                            </svg>
                            <span className="text-xs text-blue-400">ID: {anime.anilistId}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="watch-history" className="mt-6">
              <h3 className="mb-4 text-lg font-semibold">Watch History</h3>
              <div className="rounded-lg border bg-card p-8 text-center">
                <Clock className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-30" />
                <h4 className="text-lg font-medium">Coming Soon</h4>
                <p className="text-sm text-muted-foreground">
                  Watch history feature will be available soon
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 