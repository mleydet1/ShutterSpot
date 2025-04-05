import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, Loader2, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

interface Photo {
  id: number;
  gallery_id: number;
  filename: string;
  drive_file_id?: string;
  url?: string;
  thumbnail_url?: string;
  favorites_count: number;
  created_at: string;
  updated_at: string;
}

interface PhotoGalleryProps {
  galleryId: number;
  clientView?: boolean;
}

export function PhotoGallery({ galleryId, clientView = false }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch photos for the gallery
  const { data: photos, isLoading, error } = useQuery({
    queryKey: ["gallery-photos", galleryId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/photos/gallery/${galleryId}`);
        const data = await response.json();
        return data as Photo[];
      } catch (error) {
        console.error("Error fetching photos:", error);
        throw error;
      }
    },
  });

  // Fetch user's favorited photos
  const { data: userFavorites } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/photos/user/favorites");
        const data = await response.json();
        return data.map((photo: Photo) => photo.id);
      } catch (error) {
        console.error("Error fetching user favorites:", error);
        return [];
      }
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Mutation to favorite a photo
  const favoritePhoto = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await apiRequest("POST", `/api/photos/${photoId}/favorite`);
      return await response.json();
    },
    onSuccess: (_, photoId) => {
      toast.success("Photo added to favorites");
      queryClient.invalidateQueries({ queryKey: ["gallery-photos", galleryId] });
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
    onError: (error) => {
      toast.error("Failed to favorite photo");
      console.error("Error favoriting photo:", error);
    },
  });

  // Mutation to unfavorite a photo
  const unfavoritePhoto = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await apiRequest("DELETE", `/api/photos/${photoId}/favorite`);
      return await response.json();
    },
    onSuccess: (_, photoId) => {
      toast.success("Photo removed from favorites");
      queryClient.invalidateQueries({ queryKey: ["gallery-photos", galleryId] });
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
    onError: (error) => {
      toast.error("Failed to unfavorite photo");
      console.error("Error unfavoriting photo:", error);
    },
  });

  // Handle favoriting/unfavoriting
  const handleFavoriteToggle = (photo: Photo) => {
    if (!user) {
      toast.error("Please log in to favorite photos");
      return;
    }

    const isFavorited = userFavorites?.includes(photo.id);
    if (isFavorited) {
      unfavoritePhoto.mutate(photo.id);
    } else {
      favoritePhoto.mutate(photo.id);
    }
  };

  // Open lightbox with selected photo
  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    setLightboxOpen(true);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300); // Clear after animation
  };

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen || !photos) return;

      const currentIndex = selectedPhoto 
        ? photos.findIndex(p => p.id === selectedPhoto.id) 
        : -1;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight" && currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, selectedPhoto, photos]);

  // Handle download of original photo
  const handleDownload = (photo: Photo) => {
    if (photo.url) {
      window.open(photo.url, "_blank");
    } else {
      toast.error("Download URL not available");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading photos. Please try again later.</p>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No photos found in this gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="relative group aspect-square rounded-md overflow-hidden cursor-pointer"
            onClick={() => openLightbox(photo)}
          >
            {photo.thumbnail_url ? (
              <img
                src={photo.thumbnail_url}
                alt={photo.filename}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-sm text-gray-500">No preview</p>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white text-red-500 hover:bg-white hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(photo);
                  }}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      userFavorites?.includes(photo.id) ? "fill-red-500" : ""
                    )}
                  />
                </Button>
              </div>
              
              {photo.favorites_count > 0 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {photo.favorites_count} ♥
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle(selectedPhoto);
                }}
              >
                <Heart
                  className={cn(
                    "h-6 w-6",
                    userFavorites?.includes(selectedPhoto.id) ? "fill-red-500" : ""
                  )}
                />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedPhoto);
                }}
              >
                <Download className="h-6 w-6" />
              </Button>
              
              {selectedPhoto.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(selectedPhoto.url, "_blank");
                  }}
                >
                  <ExternalLink className="h-6 w-6" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
              {selectedPhoto.url ? (
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.filename}
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedPhoto.thumbnail_url ? (
                <img
                  src={selectedPhoto.thumbnail_url}
                  alt={selectedPhoto.filename}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white">Image not available</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-black bg-opacity-50 text-white">
              <h3 className="text-lg font-semibold">{selectedPhoto.filename}</h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-300">
                  {new Date(selectedPhoto.created_at).toLocaleDateString()}
                </p>
                {selectedPhoto.favorites_count > 0 && (
                  <p className="text-sm text-red-400">
                    {selectedPhoto.favorites_count} favorites
                  </p>
                )}
              </div>
            </div>
            
            {/* Navigation buttons */}
            {photos && photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                    if (currentIndex > 0) {
                      setSelectedPhoto(photos[currentIndex - 1]);
                    }
                  }}
                  disabled={photos.findIndex(p => p.id === selectedPhoto.id) === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                    if (currentIndex < photos.length - 1) {
                      setSelectedPhoto(photos[currentIndex + 1]);
                    }
                  }}
                  disabled={photos.findIndex(p => p.id === selectedPhoto.id) === photos.length - 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
