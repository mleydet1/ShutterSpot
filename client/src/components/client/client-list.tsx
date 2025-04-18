import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Mail, Phone, MapPin, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Client } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

interface ClientListProps {
  limit?: number;
}

export function ClientList({ limit }: ClientListProps) {
  const [_, setLocation] = useLocation();
  
  // Fetch clients
  const { 
    data: clients = [], 
    isLoading 
  } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Limit the number of clients if specified
  const displayedClients = limit ? clients.slice(0, limit) : clients;

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-gray-400" />
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4 text-gray-400" />
          {row.getValue("phone")}
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "Location",
      cell: ({ row }) => {
        const city = row.getValue("city");
        const state = row.original.state;
        
        return (
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
            {city && state ? `${city}, ${state}` : "Not specified"}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Client Since",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;

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
                onClick={() => setLocation(`/clients/${client.id}`)}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/shoots/new?clientId=${client.id}`)}
              >
                Book a shoot
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/proposals/new?clientId=${client.id}`)}
              >
                Create proposal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation(`/clients/${client.id}/edit`)}
              >
                Edit client
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
        <h2 className="text-xl font-semibold">Clients</h2>
        <Button 
          onClick={() => setLocation("/clients/new")}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading clients...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayedClients}
            searchKey="name"
            searchPlaceholder="Search clients..."
          />
        )}
      </div>
    </div>
  );
}
