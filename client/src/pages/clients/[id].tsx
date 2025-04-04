import React from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/layouts/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShootList } from "@/components/shoots/shoot-list";
import { ProposalList } from "@/components/proposals/proposal-list";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { GalleryList } from "@/components/galleries/gallery-list";
import { Mail, Phone, MapPin, Calendar, FileText, CreditCard, Image, Edit, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Client } from "@/types";

export default function ClientDetailPage() {
  const [match, params] = useRoute("/clients/:id");
  const clientId = match ? parseInt(params.id) : null;
  const [_, navigate] = useLocation();

  // Fetch client data
  const { 
    data: client, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  // Handle error and loading states
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading client information...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !client) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">Error loading client information.</p>
          <Button variant="outline" onClick={() => navigate("/clients")}>
            Return to Clients
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/clients")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500">Client since {formatDate(client.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/clients/${clientId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Client
          </Button>
          <Button 
            onClick={() => navigate(`/shoots/new?clientId=${clientId}`)}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Book Shoot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start">
              <Mail className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p>{client.email}</p>
                <p className="text-sm text-gray-500">Email</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p>{client.phone}</p>
                <p className="text-sm text-gray-500">Phone</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent>
            {client.address || client.city || client.state ? (
              <div className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  {client.address && <p>{client.address}</p>}
                  {client.city && client.state && (
                    <p>
                      {client.city}, {client.state} {client.zipCode}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No address provided</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {client.notes ? (
              <p>{client.notes}</p>
            ) : (
              <p className="text-gray-500">No notes added</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shoots" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="shoots" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Shoots
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Proposals
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="galleries" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Galleries
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shoots">
          <ShootList clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="proposals">
          <ProposalList clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="invoices">
          <InvoiceList clientId={clientId} />
        </TabsContent>
        
        <TabsContent value="galleries">
          <GalleryList clientId={clientId} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
