"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X, Plus, ListPlus, BookmarkPlus, Star, ListFilter, Edit, Play, Pause } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
      watching: "bg-blue-500 hover:bg-blue-600 text-white",
      completed: "bg-green-500 hover:bg-green-600 text-white",
      on_hold: "bg-yellow-500 hover:bg-yellow-600 text-white",
      dropped: "bg-red-500 hover:bg-red-600 text-white",
      plan_to_watch: "bg-purple-500 hover:bg-purple-600 text-white"
    };
    
    return colorMap[status] || "bg-gray-500 hover:bg-gray-600 text-white";
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
        return <Plus className="h-4 w-4" />;
    }
  };

  // Render different UI based on whether the anime is in list or not
  if (compact) {
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={listStatus ? "default" : "outline"} 
              size="sm" 
              className={cn(
                "h-9 w-full relative", 
                listStatus ? getStatusColor(listStatus.status) : "",
                isLoading ? "opacity-70" : ""
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : listStatus ? (
                <>
                  {getStatusIcon(listStatus.status)}
                  <span className="ml-2">{getStatusLabel(listStatus.status)}</span>
                </>
              ) : (
                <>
                  <ListPlus className="h-4 w-4 mr-2" />
                  <span>Add to List</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuLabel className="text-center">
              Set Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="gap-2"
                onClick={() => updateStatus("watching")}
              >
                <Play className="h-4 w-4" />
                <span>Watching</span>
                {listStatus?.status === "watching" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2"
                onClick={() => updateStatus("completed")}
              >
                <Check className="h-4 w-4" />
                <span>Completed</span>
                {listStatus?.status === "completed" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2"
                onClick={() => updateStatus("on_hold")}
              >
                <Pause className="h-4 w-4" />
                <span>On Hold</span>
                {listStatus?.status === "on_hold" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2"
                onClick={() => updateStatus("dropped")}
              >
                <X className="h-4 w-4" />
                <span>Dropped</span>
                {listStatus?.status === "dropped" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2"
                onClick={() => updateStatus("plan_to_watch")}
              >
                <BookmarkPlus className="h-4 w-4" />
                <span>Plan to Watch</span>
                {listStatus?.status === "plan_to_watch" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {listStatus && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Anime Details</DialogTitle>
              <DialogDescription>
                Update your tracking details for {title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={listStatus?.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watching">Watching</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                    <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="score">Score</Label>
                  <span className="text-sm text-muted-foreground">{editScore}/10</span>
                </div>
                <Slider
                  id="score"
                  min={0}
                  max={10}
                  step={1}
                  value={[editScore]}
                  onValueChange={(value) => setEditScore(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="episodes">Episodes Watched</Label>
                  {totalEpisodes > 0 && (
                    <span className="text-sm text-muted-foreground">{editEpisodes}/{totalEpisodes}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="episodes"
                    min={0}
                    max={totalEpisodes > 0 ? totalEpisodes : 999}
                    value={editEpisodes}
                    onChange={(e) => setEditEpisodes(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  {totalEpisodes > 0 && (
                    <div className="flex-1">
                      <Slider
                        min={0}
                        max={totalEpisodes}
                        step={1}
                        value={[editEpisodes]}
                        onValueChange={(value) => setEditEpisodes(value[0])}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={updateAnimeDetails} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full version for detailed display (not compact)
  return (
    <div className={`${className} space-y-3`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 72 72"
            className=""
          >
            <path fill="#1100ff" d="M48 16H24a8 8 0 0 0-8 8v24a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V24a8 8 0 0 0-8-8Z"/>
            <path fill="#fff" d="M34 52h-6V20h6zm4-32h6v20l-6-3zm0 20 6 3v9h-6z"/>
          </svg>
          <h4 className="font-medium">Add to MyAnimeList</h4>
        </div>
      )}
      
      <div className="space-y-2 bg-gray-900 rounded-lg p-4 border border-gray-800">
        {status && (
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("py-1", getStatusColor(status))}>
                {getStatusIcon(status)}
                <span className="ml-1">{getStatusLabel(status)}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="score" className="text-gray-400">Score</Label>
              <span className="font-semibold">
                {listStatus?.score ? `${listStatus.score}/10` : "Not rated"}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm mb-2">
          <Label htmlFor="progress" className="text-gray-400">Progress</Label>
          <span className="font-semibold">
            {listStatus ? listStatus.num_episodes_watched : 0}
            {totalEpisodes > 0 && `/${totalEpisodes}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant={status ? "secondary" : "default"} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : status ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to List
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Set Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => updateStatus("watching")}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                <span>Watching</span>
                {status === "watching" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateStatus("completed")}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Completed</span>
                {status === "completed" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateStatus("on_hold")}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                <span>On Hold</span>
                {status === "on_hold" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateStatus("dropped")}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                <span>Dropped</span>
                {status === "dropped" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateStatus("plan_to_watch")}
                className="gap-2"
              >
                <BookmarkPlus className="h-4 w-4" />
                <span>Plan to Watch</span>
                {status === "plan_to_watch" && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              {status && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Anime Details</DialogTitle>
            <DialogDescription>
              Update your tracking details for {title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={listStatus?.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="watching">Watching</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                  <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="score">Score</Label>
                <span className="text-sm text-muted-foreground">{editScore}/10</span>
              </div>
              <Slider
                id="score"
                min={0}
                max={10}
                step={1}
                value={[editScore]}
                onValueChange={(value) => setEditScore(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="episodes">Episodes Watched</Label>
                {totalEpisodes > 0 && (
                  <span className="text-sm text-muted-foreground">{editEpisodes}/{totalEpisodes}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  id="episodes"
                  min={0}
                  max={totalEpisodes > 0 ? totalEpisodes : undefined}
                  value={editEpisodes}
                  onChange={(e) => setEditEpisodes(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                {totalEpisodes > 0 && (
                  <div className="flex-1">
                    <Slider
                      min={0}
                      max={totalEpisodes}
                      step={1}
                      value={[editEpisodes]}
                      onValueChange={(value) => setEditEpisodes(value[0])}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateAnimeDetails} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 