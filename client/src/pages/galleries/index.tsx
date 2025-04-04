import React from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { GalleryList } from "@/components/galleries/gallery-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function GalleriesPage() {
  const [_, setLocation] = useLocation();
  
  // Fetch all galleries
  const { data: galleries = [] } = useQuery<any[]>({
    queryKey: ['/api/galleries'],
  });

  // Get draft galleries
  const draftGalleries = galleries.filter((gallery: any) => gallery.status === 'draft');
  
  // Get active galleries (public, password_protected)
  const activeGalleries = galleries.filter((gallery: any) => 
    ['public', 'password_protected'].includes(gallery.status)
  );
  
  // Get archived galleries
  const archivedGalleries = galleries.filter((gallery: any) => gallery.status === 'archived');

  return (
    <MainLayout 
      title="Galleries" 
      description="Manage client photo galleries"
    >
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setLocation("/galleries/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Gallery
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {galleries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {draftGalleries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {activeGalleries.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {archivedGalleries.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <GalleryList hideActionButton={true} />
        </TabsContent>
        
        <TabsContent value="draft">
          <GalleryList hideActionButton={true} />
        </TabsContent>
        
        <TabsContent value="active">
          <GalleryList hideActionButton={true} />
        </TabsContent>
        
        <TabsContent value="archived">
          <GalleryList hideActionButton={true} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
