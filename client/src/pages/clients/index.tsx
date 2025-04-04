import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
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
import { ClientCreateModal } from "@/components/clients/client-create-modal";
import { ShootCreateModal } from "@/components/shoots/shoot-create-modal";

import type { ColumnDef } from "@tanstack/react-table";

export default function ClientsPage() {
  const [_, setLocation] = useLocation();
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [isCreateShootModalOpen, setIsCreateShootModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  
  // Fetch clients
  const { 
    data: clients = [], 
    isLoading 
  } = useQuery({
    queryKey: ['/api/clients'],
  });

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
                onClick={() => {
                  setSelectedClientId(client.id);
                  setIsCreateShootModalOpen(true);
                }}
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
    <MainLayout title="Clients" description="Manage your client relationships">
      <div className="mb-6 flex justify-between items-center">
        <div></div>
        <Button 
          onClick={() => setIsCreateClientModalOpen(true)}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <DataTable
          columns={columns}
          data={clients}
          searchKey="name"
          searchPlaceholder="Search clients..."
        />
      </div>
    
      {/* Modals */}
      <ClientCreateModal 
        isOpen={isCreateClientModalOpen} 
        onClose={() => setIsCreateClientModalOpen(false)} 
      />
      
      <ShootCreateModal 
        isOpen={isCreateShootModalOpen} 
        onClose={() => {
          setIsCreateShootModalOpen(false);
          setSelectedClientId(null);
        }}
        clientId={selectedClientId || undefined}
      />
    </MainLayout>
  );
}
