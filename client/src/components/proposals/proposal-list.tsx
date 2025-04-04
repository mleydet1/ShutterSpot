import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, MoreHorizontal, User, CalendarClock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, getStatusColor, formatStatus } from "@/lib/utils";
import { Proposal, Client } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

interface ProposalListProps {
  limit?: number;
  clientId?: number;
  hideActionButton?: boolean;
}

export function ProposalList({ limit, clientId, hideActionButton = false }: ProposalListProps) {
  const [_, setLocation] = useLocation();
  
  // Fetch all proposals or proposals for a specific client
  const { 
    data: proposals = [], 
    isLoading 
  } = useQuery<Proposal[]>({
    queryKey: clientId ? [`/api/clients/${clientId}/proposals`] : ['/api/proposals'],
  });

  // Fetch all clients for reference
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : `Client #${clientId}`;
  };

  // Limit the number of proposals if specified
  const displayedProposals = limit ? proposals.slice(0, limit) : proposals;

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center">
          <FileText className="mr-2 h-4 w-4 text-gray-400" />
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
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt");
        return createdAt && typeof createdAt === 'string' ? formatDate(createdAt) : '';
      },
    },
    {
      accessorKey: "expiryDate",
      header: "Expires",
      cell: ({ row }) => {
        const expiryDate = row.getValue("expiryDate");
        if (expiryDate && typeof expiryDate === 'string') {
          return (
            <div className="flex items-center">
              <CalendarClock className="mr-2 h-4 w-4 text-gray-400" />
              {formatDate(expiryDate)}
            </div>
          );
        }
        return <span className="text-gray-400">No expiry</span>;
      },
    },
    {
      id: "packages",
      header: "Packages",
      cell: ({ row }) => {
        const packages = row.original.packages?.length || 0;
        return <div>{packages}</div>;
      },
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
        const proposal = row.original;

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
                onClick={() => setLocation(`/proposals/${proposal.id}`)}
              >
                View proposal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/proposals/${proposal.id}/send`)}
              >
                Send to client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation(`/proposals/${proposal.id}/edit`)}
              >
                Edit proposal
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
        <h2 className="text-xl font-semibold">Proposals</h2>
        {!hideActionButton && (
          <Button 
            onClick={() => setLocation(`/proposals/new${clientId ? `?clientId=${clientId}` : ''}`)}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading proposals...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayedProposals}
            searchKey="title"
            searchPlaceholder="Search proposals..."
          />
        )}
      </div>
    </div>
  );
}
