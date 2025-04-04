import { useEffect, useState } from "react";
import { useLocation, useRouter } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useCalendar } from "@/hooks/use-calendar";

export default function GoogleCalendarCallback() {
  const [location] = useLocation();
  const [, navigate] = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const { handleGoogleAuthCallback } = useCalendar();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the code from URL
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        
        if (!code) {
          setStatus("error");
          setError("No authorization code found in the URL");
          return;
        }
        
        // Process the authorization code
        await handleGoogleAuthCallback(code);
        setStatus("success");
      } catch (err) {
        console.error("Error processing Google Calendar callback:", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };
    
    handleCallback();
  }, [location, handleGoogleAuthCallback]);
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar Integration
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Processing your authorization..."}
              {status === "success" && "Successfully connected to Google Calendar"}
              {status === "error" && "Failed to connect to Google Calendar"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex justify-center py-6">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-sm text-gray-500">Please wait while we set up the connection...</p>
              </div>
            )}
            
            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-green-50 rounded-full p-3 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Connection Successful</h3>
                <p className="text-sm text-gray-500 text-center">
                  Your Google Calendar account has been successfully connected. 
                  You can now sync your shoots to your calendar.
                </p>
              </div>
            )}
            
            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-red-50 rounded-full p-3 mb-4">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Connection Failed</h3>
                <p className="text-sm text-red-500 text-center mb-2">
                  {error || "An error occurred while connecting to Google Calendar."}
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/calendar/settings")}>
              Return to Calendar Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}