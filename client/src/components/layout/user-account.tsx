import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentUser } from "@/lib/data";

export function UserAccount() {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary-100 text-primary-700">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{currentUser.fullName}</p>
        <p className="text-xs text-gray-500">{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-auto"
      >
        <Settings className="h-4 w-4 text-gray-500" />
      </Button>
    </div>
  );
}
