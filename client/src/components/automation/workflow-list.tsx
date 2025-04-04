import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Settings, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";
import { Workflow } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkflowListProps {
  limit?: number;
}

export function WorkflowList({ limit }: WorkflowListProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all workflows
  const { 
    data: workflows = [], 
    isLoading 
  } = useQuery({
    queryKey: ['/api/workflows'],
  });

  // Update workflow active status mutation
  const updateWorkflowStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/workflows/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({
        title: "Workflow updated",
        description: "The workflow status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update workflow status",
        variant: "destructive",
      });
      console.error("Error updating workflow status:", error);
    },
  });

  // Count triggers and actions
  const getTriggerCount = (workflow: Workflow) => {
    return workflow.triggers?.length || 0;
  };

  const getActionCount = (workflow: Workflow) => {
    return workflow.actions?.length || 0;
  };

  // Handle workflow status toggle
  const handleStatusToggle = (id: number, currentStatus: boolean) => {
    updateWorkflowStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  // Limit the number of workflows if specified
  const displayedWorkflows = limit ? workflows.slice(0, limit) : workflows;

  const columns: ColumnDef<Workflow>[] = [
    {
      accessorKey: "name",
      header: "Workflow Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Settings className="mr-2 h-4 w-4 text-gray-400" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      id: "triggers",
      header: "Triggers",
      cell: ({ row }) => {
        const count = getTriggerCount(row.original);
        return <div>{count} trigger{count !== 1 ? 's' : ''}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const count = getActionCount(row.original);
        return <div>{count} action{count !== 1 ? 's' : ''}</div>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      cell: ({ row }) => formatDate(row.getValue("updatedAt")),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <div className="flex items-center">
            <Switch
              checked={isActive}
              onCheckedChange={() => handleStatusToggle(row.original.id, isActive)}
            />
            <Badge
              className={`ml-2 ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-none`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "options",
      cell: ({ row }) => {
        const workflow = row.original;

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
                onClick={() => setLocation(`/workflows/${workflow.id}`)}
              >
                View workflow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/workflows/${workflow.id}/duplicate`)}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation(`/workflows/${workflow.id}/edit`)}
              >
                Edit workflow
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
        <h2 className="text-xl font-semibold">Automation Workflows</h2>
        <Button 
          onClick={() => setLocation('/workflows/new')}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading workflows...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={displayedWorkflows}
            searchKey="name"
            searchPlaceholder="Search workflows..."
          />
        )}
      </div>
    </div>
  );
}
