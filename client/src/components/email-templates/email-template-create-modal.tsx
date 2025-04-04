import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertEmailTemplateSchema } from "@shared/schema";

interface EmailTemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

// Email template categories
const templateCategories = [
  "onboarding",
  "booking",
  "confirmation",
  "reminder",
  "delivery",
  "follow-up",
  "feedback",
  "thank-you",
  "marketing",
  "other",
];

// Extend the schema with validation
const emailTemplateFormSchema = insertEmailTemplateSchema.extend({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Email subject is required"),
  content: z.string().min(1, "Email content is required"),
  category: z.string().min(1, "Category is required"),
});

export function EmailTemplateCreateModal({
  isOpen,
  onClose,
  defaultCategory = "other",
}: EmailTemplateCreateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define form
  const form = useForm<z.infer<typeof emailTemplateFormSchema>>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      category: defaultCategory,
      description: "",
    },
  });

  // Create email template mutation
  const createEmailTemplate = useMutation({
    mutationFn: async (data: z.infer<typeof emailTemplateFormSchema>) => {
      const response = await apiRequest("POST", "/api/email-templates", data);
      return await response.json();
    },
    onSuccess: () => {
      // Show success notification
      toast({
        title: "Template created",
        description: "Email template has been created successfully",
      });
      // Reset form and close modal
      form.reset();
      onClose();
      // Refresh templates list
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/email-templates/category/${defaultCategory}`],
      });
    },
    onError: (error) => {
      console.error("Error creating email template:", error);
      toast({
        title: "Error",
        description: "Failed to create the email template",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof emailTemplateFormSchema>) => {
    createEmailTemplate.mutate(data);
  };

  return (
    <Modal
      title="Create Email Template"
      description="Create a reusable email template"
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="Welcome Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templateCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
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
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Welcome to our photography services!" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Internal Use)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of when to use this template"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your email content here..."
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEmailTemplate.isPending}>
              {createEmailTemplate.isPending ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}