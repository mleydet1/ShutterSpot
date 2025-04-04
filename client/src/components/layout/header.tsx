import React, { useState } from "react";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
      <div className="flex items-center lg:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onOpenSidebar} 
          className="text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center flex-1 ml-4 lg:ml-0">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            value={searchValue}
            onChange={handleSearch}
            className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search clients, shoots, invoices..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-gray-500 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:bg-gray-100"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
