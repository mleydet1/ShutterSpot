import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api";
import { PhotoGallery } from "@/components/galleries/photo-gallery";
import { DriveConnectModal } from "@/components/galleries/drive-connect-modal";
import { useAuth } from "@/hooks/use-auth";
import { 
  CloudUpload, 
  RefreshCw, 
  Lock, 
  Calendar, 
  User, 
  Camera 
} from "lucide-react";

interface Gallery {
  id: number;
  title: string;
  description: string;
  client_id: number;
  shoot_id: number | null;
  password: string | null;
  expiry_date: string | null;
  status: string;
  client: {
    id: number;
    name: string;
    email: string;
  };
  shoot?: {
    id: number;
    title: string;
    date: string;
  };
}

interface DriveConnection {
  id: number;
  gallery_id: number;
  drive_folder_id: string;
  drive_folder_name: string;
  last_synced: string | null;
  auto_sync: boolean;
}

export default function GalleryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const galleryId = parseInt(id || "0");
  const { user } = useAuth();
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");

  // Fetch gallery details
  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ["gallery", galleryId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/galleries/${galleryId}`);
        return await response.json() as Gallery;
      } catch (error) {
        console.error("Error fetching gallery:", error);
        throw error;
      }
    },
    enabled: !!galleryId,
  });

  // Fetch Drive connections
  const { 
    data: driveConnections, 
    isLoading: connectionsLoading,
    refetch: refetchConnections
  } = useQuery({
    queryKey: ["drive-connections", galleryId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/drive/connections");
        const connections = await response.json();
        return connections.filter((conn: DriveConnection) => conn.gallery_id === galleryId);
      } catch (error) {
        console.error("Error fetching drive connections:", error);
        return [];
      }
    },
    enabled: !!galleryId && !!user && user.role === "admin",
  });

  // Handle manual sync
  const handleSyncFolder = async (connectionId: number) => {
    try {
      const response = await apiRequest("POST", `/api/drive/connections/${connectionId}/sync`);
      const result = await response.json();
      toast.success(`Synchronized ${result.photos_count} photos`);
      // Refresh the photo gallery
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Failed to sync folder");
      console.error("Error syncing folder:", error);
    }
  };

  // Check if user is the photographer (admin) or the client
  const isPhotographer = user?.role === "admin";
  const isClient = user?.id === gallery?.client_id;
  const canViewGallery = isPhotographer || isClient || gallery?.status === "Active";

  if (galleryLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-1/3 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Gallery Not Found</h1>
        <p>The gallery you're looking for doesn't exist or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{gallery.title}</h1>
          <p className="text-gray-500 mt-1">{gallery.description}</p>
        </div>
        
        {isPhotographer && (
          <div className="mt-4 md:mt-0 space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setDriveModalOpen(true)}
            >
              <CloudUpload className="mr-2 h-4 w-4" />
              Connect Google Drive
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="col-span-1 md:col-span-3">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-sm">
              <User className="mr-2 h-4 w-4 text-gray-500" />
              <span className="font-medium">Client:</span>
              <span className="ml-1">{gallery.client.name}</span>
            </div>
            
            {gallery.shoot && (
              <div className="flex items-center text-sm">
                <Camera className="mr-2 h-4 w-4 text-gray-500" />
                <span className="font-medium">Shoot:</span>
                <span className="ml-1">{gallery.shoot.title}</span>
              </div>
            )}
            
            {gallery.expiry_date && (
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span className="font-medium">Expires:</span>
                <span className="ml-1">{new Date(gallery.expiry_date).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm">
              <Lock className="mr-2 h-4 w-4 text-gray-500" />
              <span className="font-medium">Status:</span>
              <span className="ml-1 capitalize">{gallery.status}</span>
            </div>
          </div>
        </div>

        {isPhotographer && driveConnections && driveConnections.length > 0 && (
          <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Connected Drive Folders</h3>
            <div className="space-y-3">
              {driveConnections.map((connection: DriveConnection) => (
                <div key={connection.id} className="bg-white p-3 rounded border">
                  <p className="font-medium text-sm truncate">{connection.drive_folder_name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {connection.last_synced 
                        ? `Last synced: ${new Date(connection.last_synced).toLocaleString()}`
                        : "Never synced"}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSyncFolder(connection.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {canViewGallery ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            {isPhotographer && <TabsTrigger value="stats">Statistics</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="photos" className="mt-0">
            <PhotoGallery galleryId={galleryId} clientView={!isPhotographer} />
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-0">
            <div className="text-center py-8">
              <p className="text-gray-500">Coming soon: View your favorited photos here.</p>
            </div>
          </TabsContent>
          
          {isPhotographer && (
            <TabsContent value="stats" className="mt-0">
              <div className="text-center py-8">
                <p className="text-gray-500">Coming soon: View statistics about client interactions with your photos.</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Lock className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">This Gallery is Private</h3>
          <p className="text-gray-600 mb-4">
            This gallery is currently private or password-protected. Please contact the photographer for access.
          </p>
        </div>
      )}

      {/* Google Drive Connect Modal */}
      <DriveConnectModal
        open={driveModalOpen}
        onOpenChange={setDriveModalOpen}
        onSuccess={() => {
          refetchConnections();
          setActiveTab("photos");
        }}
      />
    </div>
  );
}
