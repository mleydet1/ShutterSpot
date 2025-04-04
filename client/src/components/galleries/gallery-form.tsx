import React, { useEffect, useState } from "react";
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
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CalendarIcon, Upload, ImagePlus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Client, Shoot } from "@/types";

// Create a schema for gallery validation
const gallerySchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  clientId: z.coerce.number().min(1, { message: "Please select a client" }),
  shootId: z.coerce.number().optional(),
  coverImage: z.string().optional(),
  photos: z.array(z.object({
    id: z.number(),
    url: z.string(),
    thumbnailUrl: z.string(),
    filename: z.string(),
    size: z.number(),
    width: z.number(),
    height: z.number(),
    uploadedAt: z.string()
  })).default([]),
  status: z.string().min(1, { message: "Please select a status" }),
  password: z.string().optional(),
  isPasswordProtected: z.boolean().default(false),
  expiryDate: z.date().optional().nullable(),
  hasExpiry: z.boolean().default(false),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

interface GalleryFormProps {
  defaultValues?: Partial<GalleryFormValues>;
  galleryId?: number;
  isEditing?: boolean;
  clientId?: number;
  shootId?: number;
}

export function GalleryForm({ defaultValues, galleryId, isEditing = false, clientId, shootId }: GalleryFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [uploadedThumbnails, setUploadedThumbnails] = useState<string[]>([]);

  // Fetch available clients
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Fetch available shoots
  const { data: shoots = [] } = useQuery({
    queryKey: ['/api/shoots'],
  });

  // Initialize form with default values
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: "",
      clientId: clientId ? Number(clientId) : undefined,
      shootId: shootId ? Number(shootId) : undefined,
      coverImage: "",
      photos: [],
      status: "draft",
      password: "",
      isPasswordProtected: false,
      expiryDate: null,
      hasExpiry: false,
      ...defaultValues,
    },
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
  
  // Watch password protection status
  const isPasswordProtected = form.watch("isPasswordProtected");
  
  // Watch expiry date status
  const hasExpiry = form.watch("hasExpiry");

  // Get filtered shoots based on selected client
  const getClientShoots = () => {
    const clientId = form.watch("clientId");
    if (!clientId) return [];
    return shoots.filter((shoot: Shoot) => shoot.clientId === clientId);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // In a real app, you would upload these to a server
      // For now, just create object URLs for preview
      const newThumbnails = filesArray.map(file => URL.createObjectURL(file));
      
      setUploadedPhotos(prev => [...prev, ...filesArray]);
      setUploadedThumbnails(prev => [...prev, ...newThumbnails]);
      
      // Create mock photo objects
      const mockPhotos = filesArray.map((file, index) => ({
        id: Date.now() + index,
        url: newThumbnails[index],
        thumbnailUrl: newThumbnails[index],
        filename: file.name,
        size: file.size,
        width: 800, // Mock values
        height: 600, // Mock values
        uploadedAt: new Date().toISOString()
      }));
      
      // Update form value
      const currentPhotos = form.getValues("photos") || [];
      form.setValue("photos", [...currentPhotos, ...mockPhotos]);
    }
  };

  // Remove a photo
  const removePhoto = (index: number) => {
    const currentPhotos = [...form.getValues("photos")];
    currentPhotos.splice(index, 1);
    form.setValue("photos", currentPhotos);
    
    // Also cleanup preview URLs
    if (uploadedThumbnails[index]) {
      URL.revokeObjectURL(uploadedThumbnails[index]);
      const newThumbnails = [...uploadedThumbnails];
      newThumbnails.splice(index, 1);
      setUploadedThumbnails(newThumbnails);
      
      const newFiles = [...uploadedPhotos];
      newFiles.splice(index, 1);
      setUploadedPhotos(newFiles);
    }
  };

  // Create gallery mutation
  const createGalleryMutation = useMutation({
    mutationFn: async (data: GalleryFormValues) => {
      // Remove fields we don't want to send to the API
      const { isPasswordProtected, hasExpiry, ...apiData } = data;
      
      // If not password protected, remove password
      if (!isPasswordProtected) {
        apiData.password = undefined;
      }
      
      // If no expiry, remove expiry date
      if (!hasExpiry) {
        apiData.expiryDate = undefined;
      }
      
      const response = await apiRequest("POST", "/api/galleries", apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Success",
        description: "Gallery created successfully",
      });
      navigate("/galleries");
      
      // Cleanup any object URLs
      uploadedThumbnails.forEach(url => URL.revokeObjectURL(url));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create gallery. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating gallery:", error);
    },
  });

  // Update gallery mutation
  const updateGalleryMutation = useMutation({
    mutationFn: async (data: GalleryFormValues) => {
      // Remove fields we don't want to send to the API
      const { isPasswordProtected, hasExpiry, ...apiData } = data;
      
      // If not password protected, remove password
      if (!isPasswordProtected) {
        apiData.password = undefined;
      }
      
      // If no expiry, remove expiry date
      if (!hasExpiry) {
        apiData.expiryDate = undefined;
      }
      
      const response = await apiRequest("PUT", `/api/galleries/${galleryId}`, apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      queryClient.invalidateQueries({ queryKey: [`/api/galleries/${galleryId}`] });
      toast({
        title: "Success",
        description: "Gallery updated successfully",
      });
      navigate(`/galleries/${galleryId}`);
      
      // Cleanup any object URLs
      uploadedThumbnails.forEach(url => URL.revokeObjectURL(url));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update gallery. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating gallery:", error);
    },
  });

  // Form submission
  const onSubmit = (data: GalleryFormValues) => {
    if (isEditing && galleryId) {
      updateGalleryMutation.mutate(data);
    } else {
      createGalleryMutation.mutate(data);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Gallery" : "New Gallery"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gallery Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for this gallery" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="password_protected">Password Protected</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <FormField
                  control={form.control}
                  name="isPasswordProtected"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Password Protection</FormLabel>
                        <FormDescription>
                          Require a password to view this gallery
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isPasswordProtected && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="ml-7">
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter a password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <FormField
                  control={form.control}
                  name="hasExpiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set Expiry Date</FormLabel>
                        <FormDescription>
                          Gallery will be automatically archived after this date
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {hasExpiry && (
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col ml-7">
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
                )}
              </div>
            </div>

            <div className="border rounded-md p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Upload Photos</h3>
                  <div className="w-full max-w-xs">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 border border-primary-200">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Select Files</span>
                      </div>
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <FormLabel>Gallery Photos</FormLabel>
                  <FormDescription>
                    Upload photos to include in this gallery
                  </FormDescription>

                  <div className="mt-3">
                    {form.getValues("photos")?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md py-8 px-4">
                        <ImagePlus className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No photos added yet</p>
                        <p className="text-xs text-gray-400">Click 'Select Files' to upload photos</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {form.getValues("photos").map((photo, index) => (
                          <div key={photo.id} className="relative group">
                            <div className="overflow-hidden rounded-md aspect-square bg-gray-50">
                              <img
                                src={photo.thumbnailUrl}
                                alt={photo.filename}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4 text-gray-700" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/galleries")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createGalleryMutation.isPending || updateGalleryMutation.isPending}
              >
                {isEditing ? (
                  updateGalleryMutation.isPending ? "Updating..." : "Update Gallery"
                ) : (
                  createGalleryMutation.isPending ? "Creating..." : "Create Gallery"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
