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
import { Textarea } from "@/components/ui/textarea";
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
import { Client } from "@/types";

// Create a schema for proposal package items
const packageItemSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  includedItems: z.array(z.string()).min(1, { message: "At least one included item is required" }),
});

// Create a schema for proposal validation
const proposalSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  clientId: z.coerce.number().min(1, { message: "Please select a client" }),
  message: z.string().min(1, { message: "Message is required" }),
  packages: z.array(packageItemSchema).min(1, { message: "At least one package is required" }),
  status: z.string().min(1, { message: "Please select a status" }),
  expiryDate: z.date().optional().nullable(),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ProposalFormProps {
  defaultValues?: Partial<ProposalFormValues>;
  proposalId?: number;
  isEditing?: boolean;
  clientId?: number;
}

export function ProposalForm({ defaultValues, proposalId, isEditing = false, clientId }: ProposalFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [packageBeingEdited, setPackageBeingEdited] = useState<number | null>(null);
  const [includedItem, setIncludedItem] = useState<string>("");

  // Fetch available clients
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Initialize form with default values
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "",
      clientId: clientId ? Number(clientId) : undefined,
      message: "",
      packages: [
        { 
          name: "Basic Package", 
          description: "Essential photography services", 
          price: 500,
          includedItems: ["2 hours of photography", "20 edited digital images", "Online gallery"]
        }
      ],
      status: "draft",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ...defaultValues,
    },
  });

  // Setup field array for packages
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "packages",
  });

  // Setup field array for included items within a package
  const appendIncludedItem = (packageIndex: number) => {
    if (!includedItem.trim()) return;
    
    const currentItems = form.getValues(`packages.${packageIndex}.includedItems`);
    form.setValue(`packages.${packageIndex}.includedItems`, [...currentItems, includedItem.trim()]);
    setIncludedItem("");
  };

  const removeIncludedItem = (packageIndex: number, itemIndex: number) => {
    const currentItems = [...form.getValues(`packages.${packageIndex}.includedItems`)];
    currentItems.splice(itemIndex, 1);
    form.setValue(`packages.${packageIndex}.includedItems`, currentItems);
  };

  // Update client ID if provided in URL
  useEffect(() => {
    if (clientId && !form.getValues().clientId) {
      form.setValue("clientId", Number(clientId));
    }
  }, [clientId, form]);

  // Add new package
  const addPackage = () => {
    append({ 
      name: "", 
      description: "", 
      price: 0,
      includedItems: []
    });
  };

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      const response = await apiRequest("POST", "/api/proposals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Success",
        description: "Proposal created successfully",
      });
      navigate("/proposals");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating proposal:", error);
    },
  });

  // Update proposal mutation
  const updateProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      const response = await apiRequest("PUT", `/api/proposals/${proposalId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/proposals/${proposalId}`] });
      toast({
        title: "Success",
        description: "Proposal updated successfully",
      });
      navigate(`/proposals/${proposalId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update proposal. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating proposal:", error);
    },
  });

  // Form submission
  const onSubmit = (data: ProposalFormValues) => {
    if (isEditing && proposalId) {
      updateProposalMutation.mutate(data);
    } else {
      createProposalMutation.mutate(data);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Proposal" : "New Proposal"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for this proposal" {...field} />
                    </FormControl>
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
                      onValueChange={field.onChange}
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
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
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
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Client</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a personal message to the client"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Service Packages</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPackage}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Package
                </Button>
              </div>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Package {index + 1}</h4>
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

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`packages.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Package Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Basic Package" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`packages.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
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

                      <FormField
                        control={form.control}
                        name={`packages.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe this package"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel>Included Items</FormLabel>
                        <FormMessage>
                          {form.formState.errors.packages?.[index]?.includedItems?.message}
                        </FormMessage>
                        
                        <ul className="mt-2 space-y-1">
                          {form.getValues(`packages.${index}.includedItems`)?.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center justify-between py-1 px-3 bg-gray-50 rounded-md">
                              <span>{item}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIncludedItem(index, itemIndex)}
                                className="h-6 w-6"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>

                        <div className="flex mt-2">
                          <Input
                            value={packageBeingEdited === index ? includedItem : ""}
                            onChange={(e) => {
                              setPackageBeingEdited(index);
                              setIncludedItem(e.target.value);
                            }}
                            placeholder="Add an included item"
                            className="mr-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                appendIncludedItem(index);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => appendIncludedItem(index)}
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <CardFooter className="px-0 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/proposals")}
              >
                Cancel
              </Button>
              <div className="space-x-2">
                <Button 
                  type="submit" 
                  disabled={createProposalMutation.isPending || updateProposalMutation.isPending}
                >
                  {isEditing ? (
                    updateProposalMutation.isPending ? "Updating..." : "Update Proposal"
                  ) : (
                    createProposalMutation.isPending ? "Creating..." : "Create Proposal"
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
