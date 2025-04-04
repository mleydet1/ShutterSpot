import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Client, Shoot } from "@/types";

// Create a schema for invoice line items
const invoiceItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
});

// Create a schema for invoice validation
const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  clientId: z.coerce.number().min(1, { message: "Please select a client" }),
  shootId: z.coerce.number().optional(),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one item is required" }),
  subtotal: z.coerce.number().min(0),
  tax: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
  status: z.string().min(1, { message: "Please select a status" }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormValues>;
  invoiceId?: number;
  isEditing?: boolean;
  clientId?: number;
  shootId?: number;
}

export function InvoiceForm({ defaultValues, invoiceId, isEditing = false, clientId, shootId }: InvoiceFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [taxRate, setTaxRate] = useState(0.08); // 8% default tax rate

  // Fetch available clients
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Fetch available shoots
  const { data: shoots = [] } = useQuery({
    queryKey: ['/api/shoots'],
  });

  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  // Initialize form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: generateInvoiceNumber(),
      clientId: clientId ? Number(clientId) : undefined,
      shootId: shootId ? Number(shootId) : undefined,
      items: [
        { description: "", quantity: 1, price: 0 }
      ],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: "draft",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      ...defaultValues,
    },
  });

  // Setup field array for invoice items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Update client ID and shoot ID if provided in URL
  useEffect(() => {
    if (clientId && !form.getValues().clientId) {
      form.setValue("clientId", Number(clientId));
    }
    if (shootId && !form.getValues().shootId) {
      form.setValue("shootId", Number(shootId));
    }
  }, [clientId, shootId, form]);

  // Get filtered shoots based on selected client
  const getClientShoots = () => {
    const clientId = form.watch("clientId");
    if (!clientId) return [];
    return shoots.filter((shoot: Shoot) => shoot.clientId === clientId);
  };

  // Calculate totals when items or tax rate change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes('items') || name === 'tax') {
        const items = value.items || [];
        const subtotal = items.reduce((sum, item) => {
          const quantity = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          return sum + (quantity * price);
        }, 0);
        
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        
        form.setValue("subtotal", subtotal);
        form.setValue("tax", tax);
        form.setValue("total", total);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, taxRate]);

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      navigate("/invoices");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating invoice:", error);
    },
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      const response = await apiRequest("PUT", `/api/invoices/${invoiceId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      navigate(`/invoices/${invoiceId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating invoice:", error);
    },
  });

  // Add new item
  const addItem = () => {
    append({ description: "", quantity: 1, price: 0 });
  };

  // Form submission
  const onSubmit = (data: InvoiceFormValues) => {
    if (isEditing && invoiceId) {
      updateInvoiceMutation.mutate(data);
    } else {
      createInvoiceMutation.mutate(data);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Invoice" : "New Invoice"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="viewed">Viewed</SelectItem>
                        <SelectItem value="partial">Partially Paid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Clear shoot selection when client changes
                        form.setValue("shootId", undefined);
                      }}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client: Client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shootId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Shoot (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a shoot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {getClientShoots().map((shoot: Shoot) => (
                          <SelectItem key={shoot.id} value={shoot.id.toString()}>
                            {shoot.title} ({format(new Date(shoot.date), "MMM d, yyyy")})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Invoice Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index > 0 ? "sr-only" : ""}>
                              Description
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index > 0 ? "sr-only" : ""}>
                              Qty
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index > 0 ? "sr-only" : ""}>
                              Price
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 pt-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="col-span-1 pt-8 text-right">
                      {formatCurrency(
                        (form.watch(`items.${index}.quantity`) || 0) *
                          (form.watch(`items.${index}.price`) || 0)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(form.watch("subtotal"))}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center gap-2">
                    <span>Tax Rate:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate * 100}
                      onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                      className="w-16 h-7 text-xs"
                    />
                    <span>%</span>
                  </label>
                  <span>{formatCurrency(form.watch("tax"))}</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(form.watch("total"))}</span>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/invoices")}
              >
                Cancel
              </Button>
              <div className="space-x-2">
                <Button 
                  type="submit" 
                  disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
                >
                  {isEditing ? (
                    updateInvoiceMutation.isPending ? "Updating..." : "Update Invoice"
                  ) : (
                    createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
