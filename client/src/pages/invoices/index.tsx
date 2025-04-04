import React from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function InvoicesPage() {
  const [_, setLocation] = useLocation();
  
  // Fetch all invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['/api/invoices'],
  });

  // Get draft invoices
  const draftInvoices = invoices.filter((invoice: any) => invoice.status === 'draft');
  
  // Get pending invoices (sent, viewed, partial)
  const pendingInvoices = invoices.filter((invoice: any) => 
    ['sent', 'viewed', 'partial'].includes(invoice.status)
  );
  
  // Get paid invoices
  const paidInvoices = invoices.filter((invoice: any) => invoice.status === 'paid');
  
  // Get overdue invoices
  const overdueInvoices = invoices.filter((invoice: any) => invoice.status === 'overdue');

  // Calculate totals
  const getTotalAmount = (invoiceList: any[]) => {
    return invoiceList.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  };

  const pendingTotal = getTotalAmount(pendingInvoices);
  const paidTotal = getTotalAmount(paidInvoices);
  const overdueTotal = getTotalAmount(overdueInvoices);

  return (
    <MainLayout 
      title="Invoicing" 
      description="Create and manage client invoices"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingTotal)}</div>
            <p className="text-xs text-gray-500 mt-1">{pendingInvoices.length} pending invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidTotal)}</div>
            <p className="text-xs text-gray-500 mt-1">{paidInvoices.length} paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overdueTotal)}</div>
            <p className="text-xs text-gray-500 mt-1">{overdueInvoices.length} overdue invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setLocation("/invoices/new")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {invoices.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {draftInvoices.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {pendingInvoices.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {paidInvoices.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {overdueInvoices.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <InvoiceList />
        </TabsContent>
        
        <TabsContent value="draft">
          <InvoiceList />
        </TabsContent>
        
        <TabsContent value="pending">
          <InvoiceList />
        </TabsContent>
        
        <TabsContent value="paid">
          <InvoiceList />
        </TabsContent>
        
        <TabsContent value="overdue">
          <InvoiceList />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
