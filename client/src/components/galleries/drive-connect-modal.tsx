import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/api";

// Define the form schema
const driveConnectSchema = z.object({
  gallery_id: z.string().min(1, "Gallery is required"),
  drive_folder_id: z.string().min(1, "Google Drive folder ID is required"),
  auto_sync: z.boolean().default(true),
});

type DriveConnectFormValues = z.infer<typeof driveConnectSchema>;

interface DriveConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DriveConnectModal({
  open,
  onOpenChange,
  onSuccess,
}: DriveConnectModalProps) {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"initial" | "authorize" | "connect">("initial");
  const [authCode, setAuthCode] = useState("");

  // Initialize form
  const form = useForm<DriveConnectFormValues>({
    resolver: zodResolver(driveConnectSchema),
    defaultValues: {
      gallery_id: "",
      drive_folder_id: "",
      auto_sync: true,
    },
  });

  // Fetch galleries
  const { data: galleries, isLoading: galleriesLoading } = useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/galleries");
        return await response.json();
      } catch (error) {
        console.error("Error fetching galleries:", error);
        return [];
      }
    },
    enabled: open,
  });

  // Fetch Google Drive folders
  const { data: driveFolders, isLoading: foldersLoading, refetch: refetchFolders } = useQuery({
    queryKey: ["drive-folders"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/drive/folders");
        return await response.json();
      } catch (error) {
        console.error("Error fetching drive folders:", error);
        // If we get a 401, we need to authorize
        if (error instanceof Response && error.status === 401) {
          setAuthStep("authorize");
          return { folders: [] };
        }
        return { folders: [] };
      }
    },
    enabled: open && authStep !== "authorize",
  });

  // Mutation to initiate Google Drive authorization
  const initiateAuth = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/drive/auth");
      return await response.json();
    },
    onSuccess: (data) => {
      setAuthUrl(data.auth_url);
    },
    onError: (error) => {
      toast.error("Failed to initiate Google Drive authorization");
      console.error("Auth error:", error);
    },
  });

  // Mutation to complete Google Drive authorization
  const completeAuth = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/drive/auth/complete", {
        auth_code: code,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Google Drive connected successfully");
      setAuthStep("connect");
      refetchFolders();
    },
    onError: (error) => {
      toast.error("Failed to connect Google Drive");
      console.error("Auth completion error:", error);
    },
  });

  // Mutation to connect a Drive folder to a gallery
  const connectDrive = useMutation({
    mutationFn: async (data: DriveConnectFormValues) => {
      const response = await apiRequest("POST", "/api/drive/connections", {
        gallery_id: parseInt(data.gallery_id),
        drive_folder_id: data.drive_folder_id,
        auto_sync: data.auto_sync,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Google Drive folder connected to gallery");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to connect Google Drive folder");
      console.error("Connection error:", error);
    },
  });

  // Handle form submission
  const onSubmit = (data: DriveConnectFormValues) => {
    connectDrive.mutate(data);
  };

  // Handle authorization initiation
  const handleInitiateAuth = () => {
    initiateAuth.mutate();
  };

  // Handle authorization code submission
  const handleCompleteAuth = () => {
    if (authCode.trim()) {
      completeAuth.mutate(authCode);
    } else {
      toast.error("Please enter the authorization code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Google Drive</DialogTitle>
          <DialogDescription>
            Connect a Google Drive folder to your gallery for automatic photo syncing.
          </DialogDescription>
        </DialogHeader>

        {authStep === "initial" && (
          <div className="space-y-4 py-4">
            <p>
              To connect your Google Drive, you'll need to authorize access to your
              Drive folders.
            </p>
            <Button
              onClick={handleInitiateAuth}
              disabled={initiateAuth.isPending}
              className="w-full"
            >
              {initiateAuth.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Google Drive"
              )}
            </Button>
          </div>
        )}

        {authStep === "authorize" && authUrl && (
          <div className="space-y-4 py-4">
            <p>
              Please click the link below to authorize access to your Google Drive:
            </p>
            <div className="flex items-center space-x-2">
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                Open Google Authorization <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              After authorization, you'll receive a code. Paste it below:
            </p>
            <Input
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Paste authorization code here"
            />
            <Button
              onClick={handleCompleteAuth}
              disabled={completeAuth.isPending || !authCode.trim()}
              className="w-full"
            >
              {completeAuth.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Submit Authorization Code"
              )}
            </Button>
          </div>
        )}

        {authStep === "connect" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="gallery_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gallery</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gallery" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {galleriesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading galleries...
                          </SelectItem>
                        ) : galleries && galleries.length > 0 ? (
                          galleries.map((gallery: any) => (
                            <SelectItem key={gallery.id} value={gallery.id.toString()}>
                              {gallery.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No galleries found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drive_folder_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Drive Folder</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select folder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {foldersLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading folders...
                          </SelectItem>
                        ) : driveFolders && driveFolders.folders && driveFolders.folders.length > 0 ? (
                          driveFolders.folders.map((folder: any) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No folders found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_sync"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Automatically sync photos from this folder
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={connectDrive.isPending}
                >
                  {connectDrive.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Folder"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
