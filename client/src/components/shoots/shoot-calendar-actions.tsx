import { useState } from "react";
import { Calendar, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalendar } from "@/hooks/use-calendar";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ShootCalendarActionsProps {
  shootId: number;
  compact?: boolean;
}

export function ShootCalendarActions({ shootId, compact = false }: ShootCalendarActionsProps) {
  const { toast } = useToast();
  const [isAddingToGoogle, setIsAddingToGoogle] = useState(false);
  const { addShootToGoogleCalendar, downloadIcal } = useCalendar();
  
  // Check if Google Calendar is connected
  const { data: googleConnected, isLoading: checkingGoogleConnection } = useQuery({
    queryKey: ['/api/calendar/google/status'],
    retry: false,
    // If the request fails, we assume it's not connected
    onError: () => false
  });
  
  const handleAddToGoogleCalendar = async () => {
    if (!googleConnected) {
      toast({
        title: "Google Calendar Not Connected",
        description: "Please connect your Google Calendar in the Calendar Settings first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAddingToGoogle(true);
      await addShootToGoogleCalendar.mutateAsync(shootId);
    } finally {
      setIsAddingToGoogle(false);
    }
  };
  
  const handleDownloadIcal = () => {
    downloadIcal(shootId);
    toast({
      title: "Success",
      description: "Downloaded iCal file for this shoot.",
    });
  };
  
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Calendar Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Calendar Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleAddToGoogleCalendar}
            disabled={isAddingToGoogle || addShootToGoogleCalendar.isPending || !googleConnected || checkingGoogleConnection}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Add to Google Calendar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadIcal}>
            <Download className="mr-2 h-4 w-4" />
            Download as iCal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleAddToGoogleCalendar}
        disabled={isAddingToGoogle || addShootToGoogleCalendar.isPending || !googleConnected || checkingGoogleConnection}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {isAddingToGoogle || addShootToGoogleCalendar.isPending ? "Adding..." : "Add to Google Calendar"}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleDownloadIcal}
      >
        <Download className="mr-2 h-4 w-4" />
        Download as iCal
      </Button>
    </div>
  );
}