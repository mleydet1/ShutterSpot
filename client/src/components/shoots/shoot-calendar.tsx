import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { Shoot } from "@/types";
import { cn, getStatusColor } from "@/lib/utils";

export function ShootCalendar() {
  const [_, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch all shoots
  const { data: shoots = [], isLoading } = useQuery({
    queryKey: ['/api/shoots'],
  });

  // Filter shoots for the selected date
  const shootsForSelectedDate = selectedDate
    ? shoots.filter((shoot: Shoot) => isSameDay(new Date(shoot.date), selectedDate))
    : [];

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Create list of days with shoots for the month
  const daysWithShoots = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }).map(day => {
    const shootsForDay = shoots.filter((shoot: Shoot) => 
      isSameDay(new Date(shoot.date), day)
    );
    
    return {
      date: day,
      shoots: shootsForDay,
    };
  });

  // Custom day render for the calendar
  const renderDay = (day: Date) => {
    const shootsForDay = shoots.filter((shoot: Shoot) => 
      isSameDay(new Date(shoot.date), day)
    );
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <Button 
          variant="ghost" 
          className={cn(
            "h-9 w-9 p-0 rounded-full",
            shootsForDay.length > 0 && "bg-primary-50 text-primary-700 hover:bg-primary-100",
            isSameDay(day, selectedDate || new Date()) && "bg-primary-100 text-primary-700"
          )}
        >
          {format(day, "d")}
        </Button>
        {shootsForDay.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-0.5">
              {shootsForDay.length <= 3 ? (
                shootsForDay.map((shoot, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      getStatusColor(shoot.status).bg
                    )}
                  />
                ))
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Calendar</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              className="rounded-md border"
              components={{
                Day: ({ date }) => renderDay(date),
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setLocation("/shoots/new")}
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-3.5 w-3.5" />
              New Shoot
            </Button>
          </CardHeader>
          <CardContent>
            {shootsForSelectedDate.length === 0 ? (
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
                          {shoot.status.charAt(0).toUpperCase() + shoot.status.slice(1).replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center mt-1">
                          <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          {format(new Date(`${shoot.date}T${shoot.startTime}`), "h:mm a")} - 
                          {format(new Date(`${shoot.date}T${shoot.endTime}`), "h:mm a")}
                        </div>
                        <div className="flex items-center mt-1">
                          <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {shoot.location}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
