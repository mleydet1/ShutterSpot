import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar, MapPin, MoreHorizontal, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatTime, getStatusColor, formatStatus } from "@/lib/utils";
import { Shoot, Client } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

interface ShootListProps {
  limit?: number;
  clientId?: number;
}

export function ShootList({ limit, clientId }: ShootListProps) {
  const [_, setLocation] = useLocation();
  
  // Fetch all shoots or shoots for a specific client
  const { 
    data: shoots = [], 
    isLoading 
  } = useQuery({
    queryKey: clientId ? [`/api/clients/${clientId}/shoots`] : ['/api/shoots'],
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

  // Limit the number of shoots if specified
  const displayedShoots = limit ? shoots.slice(0, limit) : shoots;

  const columns: ColumnDef<Shoot>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
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
      accessorKey: "startTime",
      header: "Time",
      cell: ({ row }) => {
        const startTime = formatTime(row.getValue("startTime"));
        const endTime = formatTime(row.original.endTime);
        
        return (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
            {startTime} - {endTime}
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-gray-400" />
          {row.getValue("location")}
        </div>
      ),
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
        const shoot = row.original;

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
                onClick={() => setLocation(`/shoots/${shoot.id}`)}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/invoices/new?shootId=${shoot.id}`)}
              >
                Create invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/galleries/new?shootId=${shoot.id}`)}
              >
                Upload gallery
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation(`/shoots/${shoot.id}/edit`)}
              >
                Edit shoot
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
        <h2 className="text-xl font-semibold">Shoots</h2>
        <Button 
          onClick={() => setLocation(`/shoots/new${clientId ? `?clientId=${clientId}` : ''}`)}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Shoot
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading shoots...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayedShoots}
            searchKey="title"
            searchPlaceholder="Search shoots..."
          />
        )}
      </div>
    </div>
  );
}
