import React, { useState } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { WorkflowList } from "@/components/automation/workflow-list";
import { Button } from "@/components/ui/button";
import { PlusCircle, Zap, Clock, Calendar, Bell, Filter, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { EnhancedWorkflowModal } from "@/components/workflows/enhanced-workflow-modal";

export default function WorkflowsPage() {
  const [_, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
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
                onClick={() => setIsCreateModalOpen(true)}
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
            <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription>
                  {template.triggers.length} trigger{template.triggers.length !== 1 ? 's' : ''}, {template.actions.length} action{template.actions.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              </CardContent>
              <CardFooter className="bg-gray-50 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setLocation(`/workflows/templates`)}
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 text-primary"
            onClick={() => setLocation('/workflows/templates')}
          >
            View all templates <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Workflow Automation Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base">Event-Based Triggers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Automatically start workflows when specific events happen, like when a client books, signs a contract, or views a gallery.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-amber-100">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-base">Time-Based Scheduling</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Schedule actions to happen before or after key dates, such as sending reminders 3 days before a shoot or thank-you emails 2 days after.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-100">
                  <Filter className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-base">Smart Conditions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Add conditions to your workflows so they only run in specific situations, like only for wedding clients or when an invoice is unpaid.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Workflows</h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <WorkflowList hideActionButton={true} />
      
      {/* Enhanced Workflow Creation Modal */}
      <EnhancedWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </MainLayout>
  );
}
