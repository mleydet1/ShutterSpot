import React, { useState } from "react";
import { PlusCircle, Calendar, FileText, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { ClientCreateModal } from "@/components/clients/client-create-modal";
import { ShootCreateModal } from "@/components/shoots/shoot-create-modal";
import { ProposalCreateModal } from "@/components/proposals/proposal-create-modal";
import { GalleryCreateModal } from "@/components/galleries/gallery-create-modal";

export function QuickActions() {
  const [_, setLocation] = useLocation();
  
  // State for controlling modal visibility
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isShootModalOpen, setIsShootModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const actions = [
    {
      id: 1,
      title: "New Client",
      icon: <PlusCircle className="h-5 w-5" />,
      bgColor: "bg-primary-100",
      textColor: "text-primary-700",
      onClick: () => setIsClientModalOpen(true)
    },
    {
      id: 2,
      title: "New Shoot",
      icon: <Calendar className="h-5 w-5" />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      onClick: () => setIsShootModalOpen(true)
    },
    {
      id: 3,
      title: "New Proposal",
      icon: <FileText className="h-5 w-5" />,
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      onClick: () => setIsProposalModalOpen(true)
    },
    {
      id: 4,
      title: "Upload Gallery",
      icon: <Upload className="h-5 w-5" />,
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      onClick: () => setIsGalleryModalOpen(true)
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-md ${action.bgColor} ${action.textColor}`}>
              {action.icon}
            </div>
            <span className="ml-3 text-sm font-medium">{action.title}</span>
          </button>
        ))}
      </div>

      {/* Client Create Modal */}
      <ClientCreateModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
      />

      {/* Shoot Create Modal */}
      <ShootCreateModal 
        isOpen={isShootModalOpen} 
        onClose={() => setIsShootModalOpen(false)} 
      />

      {/* Proposal Create Modal */}
      <ProposalCreateModal 
        isOpen={isProposalModalOpen} 
        onClose={() => setIsProposalModalOpen(false)} 
      />

      {/* Gallery Create Modal */}
      <GalleryCreateModal 
        isOpen={isGalleryModalOpen} 
        onClose={() => setIsGalleryModalOpen(false)} 
      />
    </div>
  );
}
