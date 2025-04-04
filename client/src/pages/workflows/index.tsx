import React from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { WorkflowList } from "@/components/automation/workflow-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkflowsPage() {
  const [_, setLocation] = useLocation();
  
  // Sample workflow templates for showcase
  const workflowTemplates = [
    {
      id: 1,
      name: "New Client Onboarding",
      description: "Automatically welcome new clients and send important information",
      triggers: ["client_added"],
      actions: ["send_email", "create_todo"]
    },
    {
      id: 2,
      name: "Shoot Reminder",
      description: "Send reminders before scheduled shoots",
      triggers: ["booking_confirmed"],
      actions: ["send_email"]
    },
    {
      id: 3,
      name: "Gallery Delivery",
      description: "Notify clients when their gallery is ready",
      triggers: ["gallery_delivered"],
      actions: ["send_email", "send_reminder"]
    },
    {
      id: 4,
      name: "Invoice Follow-up",
      description: "Send reminders for unpaid invoices",
      triggers: ["invoice_sent"],
      actions: ["send_reminder"]
    }
  ];

  return (
    <MainLayout 
      title="Workflow Automation" 
      description="Set up automated tasks and notifications"
    >
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What are workflows?</CardTitle>
            <CardDescription>Automate repetitive tasks to save time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Workflows help you automate your photography business by triggering actions based on specific events.
              For example, you can automatically send a thank you email after a shoot is completed, or remind clients
              about their upcoming sessions.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/workflows/new")}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Create Workflow
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/workflows/templates")}
              >
                Browse Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Workflow Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowTemplates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription>
                  {template.triggers.length} trigger{template.triggers.length !== 1 ? 's' : ''}, {template.actions.length} action{template.actions.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setLocation(`/workflows/new?template=${template.id}`)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Workflows</h2>
        <Button
          onClick={() => setLocation("/workflows/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <WorkflowList hideActionButton={true} />
    </MainLayout>
  );
}
