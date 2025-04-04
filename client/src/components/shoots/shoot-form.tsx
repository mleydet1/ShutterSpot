import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Client } from "@/types";

// Create a schema for shoot validation
const shootSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  clientId: z.coerce.number().min(1, { message: "Please select a client" }),
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, { message: "Please select a start time" }),
  endTime: z.string().min(1, { message: "Please select an end time" }),
  location: z.string().min(1, { message: "Location is required" }),
  status: z.string().min(1, { message: "Please select a status" }),
  notes: z.string().optional(),
});

type ShootFormValues = z.infer<typeof shootSchema>;

interface ShootFormProps {
  defaultValues?: Partial<ShootFormValues>;
  shootId?: number;
  isEditing?: boolean;
  clientId?: number;
}

export function ShootForm({ defaultValues, shootId, isEditing = false, clientId }: ShootFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available clients
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Initialize form with default values
  const form = useForm<ShootFormValues>({
    resolver: zodResolver(shootSchema),
    defaultValues: {
      title: "",
      clientId: clientId ? Number(clientId) : undefined,
      date: undefined,
      startTime: "",
      endTime: "",
      location: "",
      status: "pending",
      notes: "",
      ...defaultValues,
    },
  });

  // Update client ID if provided in URL
  useEffect(() => {
    if (clientId && !form.getValues().clientId) {
      form.setValue("clientId", Number(clientId));
    }
  }, [clientId, form]);

  // Create shoot mutation
  const createShootMutation = useMutation({
    mutationFn: async (data: ShootFormValues) => {
      const response = await apiRequest("POST", "/api/shoots", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots/upcoming"] });
      toast({
        title: "Success",
        description: "Shoot created successfully",
      });
      navigate("/shoots");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create shoot. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating shoot:", error);
    },
  });

  // Update shoot mutation
  const updateShootMutation = useMutation({
    mutationFn: async (data: ShootFormValues) => {
      const response = await apiRequest("PUT", `/api/shoots/${shootId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots/upcoming"] });
      queryClient.invalidateQueries({ queryKey: [`/api/shoots/${shootId}`] });
      toast({
        title: "Success",
        description: "Shoot updated successfully",
      });
      navigate(`/shoots/${shootId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update shoot. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating shoot:", error);
    },
  });

  // Form submission
  const onSubmit = (data: ShootFormValues) => {
    if (isEditing && shootId) {
      updateShootMutation.mutate(data);
    } else {
      createShootMutation.mutate(data);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Shoot" : "New Shoot"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Shoot title" {...field} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="Start time"
                          {...field}
                        />
                      </FormControl>
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="time"
                          placeholder="End time"
                          {...field}
                        />
                      </FormControl>
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about the shoot"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/shoots")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createShootMutation.isPending || updateShootMutation.isPending}
              >
                {isEditing ? (
                  updateShootMutation.isPending ? "Updating..." : "Update Shoot"
                ) : (
                  createShootMutation.isPending ? "Creating..." : "Create Shoot"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
