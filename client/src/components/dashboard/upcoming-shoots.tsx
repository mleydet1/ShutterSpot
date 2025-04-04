import React from "react";
import { Clock, MapPin, User } from "lucide-react";
import { useLocation } from "wouter";
import { Shoot } from "@/types";
import { formatDate, formatTime, getStatusColor, formatStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UpcomingShootsProps {
  shoots: Shoot[];
}

export function UpcomingShoots({ shoots }: UpcomingShootsProps) {
  const [_, setLocation] = useLocation();

  const viewAllShoots = () => {
    setLocation("/shoots");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900">Upcoming Shoots</h3>
        <Button
          variant="link"
          onClick={viewAllShoots}
          className="text-primary-600 hover:text-primary-800 p-0"
        >
          View All
        </Button>
      </div>
      <div className="divide-y divide-gray-200">
        {shoots.length === 0 ? (
          <div className="p-5 text-center text-gray-500">
            No upcoming shoots scheduled
          </div>
        ) : (
          shoots.map((shoot) => {
            const shootDate = new Date(shoot.date);
            const month = formatDate(shootDate, "MMM").toUpperCase();
            const day = formatDate(shootDate, "dd");
            const statusColors = getStatusColor(shoot.status);

            return (
              <div key={shoot.id} className="p-5 flex items-start">
                <div className="rounded-md bg-primary-100 text-primary-800 p-2.5 w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold">{month}</span>
                  <span className="text-md font-bold">{day}</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">{shoot.title}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                      {formatStatus(shoot.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>
                      {formatTime(shoot.startTime)} - {formatTime(shoot.endTime)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <MapPin className="mr-1 h-3 w-3" />
                    <span>{shoot.location}</span>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <User className="mr-1 h-3 w-3" />
                    <span>{shoot.client?.name || `Client #${shoot.clientId}`}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
