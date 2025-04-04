import React, { useState } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { ShootList } from "@/components/shoots/shoot-list";
import { ShootCalendar } from "@/components/shoots/shoot-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDays, List, PlusCircle } from "lucide-react";

export default function ShootsPage() {
  const [_, setLocation] = useLocation();
  const [viewType, setViewType] = useState<"calendar" | "list">("list");

  return (
    <MainLayout 
      title="Shoot Management" 
      description="Schedule and manage your photography sessions"
    >
      <div className="mb-6 flex items-center justify-between">
        <Tabs 
          value={viewType} 
          onValueChange={(value) => setViewType(value as "calendar" | "list")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          onClick={() => setLocation("/shoots/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Shoot
        </Button>
      </div>

      {viewType === "list" ? (
        <ShootList hideActionButton={true} />
      ) : (
        <ShootCalendar />
      )}
    </MainLayout>
  );
}
