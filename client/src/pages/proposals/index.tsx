import React from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { ProposalList } from "@/components/proposals/proposal-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ProposalsPage() {
  const [_, setLocation] = useLocation();
  
  // Fetch all proposals
  const { data: proposals = [] } = useQuery({
    queryKey: ['/api/proposals'],
  });

  // Get draft proposals
  const draftProposals = proposals.filter((proposal: any) => proposal.status === 'draft');
  
  // Get sent proposals
  const sentProposals = proposals.filter((proposal: any) => ['sent', 'viewed'].includes(proposal.status));
  
  // Get accepted proposals
  const acceptedProposals = proposals.filter((proposal: any) => proposal.status === 'accepted');
  
  // Get other proposals (declined, expired)
  const otherProposals = proposals.filter((proposal: any) => ['declined', 'expired'].includes(proposal.status));

  return (
    <MainLayout 
      title="Booking Proposals" 
      description="Create and manage client proposals"
    >
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setLocation("/proposals/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Proposal
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {proposals.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {draftProposals.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {sentProposals.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {acceptedProposals.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="other">
            Other
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {otherProposals.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ProposalList hideActionButton={true} />
        </TabsContent>
        
        <TabsContent value="draft">
          <ProposalList hideActionButton={true} />
        </TabsContent>
        
        <TabsContent value="sent">
          <ProposalList hideActionButton={true} />
        </TabsContent>
        
        <TabsContent value="accepted">
          <ProposalList hideActionButton={true} />
        </TabsContent>
        
        <TabsContent value="other">
          <ProposalList hideActionButton={true} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
