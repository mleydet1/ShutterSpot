import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, CheckCircle, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCalendar } from "@/hooks/use-calendar";

export default function CalendarSettingsPage() {
  const { toast } = useToast();
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const { getGoogleAuthUrl, downloadIcal } = useCalendar();
  
  // Check if Google Calendar is connected
  const { data: googleConnected, isLoading: checkingGoogleConnection } = useQuery({
    queryKey: ['/api/calendar/google/status'],
    retry: false,
    // If the request fails, we assume it's not connected
    onError: () => false 
  });
  
  const handleConnectGoogle = async () => {
    try {
      setConnectingGoogle(true);
      const authUrl = await getGoogleAuthUrl();
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingGoogle(false);
    }
  };
  
  const handleDownloadICalUpcoming = () => {
    downloadIcal('upcoming');
    toast({
      title: "Success",
      description: "Downloaded iCal file for upcoming shoots.",
    });
  };
  
  const handleDownloadICalAll = () => {
    downloadIcal('all');
    toast({
      title: "Success",
      description: "Downloaded iCal file for all shoots.",
    });
  };
  
  return (
    <MainLayout title="Calendar Settings" description="Configure calendar integrations and sync options">
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="integrations">Calendar Integrations</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Connect your Google Calendar to automatically sync shoots and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {googleConnected ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Google Calendar Connected</AlertTitle>
                    <AlertDescription>
                      Your shoots will automatically sync with Google Calendar.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-blue-50 border-blue-200">
                    <CalendarCheck className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Connect Google Calendar</AlertTitle>
                    <AlertDescription>
                      Authorize access to add shoots to your Google Calendar.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleConnectGoogle} 
                  disabled={connectingGoogle || checkingGoogleConnection}
                  variant={googleConnected ? "outline" : "default"}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {googleConnected ? "Reconnect Google Calendar" : "Connect Google Calendar"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Other Calendar Services</CardTitle>
                <CardDescription>
                  Export and sync options for other calendar applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">iCalendar Format</h3>
                      <p className="text-xs text-gray-500">
                        Export shoots as .ics files compatible with Apple Calendar, Outlook, and others
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleDownloadICalUpcoming} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Upcoming Shoots
                      </Button>
                      <Button onClick={handleDownloadICalAll} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        All Shoots
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Calendar Subscription Links</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Use these links to subscribe to your shoots in any calendar app that supports iCal feeds
                    </p>
                    
                    <div className="rounded-md bg-gray-50 p-3 text-xs font-mono">
                      {window.location.origin}/api/calendar/ical/shoots
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-500">
                      For upcoming shoots only:
                    </p>
                    
                    <div className="rounded-md bg-gray-50 p-3 text-xs font-mono">
                      {window.location.origin}/api/calendar/ical/shoots/upcoming
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Configure how your shoots are exported to external calendars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Shoot Details in Calendar</h3>
                <p className="text-sm text-gray-500">
                  The following information is included when syncing shoots to external calendars:
                </p>
                
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Shoot title and description</li>
                  <li>Date and time information</li>
                  <li>Location details</li>
                  <li>Client name</li>
                  <li>Shoot type and package information</li>
                </ul>
                
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTitle>Privacy Note</AlertTitle>
                  <AlertDescription>
                    Please be aware that when you sync shoots with external calendar services,
                    shoot information will be stored on those platforms according to their privacy policies.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}