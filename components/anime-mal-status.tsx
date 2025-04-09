"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X, Plus, ListPlus, BookmarkPlus, Star, ListFilter, Edit } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// Define the MyAnimeList status types
type AnimeStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

interface MALListStatus {
  status: AnimeStatus;
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  updated_at: string;
}

interface AnimeMALStatusProps {
  animeId: string;
  malId?: string | number;
  title: string;
  currentStatus?: AnimeStatus | null;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  totalEpisodes?: number;
}

export default function AnimeMALStatus({
  animeId,
  malId,
  title,
  currentStatus,
  className = "",
  showLabel = true,
  compact = false,
  totalEpisodes = 0
}: AnimeMALStatusProps) {
  const { user, isAuthenticated, callMALAPI } = useAuth();
  const [status, setStatus] = useState<AnimeStatus | null>(currentStatus || null);
  const [listStatus, setListStatus] = useState<MALListStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedMalId, setExtractedMalId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editScore, setEditScore] = useState<number>(0);
  const [editEpisodes, setEditEpisodes] = useState<number>(0);
  const router = useRouter();

  // Reset status display after showing success/error
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Try to extract MAL ID if not provided
  useEffect(() => {
    const fetchAnimeInfo = async () => {
      if (malId) {
        setExtractedMalId(String(malId));
        return;
      }
      
      try {
        const response = await fetch(`https://aninew-seven.vercel.app/info/${animeId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.info && data.info.malID) {
            setExtractedMalId(String(data.info.malID));
          }
        }
      } catch (error) {
        console.error("Error fetching anime info for MAL ID:", error);
      }
    };
    
    fetchAnimeInfo();
  }, [animeId, malId]);

  // Fetch current status if not provided and user is authenticated
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      if (!isAuthenticated || !user?.malToken || !extractedMalId) return;
      
      try {
        setIsLoading(true);
        const data = await callMALAPI(`anime/${extractedMalId}`, {
          fields: 'my_list_status'
        });
        
        if (data.my_list_status) {
          setListStatus(data.my_list_status);
          setStatus(data.my_list_status.status);
          setEditScore(data.my_list_status.score || 0);
          setEditEpisodes(data.my_list_status.num_episodes_watched || 0);
        }
      } catch (err) {
        console.error("Failed to fetch anime status:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrentStatus();
  }, [isAuthenticated, user, extractedMalId, callMALAPI, currentStatus]);

  const updateStatus = async (newStatus: AnimeStatus) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (!extractedMalId) {
      setError("No MyAnimeList ID found");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the status in MyAnimeList
      const result = await callMALAPI(`anime/${extractedMalId}/my_list_status`, {
        status: newStatus
      }, 'PUT');
      
      // Update local state with the new status
      if (result) {
        setListStatus(result);
        setStatus(newStatus);
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error updating anime status:", error);
      setError("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnimeDetails = async () => {
    if (!isAuthenticated || !extractedMalId) return;
    
    setIsLoading(true);
    
    try {
      const result = await callMALAPI(`anime/${extractedMalId}/my_list_status`, {
        score: editScore,
        num_watched_episodes: editEpisodes
      }, 'PUT');
      
      if (result) {
        setListStatus(result);
        setSuccess(true);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating anime details:", error);
      setError("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    updateStatus(value as AnimeStatus);
  };

  // Helper to get status label for display
  const getStatusLabel = (status: AnimeStatus): string => {
    const statusMap: Record<AnimeStatus, string> = {
      watching: "Watching",
      completed: "Completed",
      on_hold: "On Hold",
      dropped: "Dropped",
      plan_to_watch: "Plan to Watch"
    };
    
    return statusMap[status] || status;
  };

  // Helper to get status color
  const getStatusColor = (status: AnimeStatus): string => {
    const colorMap: Record<AnimeStatus, string> = {
      watching: "bg-blue-500 hover:bg-blue-600",
      completed: "bg-green-500 hover:bg-green-600",
      on_hold: "bg-yellow-500 hover:bg-yellow-600",
      dropped: "bg-red-500 hover:bg-red-600",
      plan_to_watch: "bg-purple-500 hover:bg-purple-600"
    };
    
    return colorMap[status] || "bg-gray-500 hover:bg-gray-600";
  };

  // Helper to get status icon
  const getStatusIcon = (status: AnimeStatus) => {
    switch (status) {
      case 'watching':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'on_hold':
        return <Pause className="h-4 w-4" />;
      case 'dropped':
        return <X className="h-4 w-4" />;
      case 'plan_to_watch':
        return <BookmarkPlus className="h-4 w-4" />;
      default:
        return <ListPlus className="h-4 w-4" />;
    }
  };

  // Convert numeric score to stars
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score / 2);
    const halfStar = score % 2 === 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
        {halfStar && <Star className="h-3 w-3 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <div className={className}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={isLoading}
                      className={cn(
                        "h-8 w-8 rounded-full relative",
                        status ? getStatusColor(status) : "bg-gray-700 hover:bg-gray-600",
                        "text-white border-0"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : status ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ListPlus className="h-4 w-4" />
                      )}
                      {success && !isLoading && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
                      )}
                      {error && !isLoading && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border border-white"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{status ? "Update status" : "Add to list"}</p>
                </TooltipContent>
                <DropdownMenuContent align="end" className="w-60">
                  {listStatus && (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{getStatusLabel(listStatus.status)}</span>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Score: {listStatus.score > 0 ? listStatus.score : 'N/A'}</span>
                          <span>Episodes: {listStatus.num_episodes_watched}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => updateStatus("watching")} className="text-blue-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                    Watching
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus("completed")} className="text-green-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus("plan_to_watch")} className="text-purple-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                    Plan to Watch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus("on_hold")} className="text-yellow-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    On Hold
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus("dropped")} className="text-red-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    Dropped
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </TooltipProvider>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit List Details</DialogTitle>
              <DialogDescription>
                Update your tracking details for "{title}"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status || undefined} 
                  onValueChange={(value) => updateStatus(value as AnimeStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watching" className="text-blue-500">Watching</SelectItem>
                    <SelectItem value="completed" className="text-green-500">Completed</SelectItem>
                    <SelectItem value="plan_to_watch" className="text-purple-500">Plan to Watch</SelectItem>
                    <SelectItem value="on_hold" className="text-yellow-500">On Hold</SelectItem>
                    <SelectItem value="dropped" className="text-red-500">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="score">Score (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="score"
                    min={0}
                    max={10}
                    step={1}
                    value={[editScore]}
                    onValueChange={(value) => setEditScore(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium">
                    {editScore > 0 ? editScore : '-'}
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="episodes">Episodes Watched</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="episodes"
                    type="number"
                    min={0}
                    max={totalEpisodes > 0 ? totalEpisodes : 999}
                    value={editEpisodes}
                    onChange={(e) => setEditEpisodes(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  {totalEpisodes > 0 && (
                    <span className="text-muted-foreground text-sm">/ {totalEpisodes}</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={updateAnimeDetails} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {showLabel && (
          <Label htmlFor="anime-status" className="text-sm text-gray-500 dark:text-gray-400">Add to MyAnimeList</Label>
        )}
        
        <div className="space-y-2">
          {listStatus ? (
            <div className="relative rounded-md border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block h-3 w-3 rounded-full", 
                    status === 'watching' ? "bg-blue-500" : 
                    status === 'completed' ? "bg-green-500" : 
                    status === 'on_hold' ? "bg-yellow-500" :
                    status === 'dropped' ? "bg-red-500" :
                    status === 'plan_to_watch' ? "bg-purple-500" : "bg-gray-500"
                  )}></span>
                  <span className="font-medium">{getStatusLabel(listStatus.status)}</span>
                </div>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </DialogTrigger>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Score</span>
                  <div className="flex items-center gap-1">
                    {listStatus.score > 0 ? (
                      <>
                        <span className="font-medium">{listStatus.score}</span>
                        {renderStars(listStatus.score)}
                      </>
                    ) : (
                      <span className="text-gray-400">Not rated</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                  <div>
                    <span className="font-medium">{listStatus.num_episodes_watched}</span>
                    {totalEpisodes > 0 && (
                      <span className="text-gray-500 dark:text-gray-400"> / {totalEpisodes}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ListFilter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => updateStatus("watching")} className="text-blue-500">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                      Watching
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus("completed")} className="text-green-500">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus("plan_to_watch")} className="text-purple-500">
                      <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                      Plan to Watch
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus("on_hold")} className="text-yellow-500">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                      On Hold
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus("dropped")} className="text-red-500">
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                      Dropped
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2 relative"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ListPlus className="h-4 w-4" />
                      Add to MyAnimeList
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem onClick={() => updateStatus("watching")} className="text-blue-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  Watching
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("completed")} className="text-green-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("plan_to_watch")} className="text-purple-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                  Plan to Watch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("on_hold")} className="text-yellow-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("dropped")} className="text-red-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Dropped
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit List Details</DialogTitle>
            <DialogDescription>
              Update your tracking details for "{title}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status || undefined} 
                onValueChange={(value) => updateStatus(value as AnimeStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="watching" className="text-blue-500">Watching</SelectItem>
                  <SelectItem value="completed" className="text-green-500">Completed</SelectItem>
                  <SelectItem value="plan_to_watch" className="text-purple-500">Plan to Watch</SelectItem>
                  <SelectItem value="on_hold" className="text-yellow-500">On Hold</SelectItem>
                  <SelectItem value="dropped" className="text-red-500">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="score">Score (1-10)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="score"
                  min={0}
                  max={10}
                  step={1}
                  value={[editScore]}
                  onValueChange={(value) => setEditScore(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center font-medium">
                  {editScore > 0 ? editScore : '-'}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="episodes">Episodes Watched</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="episodes"
                  type="number"
                  min={0}
                  max={totalEpisodes > 0 ? totalEpisodes : 999}
                  value={editEpisodes}
                  onChange={(e) => setEditEpisodes(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                {totalEpisodes > 0 && (
                  <span className="text-muted-foreground text-sm">/ {totalEpisodes}</span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={updateAnimeDetails} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 