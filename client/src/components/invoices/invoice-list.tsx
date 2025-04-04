import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Receipt, MoreHorizontal, User, CalendarClock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatCurrency, getStatusColor, formatStatus } from "@/lib/utils";
import { Invoice, Client } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

interface InvoiceListProps {
  limit?: number;
  clientId?: number;
}

export function InvoiceList({ limit, clientId }: InvoiceListProps) {
  const [_, setLocation] = useLocation();
  
  // Fetch all invoices or invoices for a specific client
  const { 
    data: invoices = [], 
    isLoading 
  } = useQuery({
    queryKey: clientId ? [`/api/clients/${clientId}/invoices`] : ['/api/invoices'],
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

  // Limit the number of invoices if specified
  const displayedInvoices = limit ? invoices.slice(0, limit) : invoices;

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Receipt className="mr-2 h-4 w-4 text-gray-400" />
          <span className="font-medium">{row.getValue("invoiceNumber")}</span>
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
      header: "Issue Date",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <div className="flex items-center">
          <CalendarClock className="mr-2 h-4 w-4 text-gray-400" />
          {formatDate(row.getValue("dueDate"))}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">{formatCurrency(row.getValue("total"))}</div>
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
        const invoice = row.original;

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
                onClick={() => setLocation(`/invoices/${invoice.id}`)}
              >
                View invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/invoices/${invoice.id}/send`)}
              >
                Send invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/invoices/${invoice.id}/print`)}
              >
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation(`/invoices/${invoice.id}/edit`)}
              >
                Edit invoice
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
        <h2 className="text-xl font-semibold">Invoices</h2>
        <Button 
          onClick={() => setLocation(`/invoices/new${clientId ? `?clientId=${clientId}` : ''}`)}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading invoices...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayedInvoices}
            searchKey="invoiceNumber"
            searchPlaceholder="Search invoices..."
          />
        )}
      </div>
    </div>
  );
}
