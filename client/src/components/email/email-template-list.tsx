import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Mail, MoreHorizontal, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { EmailTemplate } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

interface EmailTemplateListProps {
  limit?: number;
  category?: string;
  hideActionButton?: boolean;
}

export function EmailTemplateList({ limit, category, hideActionButton = false }: EmailTemplateListProps) {
  const [_, setLocation] = useLocation();
  
  // Fetch all email templates or templates for a specific category
  const { 
    data: templates = [], 
    isLoading 
  } = useQuery<any[]>({
    queryKey: category ? [`/api/email-templates/category/${category}`] : ['/api/email-templates'],
  });

  // Limit the number of templates if specified
  const displayedTemplates = limit ? templates.slice(0, limit) : templates;

  const columns: ColumnDef<EmailTemplate>[] = [
    {
      accessorKey: "name",
      header: "Template Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-gray-400" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="truncate max-w-xs">{row.getValue("subject")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Tag className="mr-2 h-4 w-4 text-gray-400" />
          <span className="capitalize">{row.getValue("category")}</span>
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      cell: ({ row }) => formatDate(row.getValue("updatedAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const template = row.original;

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
                onClick={() => setLocation(`/email-marketing/templates/${template.id}`)}
              >
                View template
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/email-marketing/send?templateId=${template.id}`)}
              >
                Use template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation(`/email-marketing/templates/${template.id}/edit`)}
              >
                Edit template
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
        <h2 className="text-xl font-semibold">Email Templates</h2>
        {!hideActionButton && (
          <Button 
            onClick={() => setLocation(`/email-marketing/templates/new${category ? `?category=${category}` : ''}`)}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Template
          </Button>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading email templates...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayedTemplates}
            searchKey="name"
            searchPlaceholder="Search templates..."
          />
        )}
      </div>
    </div>
  );
}
