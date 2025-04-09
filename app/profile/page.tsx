"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, User as UserIcon, Clock, Settings, LogOut, List, Search, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AnimeFavoriteButton from "@/components/anime-favorite-button";

// Define types for MyAnimeList data
type MALAnime = {
  node: {
    id: number;
    title: string;
    main_picture: {
      medium: string;
      large: string;
    };
    media_type: string;
    num_episodes: number;
    status: string;
    start_date?: string;
    end_date?: string;
    mean?: number;
  };
  list_status: {
    status: string;
    score: number;
    num_episodes_watched: number;
    is_rewatching: boolean;
    updated_at: string;
  };
}

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'watching': return 'bg-blue-500 text-white';
    case 'completed': return 'bg-green-500 text-white';
    case 'on_hold': return 'bg-yellow-500 text-white';
    case 'dropped': return 'bg-red-500 text-white';
    case 'plan_to_watch': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Get status label
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'watching': return 'Watching';
    case 'completed': return 'Completed';
    case 'on_hold': return 'On Hold';
    case 'dropped': return 'Dropped';
    case 'plan_to_watch': return 'Plan to Watch';
    default: return status;
  }
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, callMALAPI, favorites, removeFromFavorites } = useAuth();
  const router = useRouter();
  const [malAnimeList, setMalAnimeList] = useState<MALAnime[]>([]);
  const [isLoadingMAL, setIsLoadingMAL] = useState(false);
  const [malError, setMalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch MyAnimeList data
  useEffect(() => {
    const fetchMALList = async () => {
      if (!user?.malToken) return;

      setIsLoadingMAL(true);
      try {
        // Fields to request from MAL API
        const fields = [
          'list_status',
          'title',
          'main_picture',
          'status',
          'media_type',
          'num_episodes',
          'start_date',
          'end_date',
          'mean'
        ].join(',');

        // Fetch anime list from MAL API
        const data = await callMALAPI('users/@me/animelist', {
          fields,
          limit: 100,
          sort: 'list_updated_at',
          nsfw: true
        });

        if (data.data) {
          setMalAnimeList(data.data);
        }
      } catch (error) {
        console.error('Error fetching MAL list:', error);
        setMalError('Failed to fetch anime list from MyAnimeList');
      } finally {
        setIsLoadingMAL(false);
      }
    };

    if (user?.malToken) {
      fetchMALList();
    }
  }, [user, callMALAPI]);

  // Filter anime list by search query and status
  const filteredAnimeList = malAnimeList.filter(anime => {
    const matchesSearch = anime.node.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = currentFilter === 'all' || anime.list_status.status === currentFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter favorites by search query
  const filteredFavorites = favorites ? favorites.filter(anime => 
    anime.title.toLowerCase().includes(favoritesSearchQuery.toLowerCase())
  ) : [];

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
          <Tabs defaultValue="anime-list" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="anime-list">
                <List className="mr-2 h-4 w-4" />
                MyAnimeList
              </TabsTrigger>
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
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">My Favorites</h3>
                </div>
                
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search favorites..."
                      className="pl-8"
                      value={favoritesSearchQuery}
                      onChange={(e) => setFavoritesSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {filteredFavorites.length === 0 ? (
                  <div className="rounded-lg border bg-card p-8 text-center">
                    <Heart className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-30" />
                    <h4 className="text-lg font-medium">No favorites found</h4>
                    <p className="text-sm text-muted-foreground">
                      {favoritesSearchQuery ? "Try a different search query" : "Add anime to your favorites from the anime info page"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFavorites.map((anime) => (
                      <div 
                        key={anime.id} 
                        className="flex overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                      >
                        <div className="relative h-[120px] w-[85px] flex-shrink-0">
                          <Image
                            src={anime.image || "/placeholder.svg"}
                            alt={anime.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-between p-3 flex-1">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium line-clamp-2 text-sm">{anime.title}</h4>
                              <Badge className="flex-shrink-0 text-xs bg-pink-500 hover:bg-pink-600">
                                Favorite
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center text-xs text-muted-foreground">
                              <span>{anime.type || "Anime"}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-xs h-7 px-2 py-1 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                              onClick={() => removeFromFavorites(anime.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" asChild className="text-xs h-7 px-2 py-1">
                                <Link href={`/info/${anime.id}`}>
                                  Info
                                </Link>
                              </Button>
                              <Button size="sm" variant="default" asChild className="text-xs h-7 px-2 py-1">
                                <Link href={`/watch/${anime.id}`}>
                                  Watch
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="anime-list" className="mt-6">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">My Anime List</h3>
                  {user?.malToken && (
                    <a 
                      href="https://myanimelist.net/animelist/username" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 72 72"
                        className="mr-1"
                      >
                        <path fill="#1100ff" d="M48 16H24a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V24a8 8 0 0 0-8-8Z"/>
                        <path fill="#fff" d="M34 52h-6V20h6zm4-32h6v20l-6-3zm0 20 6 3v9h-6z"/>
                      </svg>
                      View on MyAnimeList
                    </a>
                  )}
                </div>
                
                {user?.malToken ? (
                  <>
                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search anime..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge 
                          variant={currentFilter === "all" ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setCurrentFilter("all")}
                        >
                          All
                        </Badge>
                        <Badge 
                          variant={currentFilter === "watching" ? "default" : "outline"}
                          className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                          onClick={() => setCurrentFilter("watching")}
                        >
                          Watching
                        </Badge>
                        <Badge 
                          variant={currentFilter === "completed" ? "default" : "outline"}
                          className="cursor-pointer bg-green-500 hover:bg-green-600" 
                          onClick={() => setCurrentFilter("completed")}
                        >
                          Completed
                        </Badge>
                        <Badge 
                          variant={currentFilter === "plan_to_watch" ? "default" : "outline"}
                          className="cursor-pointer bg-purple-500 hover:bg-purple-600"
                          onClick={() => setCurrentFilter("plan_to_watch")}
                        >
                          Plan to Watch
                        </Badge>
                      </div>
                    </div>
                  
                    {isLoadingMAL ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : malError ? (
                      <div className="rounded-lg border bg-card p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          {malError}
                        </p>
                      </div>
                    ) : filteredAnimeList.length === 0 ? (
                      <div className="rounded-lg border bg-card p-8 text-center">
                        <List className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-30" />
                        <h4 className="text-lg font-medium">No anime found</h4>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery ? "Try a different search query" : "Add anime to your list on MyAnimeList"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredAnimeList.map((anime) => (
                          <div 
                            key={anime.node.id} 
                            className="flex overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                          >
                            <div className="relative h-[120px] w-[85px] flex-shrink-0">
                              <Image
                                src={anime.node.main_picture?.medium || "/placeholder.svg"}
                                alt={anime.node.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col justify-between p-3 flex-1">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-medium line-clamp-2 text-sm">{anime.node.title}</h4>
                                  <Badge className={`flex-shrink-0 text-xs ${getStatusColor(anime.list_status.status)}`}>
                                    {getStatusLabel(anime.list_status.status)}
                                  </Badge>
                                </div>
                                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                  <span>{anime.node.media_type || "Anime"}</span>
                                  {anime.node.num_episodes > 0 && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>{anime.node.num_episodes} eps</span>
                                    </>
                                  )}
                                  {anime.node.mean && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>Score: {anime.node.mean}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                  {anime.list_status.num_episodes_watched > 0 && (
                                    <span>Watched: {anime.list_status.num_episodes_watched} eps</span>
                                  )}
                                </div>
                                <Button size="sm" variant="ghost" asChild className="text-xs h-7 px-2 py-1">
                                  <Link href={`/info/${anime.node.id.toString()}`}>
                                    View
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border bg-card p-8 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 72 72"
                      className="mx-auto mb-4"
                    >
                      <path fill="#1100ff" d="M48 16H24a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V24a8 8 0 0 0-8-8Z"/>
                      <path fill="#fff" d="M34 52h-6V20h6zm4-32h6v20l-6-3zm0 20 6 3v9h-6z"/>
                    </svg>
                    <h4 className="text-lg font-medium">Connect with MyAnimeList</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Link your account to sync your anime list
                    </p>
                    <Button asChild>
                      <Link href="/api/auth/mal">Connect with MyAnimeList</Link>
                    </Button>
                  </div>
                )}
              </div>
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