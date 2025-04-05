import React from "react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WorkflowBuilder, WorkflowData } from "./workflow-builder";

interface EnhancedWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWorkflow?: WorkflowData;
  mode?: "create" | "edit";
}

export function EnhancedWorkflowModal({
  isOpen,
  onClose,
  initialWorkflow,
  mode = "create"
}: EnhancedWorkflowModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create workflow mutation
  const workflowMutation = useMutation({
    mutationFn: async (data: WorkflowData) => {
      const endpoint = mode === "edit" && initialWorkflow?.id 
        ? `/api/workflows/${initialWorkflow.id}` 
        : "/api/workflows";
      
      const method = mode === "edit" ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, data);
      return await response.json();
    },
    onSuccess: () => {
      // Show success notification
      toast({
        title: `Workflow ${mode === "edit" ? "updated" : "created"}`,
        description: `Automation workflow has been ${mode === "edit" ? "updated" : "created"} successfully`,
      });
      
      // Close modal
      onClose();
      
      // Refresh workflows list
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
    onError: (error) => {
      console.error(`Error ${mode === "edit" ? "updating" : "creating"} workflow:`, error);
      toast({
        title: "Error",
        description: `Failed to ${mode === "edit" ? "update" : "create"} the workflow`,
        variant: "destructive",
      });
    },
  });

  // Handle workflow save
  const handleSave = (workflow: WorkflowData) => {
    // Validate workflow before saving
    if (!workflow.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    if (workflow.steps.length === 0) {
      toast({
        title: "Validation Error",
        description: "Add at least one automation step to the workflow",
        variant: "destructive",
      });
      return;
    }

    // Check if each step has a valid trigger and at least one action
    const invalidSteps = workflow.steps.filter(step => {
      const hasTrigger = step.trigger.type === "event" 
        ? !!step.trigger.eventType 
        : (!!step.trigger.timeReference && step.trigger.timeOffset !== undefined);
      
      const hasActions = step.actions.length > 0 && 
        step.actions.every(action => !!action.type);
      
      return !hasTrigger || !hasActions;
    });

    if (invalidSteps.length > 0) {
      toast({
        title: "Validation Error",
        description: "Some steps have incomplete triggers or actions",
        variant: "destructive",
      });
      return;
    }

    // Submit the workflow
    workflowMutation.mutate(workflow);
  };

  return (
    <Modal
      title={`${mode === "edit" ? "Edit" : "Create"} Advanced Workflow`}
      description="Design an automated workflow with triggers, conditions, and actions"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="py-4">
        <WorkflowBuilder
          initialWorkflow={initialWorkflow}
          onSave={handleSave}
        />
      </div>
    </Modal>
  );
}
