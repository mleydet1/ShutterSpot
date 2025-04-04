import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCalendar() {
  const { toast } = useToast();
  
  // Get Google auth URL for authorization
  const getGoogleAuthUrl = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/calendar/google/auth');
      if (!response.ok) {
        throw new Error(`Failed to get Google auth URL: ${response.statusText}`);
      }
      const data = await response.json();
      return data.authUrl || null;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Google Calendar authorization.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  // Handle Google auth callback
  const handleGoogleAuthCallback = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/calendar/google/callback?code=${encodeURIComponent(code)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to complete Google auth: ${response.statusText}`);
      }
      
      // Invalidate any cached status
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/google/status'] });
      
      return true;
    } catch (error) {
      console.error('Error handling Google auth callback:', error);
      throw error;
    }
  };
  
  // Add shoot to Google Calendar
  const addShootToGoogleCalendar = useMutation({
    mutationFn: async (shootId: number) => {
      const response = await fetch(`/api/calendar/google/shoots/${shootId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to add shoot to Google Calendar: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shoot added to Google Calendar successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add shoot to Google Calendar.",
        variant: "destructive",
      });
    }
  });
  
  // Download iCal file
  const downloadIcal = (type: 'upcoming' | 'all' | number) => {
    try {
      let url = '';
      
      if (typeof type === 'number') {
        // Single shoot
        url = `/api/calendar/ical/shoots/${type}`;
      } else if (type === 'upcoming') {
        // Upcoming shoots
        url = '/api/calendar/ical/shoots/upcoming';
      } else {
        // All shoots
        url = '/api/calendar/ical/shoots';
      }
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `pixelpro-shoots-${type}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error downloading iCal file:', error);
      toast({
        title: "Error",
        description: "Failed to download calendar file.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    getGoogleAuthUrl,
    handleGoogleAuthCallback,
    addShootToGoogleCalendar,
    downloadIcal,
  };
}