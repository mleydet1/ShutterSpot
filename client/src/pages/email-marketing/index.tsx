import React from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { EmailTemplateList } from "@/components/email/email-template-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function EmailMarketingPage() {
  const [_, setLocation] = useLocation();
  
  // Fetch email templates
  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['/api/email-templates'],
  });

  // Get template categories
  const getCategories = () => {
    const categories = new Set(templates.map((template: any) => template.category as string));
    return Array.from(categories) as string[];
  };

  const categories = getCategories();

  // Demo email templates for showcase
  const sampleTemplates = [
    {
      id: 1,
      name: "Welcome New Client",
      description: "Send a warm welcome to new clients with important information",
      category: "onboarding"
    },
    {
      id: 2,
      name: "Booking Confirmation",
      description: "Confirm shoot details and provide next steps",
      category: "booking"
    },
    {
      id: 3,
      name: "Gallery Delivery",
      description: "Share gallery access with download instructions",
      category: "delivery"
    },
    {
      id: 4,
      name: "Thank You",
      description: "Express gratitude after project completion",
      category: "follow-up"
    }
  ];

  return (
    <MainLayout 
      title="Email Marketing" 
      description="Manage email templates and campaigns"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Templates</CardTitle>
            <CardDescription>Create and manage reusable email templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Email templates save time and ensure consistent communication with your clients.
            </p>
            <Button
              onClick={() => setLocation("/email-marketing/templates/new")}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              New Template
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Campaigns</CardTitle>
            <CardDescription>Send targeted emails to your client base</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Reach out to multiple clients at once with personalized campaigns.
            </p>
            <Button
              onClick={() => setLocation("/email-marketing/campaigns/new")}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Templates</h2>
        <Button
          onClick={() => setLocation("/email-marketing/templates/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          <EmailTemplateList hideActionButton={true} />
        </TabsContent>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <EmailTemplateList category={category} hideActionButton={true} />
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Template Showcase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleTemplates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="capitalize">{template.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setLocation(`/email-marketing/templates/${template.id}`)}
                >
                  View Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
