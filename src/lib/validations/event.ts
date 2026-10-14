// src/lib/validations/event.ts
import { z } from "zod";

export const CreateEventSchema = z.object({
  title:       z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  imageUrl:    z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location:    z.string().optional(),
  country:     z.string().optional(),
  city:        z.string().optional(),
  startDate:   z.string().min(1, "Start date is required"),
  endDate:     z.string().optional(),
  websiteUrl:  z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured:    z.boolean().default(false),
  source:      z.string().default("manual"),
});

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
