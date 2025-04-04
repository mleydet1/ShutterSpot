import React, { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ArrowRight, Clock, MapPin, User } from "lucide-react";
import { useLocation } from "wouter";
import { formatTime, getStatusColor, formatStatus } from "@/lib/utils";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { Shoot } from "@/types";

export default function SchedulingPage() {
  const [_, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<"all-day" | "morning" | "afternoon" | "evening">("all-day");

  // Fetch shoots
  const { data: shoots = [], isLoading } = useQuery({
    queryKey: ['/api/shoots'],
  });

  // Filter shoots for the selected date
  const shootsForSelectedDate = selectedDate
    ? shoots.filter((shoot: Shoot) => isSameDay(new Date(shoot.date), selectedDate))
    : [];

  // Get available time slots
  const getAvailableSlots = () => {
    // This is a simplified example. In a real app, you would:
    // 1. Define your working hours
    // 2. Remove slots that overlap with existing shoots
    // 3. Consider buffer time between shoots
    
    // Mock available slots based on time of day filter
    let slots = [];
    
    switch (availability) {
      case "morning":
        slots = ["09:00", "10:00", "11:00"];
        break;
      case "afternoon":
        slots = ["13:00", "14:00", "15:00", "16:00"];
        break;
      case "evening":
        slots = ["17:00", "18:00", "19:00"];
        break;
      default:
        slots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
    }
    
    // Filter out slots that conflict with existing shoots
    return slots.filter(slot => {
      // For simplicity, we're just checking if the start time matches
      return !shootsForSelectedDate.some(shoot => 
        shoot.startTime.split(":")[0] === slot.split(":")[0]
      );
    });
  };

  const availableSlots = getAvailableSlots();

  return (
    <MainLayout 
      title="Scheduling" 
      description="Manage your appointment schedule and availability"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Calendar</CardTitle>
              <Button 
                onClick={() => setLocation("/shoots/new")}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                New Shoot
              </Button>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < startOfDay(new Date())}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
              </CardTitle>
              <CardDescription>
                {shootsForSelectedDate.length} shoots scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading shoots...
                </div>
              ) : shootsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No shoots scheduled for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {shootsForSelectedDate.map((shoot: Shoot) => {
                    const statusColors = getStatusColor(shoot.status);
                    
                    return (
                      <div 
                        key={shoot.id} 
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => setLocation(`/shoots/${shoot.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">{shoot.title}</h4>
                          <Badge className={`${statusColors.bg} ${statusColors.text} border-none`}>
                            {formatStatus(shoot.status)}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <div className="flex items-center mt-1">
                            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {formatTime(shoot.startTime)} - {formatTime(shoot.endTime)}
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {shoot.location}
                          </div>
                          <div className="flex items-center mt-1">
                            <User className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            Client #{shoot.clientId}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Time Slots</CardTitle>
              <CardDescription>
                Select your availability filter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select 
                  value={availability} 
                  onValueChange={(value: "all-day" | "morning" | "afternoon" | "evening") => setAvailability(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-day">All Day</SelectItem>
                    <SelectItem value="morning">Morning (9AM-12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (1PM-5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {availableSlots.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No available slots for the selected criteria.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <Button 
                      key={slot} 
                      variant="outline" 
                      className="justify-between"
                      onClick={() => setLocation(`/shoots/new?date=${format(selectedDate!, 'yyyy-MM-dd')}&time=${slot}`)}
                    >
                      <span>{slot}</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
