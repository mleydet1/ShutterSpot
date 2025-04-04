import React from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Clipboard, 
  CreditCard, 
  Image 
} from "lucide-react";
import { formatDate, formatTime, getStatusColor, formatStatus } from "@/lib/utils";
import { Shoot, Client } from "@/types";
import { Separator } from "@/components/ui/separator";

export default function ShootDetailPage() {
  const [match, params] = useRoute("/shoots/:id");
  const shootId = match ? parseInt(params.id) : null;
  const [_, navigate] = useLocation();

  // Fetch shoot data
  const { 
    data: shoot, 
    isLoading: shootLoading, 
    error: shootError 
  } = useQuery({
    queryKey: [`/api/shoots/${shootId}`],
    enabled: !!shootId,
  });

  // Fetch client data if we have a shoot
  const { 
    data: client, 
    isLoading: clientLoading 
  } = useQuery({
    queryKey: [`/api/clients/${shoot?.clientId}`],
    enabled: !!shoot?.clientId,
  });

  // Handle error and loading states
  if (shootLoading || clientLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading shoot information...</p>
        </div>
      </MainLayout>
    );
  }

  if (shootError || !shoot) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">Error loading shoot information.</p>
          <Button variant="outline" onClick={() => navigate("/shoots")}>
            Return to Shoots
          </Button>
        </div>
      </MainLayout>
    );
  }

  const statusColors = getStatusColor(shoot.status);

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/shoots")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{shoot.title}</h1>
            <Badge
              className={`${statusColors.bg} ${statusColors.text} border-none`}
            >
              {formatStatus(shoot.status)}
            </Badge>
          </div>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/shoots/${shootId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Shoot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{formatDate(shoot.date)}</p>
                    <p className="text-sm text-gray-500">Date</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {formatTime(shoot.startTime)} - {formatTime(shoot.endTime)}
                    </p>
                    <p className="text-sm text-gray-500">Time</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{shoot.location}</p>
                  <p className="text-sm text-gray-500">Location</p>
                </div>
              </div>
              
              {shoot.notes && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                  <p>{shoot.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent>
              {client ? (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <Button 
                        variant="link" 
                        onClick={() => navigate(`/clients/${client.id}`)} 
                        className="p-0 h-auto text-sm text-primary-700"
                      >
                        View Client Profile
                      </Button>
                    </div>
                  </div>
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
                </div>
              ) : (
                <p className="text-gray-500">Client information unavailable</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate(`/proposals/new?clientId=${shoot.clientId}`)}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Create Proposal
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate(`/invoices/new?shootId=${shootId}`)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate(`/galleries/new?shootId=${shootId}`)}
              >
                <Image className="mr-2 h-4 w-4" />
                Upload Gallery
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
