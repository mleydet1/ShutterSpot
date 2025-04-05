import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, open = true, onClose, children, ...props }, ref) => {
    return (
      <>
        <div
          className={cn(
            "fixed inset-y-0 z-50 flex flex-col w-64 bg-white border-r border-sidebar-border transition-transform duration-200 ease-in-out transform lg:static lg:w-64 lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between h-16 px-4 py-4 border-b border-sidebar-border",
      className
    )}
    {...props}
  />
));

SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1", className)}
    {...props}
  />
));

SidebarContent.displayName = "SidebarContent";

const SidebarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-1", className)} {...props} />
));

SidebarSection.displayName = "SidebarSection";

const SidebarSectionTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "px-3 py-1.5 text-xs font-semibold text-sidebar-foreground/70 uppercase",
      className
    )}
    {...props}
  />
));

SidebarSectionTitle.displayName = "SidebarSectionTitle";

const SidebarItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex items-center px-3 py-2 text-sm rounded-md group",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      className
    )}
    {...props}
  />
));

SidebarItem.displayName = "SidebarItem";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 border-t border-sidebar-border", className)}
    {...props}
  />
));

SidebarFooter.displayName = "SidebarFooter";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarSectionTitle,
  SidebarItem,
  SidebarFooter,
};
