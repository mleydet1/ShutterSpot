import { z } from "zod";

// Gallery schema for form validation
export const galleryFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  clientId: z.coerce.number().min(1, { message: "Please select a client" }),
  shootId: z.coerce.number().optional(),
  description: z.string().optional(),
  status: z.string().default("draft"),
  password: z.string().optional(),
  isPasswordProtected: z.boolean().default(false),
  expiryDate: z.date().optional().nullable(),
  hasExpiry: z.boolean().default(false),
});

// Type inferred from the schema
export type GalleryFormValues = z.infer<typeof galleryFormSchema>;
