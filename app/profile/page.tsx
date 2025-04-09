"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, User as UserIcon, Clock, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
                <Avatar className="h-24 w-24 border">
                  <AvatarImage 
                    src={user.avatarUrl || "https://i.pravatar.cc/150?img=24"} 
                    alt={user.name} 
                  />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">{user.name}</h3>
                    {user.provider === "mal" && (
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 72 72"
                          className="mr-1"
                        >
                          <path fill="#1100ff" d="M48 16H24a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V24a8 8 0 0 0-8-8Z"/>
                          <path fill="#fff" d="M34 52h-6V20h6zm4-32h6v20l-6-3zm0 20 6 3v9h-6z"/>
                        </svg>
                        <span className="text-xs text-muted-foreground">MyAnimeList User</span>
                      </div>
                    )}
                  </div>
                </div>
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
                        {/* Only show MAL ID if available */}
                        {anime.malId && (
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 72 72"
                              className="mr-1"
                            >
                              <path fill="#1100ff" d="M48 16H24a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V24a8 8 0 0 0-8-8Z"/>
                              <path fill="#fff" d="M34 52h-6V20h6zm4-32h6v20l-6-3zm0 20 6 3v9h-6z"/>
                            </svg>
                            <span className="text-xs text-blue-400">ID: {anime.malId}</span>
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