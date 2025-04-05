import React from "react";
import { useLocation } from "wouter";
import { Camera, User, Calendar, FileText, CalendarCheck, CreditCard, Image, Mail, Settings, ChartBarStacked } from "lucide-react";
import { 
  Sidebar as SidebarContainer, 
  SidebarHeader, 
  SidebarContent, 
  SidebarSection, 
  SidebarSectionTitle, 
  SidebarItem, 
  SidebarFooter 
} from "@/components/ui/sidebar";
import { UserAccount } from "@/components/layout/user-account";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <SidebarContainer open={open} onClose={onClose}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary-700 text-white">
            <Camera className="h-5 w-5" />
          </span>
          <h1 className="text-lg font-semibold text-gray-900">ShutterSpot</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSection>
          <SidebarItem
            href="/"
            active={location === "/"}
          >
            <ChartBarStacked className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </SidebarItem>
        </SidebarSection>

        <SidebarSection>
          <SidebarSectionTitle>Client Management</SidebarSectionTitle>
          <SidebarItem
            href="/clients"
            active={location === "/clients"}
          >
            <User className="mr-3 h-5 w-5" />
            <span>Clients</span>
          </SidebarItem>
        </SidebarSection>

        <SidebarSection>
          <SidebarSectionTitle>Business</SidebarSectionTitle>
          <SidebarItem
            href="/shoots"
            active={location === "/shoots"}
          >
            <Calendar className="mr-3 h-5 w-5" />
            <span>Shoot Management</span>
          </SidebarItem>
          <SidebarItem
            href="/proposals"
            active={location === "/proposals"}
          >
            <FileText className="mr-3 h-5 w-5" />
            <span>Proposals</span>
          </SidebarItem>
          <SidebarItem
            href="/scheduling"
            active={location === "/scheduling"}
          >
            <CalendarCheck className="mr-3 h-5 w-5" />
            <span>Scheduling</span>
          </SidebarItem>
          <SidebarItem
            href="/invoices"
            active={location === "/invoices"}
          >
            <CreditCard className="mr-3 h-5 w-5" />
            <span>Invoicing</span>
          </SidebarItem>
        </SidebarSection>

        <SidebarSection>
          <SidebarSectionTitle>Content</SidebarSectionTitle>
          <SidebarItem
            href="/galleries"
            active={location === "/galleries"}
          >
            <Image className="mr-3 h-5 w-5" />
            <span>Galleries</span>
          </SidebarItem>
          <SidebarItem
            href="/email-marketing"
            active={location === "/email-marketing"}
          >
            <Mail className="mr-3 h-5 w-5" />
            <span>Email Marketing</span>
          </SidebarItem>
        </SidebarSection>

        <SidebarSection>
          <SidebarSectionTitle>Automation</SidebarSectionTitle>
          <SidebarItem
            href="/workflows"
            active={location === "/workflows"}
          >
            <Settings className="mr-3 h-5 w-5" />
            <span>Workflows</span>
          </SidebarItem>
          <SidebarItem
            href="/reports"
            active={location === "/reports"}
          >
            <ChartBarStacked className="mr-3 h-5 w-5" />
            <span>Reports & Analytics</span>
          </SidebarItem>
          <SidebarItem
            href="/calendar/settings"
            active={location.startsWith("/calendar")}
          >
            <Calendar className="mr-3 h-5 w-5" />
            <span>Calendar Integration</span>
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>

      <SidebarFooter>
        <UserAccount />
      </SidebarFooter>
    </SidebarContainer>
  );
}
