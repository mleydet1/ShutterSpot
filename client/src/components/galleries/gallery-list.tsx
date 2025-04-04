import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ImageIcon, MoreHorizontal, User, LockIcon, UnlockIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, getStatusColor, formatStatus } from "@/lib/utils";
import { Gallery, Client } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

interface GalleryListProps {
  limit?: number;
  clientId?: number;
}

export function GalleryList({ limit, clientId }: GalleryListProps) {
  const [_, setLocation] = useLocation();
  
  // Fetch all galleries or galleries for a specific client
  const { 
    data: galleries = [], 
    isLoading 
  } = useQuery({
    queryKey: clientId ? [`/api/clients/${clientId}/galleries`] : ['/api/galleries'],
  });

  // Fetch all clients for reference
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client ? client.name : `Client #${clientId}`;
  };

  // Count photos in gallery
  const getPhotoCount = (gallery: Gallery) => {
    return gallery.photos?.length || 0;
  };

  // Limit the number of galleries if specified
  const displayedGalleries = limit ? galleries.slice(0, limit) : galleries;

  const columns: ColumnDef<Gallery>[] = [
    {
      accessorKey: "title",
      header: "Gallery Title",
      cell: ({ row }) => (
        <div className="flex items-center">
          <ImageIcon className="mr-2 h-4 w-4 text-gray-400" />
          <span className="font-medium">{row.getValue("title")}</span>
        </div>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }) => {
        const clientId = row.getValue("clientId") as number;
        return (
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4 text-gray-400" />
            {getClientName(clientId)}
          </div>
        );
      },
    },
    {
      id: "photoCount",
      header: "Photos",
      cell: ({ row }) => {
        const count = getPhotoCount(row.original);
        return (
          <div className="text-center">{count}</div>
        );
      },
    },
    {
      id: "protection",
      header: "Protection",
      cell: ({ row }) => {
        const gallery = row.original;
        const isProtected = gallery.password || gallery.status === "password_protected";
        
        return (
          <div className="flex justify-center">
            {isProtected ? (
              <LockIcon className="h-4 w-4 text-amber-500" />
            ) : (
              <UnlockIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors = getStatusColor(status);
        
        return (
          <Badge
            className={`${statusColors.bg} ${statusColors.text} border-none`}
          >
            {formatStatus(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const gallery = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setLocation(`/galleries/${gallery.id}`)}
              >
                View gallery
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/galleries/${gallery.id}/share`)}
              >
                Share with client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation(`/galleries/${gallery.id}/edit`)}
              >
                Edit gallery
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Galleries</h2>
        <Button 
          onClick={() => setLocation(`/galleries/new${clientId ? `?clientId=${clientId}` : ''}`)}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Gallery
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading galleries...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayedGalleries}
            searchKey="title"
            searchPlaceholder="Search galleries..."
          />
        )}
      </div>
    </div>
  );
}
