import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { insertWorkflowSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface WorkflowCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Workflow trigger types
const triggerTypes = [
  "new_client",
  "new_shoot",
  "shoot_completed",
  "gallery_delivered",
  "invoice_paid",
  "date_before_shoot",
  "date_after_shoot",
  "manual",
];

// Workflow action types
const actionTypes = [
  "send_email",
  "create_task",
  "create_invoice",
  "send_client_form",
  "create_gallery",
  "notify_photographer",
];

// Extend the schema with validation
const workflowFormSchema = insertWorkflowSchema.extend({
  name: z.string().min(1, "Workflow name is required"),
  triggers: z.array(
    z.object({
      type: z.string(),
      config: z.record(z.string()).optional(),
    })
  ),
  actions: z.array(
    z.object({
      type: z.string(),
      config: z.record(z.string()).optional(),
    })
  ),
});

export function WorkflowCreateModal({
  isOpen,
  onClose,
}: WorkflowCreateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [triggers, setTriggers] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [triggerType, setTriggerType] = useState("");
  const [actionType, setActionType] = useState("");

  // Define form
  const form = useForm<z.infer<typeof workflowFormSchema>>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      triggers: [],
      actions: [],
    },
  });

  // Add a trigger
  const addTrigger = () => {
    if (!triggerType) return;
    
    const newTrigger = {
      type: triggerType,
      config: {},
    };
    
    const updatedTriggers = [...triggers, newTrigger];
    setTriggers(updatedTriggers);
    form.setValue("triggers", updatedTriggers);
    setTriggerType("");
  };

  // Remove a trigger
  const removeTrigger = (index: number) => {
    const updatedTriggers = triggers.filter((_, i) => i !== index);
    setTriggers(updatedTriggers);
    form.setValue("triggers", updatedTriggers);
  };

  // Add an action
  const addAction = () => {
    if (!actionType) return;
    
    const newAction = {
      type: actionType,
      config: {},
    };
    
    const updatedActions = [...actions, newAction];
    setActions(updatedActions);
    form.setValue("actions", updatedActions);
    setActionType("");
  };

  // Remove an action
  const removeAction = (index: number) => {
    const updatedActions = actions.filter((_, i) => i !== index);
    setActions(updatedActions);
    form.setValue("actions", updatedActions);
  };

  // Create workflow mutation
  const createWorkflow = useMutation({
    mutationFn: async (data: z.infer<typeof workflowFormSchema>) => {
      const response = await apiRequest("POST", "/api/workflows", data);
      return await response.json();
    },
    onSuccess: () => {
      // Show success notification
      toast({
        title: "Workflow created",
        description: "Automation workflow has been created successfully",
      });
      
      // Reset form and close modal
      form.reset();
      setTriggers([]);
      setActions([]);
      onClose();
      
      // Refresh workflows list
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
    onError: (error) => {
      console.error("Error creating workflow:", error);
      toast({
        title: "Error",
        description: "Failed to create the workflow",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof workflowFormSchema>) => {
    if (triggers.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one trigger to the workflow",
        variant: "destructive",
      });
      return;
    }

    if (actions.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one action to the workflow",
        variant: "destructive",
      });
      return;
    }

    createWorkflow.mutate(data);
  };

  return (
    <Modal
      title="Create Automation Workflow"
      description="Design an automated workflow to streamline your business processes"
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workflow Name</FormLabel>
                <FormControl>
                  <Input placeholder="Client Onboarding" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What this workflow does"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <select
                  className="flex-1 p-2 border rounded"
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                >
                  <option value="">Select a trigger...</option>
                  {triggerTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                    </option>
                  ))}
                </select>
                <Button type="button" size="sm" onClick={addTrigger}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {triggers.length === 0 ? (
                <p className="text-sm text-gray-500">No triggers added yet</p>
              ) : (
                <div className="space-y-2">
                  {triggers.map((trigger, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">
                        {trigger.type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrigger(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <select
                  className="flex-1 p-2 border rounded"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                >
                  <option value="">Select an action...</option>
                  {actionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                    </option>
                  ))}
                </select>
                <Button type="button" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {actions.length === 0 ? (
                <p className="text-sm text-gray-500">No actions added yet</p>
              ) : (
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">
                        {action.type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Activate Workflow</FormLabel>
                  <div className="text-sm text-gray-500">
                    Enable this workflow to run automatically
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkflow.isPending}>
              {createWorkflow.isPending ? "Creating..." : "Create Workflow"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}