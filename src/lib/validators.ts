import { z } from "zod";

// Use string literals instead of @prisma/client enums to avoid build-time DB dependency
// These must stay in sync with prisma/schema.prisma enum values

// Shared Zod schema for login/authentication
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Shared Zod schema for creating/updating deals
export const dealSchema = z.object({
  title: z.string().min(2, "Deal title must be at least 2 characters."),
  value: z.coerce.number().positive("Deal value must be greater than 0."),
  probability: z.coerce.number().int().min(0, "Min 0%").max(100, "Max 100%"),
  stageId: z.string().min(1, "Please select a pipeline stage."),
  accountId: z.string().min(1, "Please select or create an account."),
  contactId: z.string().optional().nullable(),
  ownerId: z.string().min(1, "Please assign a deal owner."),
  expectedCloseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid expected close date.",
  }),
  status: z.enum(["OPEN", "WON", "LOST"]).default("OPEN"),
});
export type DealInput = z.infer<typeof dealSchema>;

// Shared Zod schema for drag-and-drop stage movement
export const updateStageSchema = z.object({
  dealId: z.string().min(1),
  newStageId: z.string().min(1),
  newProbability: z.coerce.number().int().min(0).max(100).optional(),
});
export type UpdateStageInput = z.infer<typeof updateStageSchema>;

// Shared Zod schema for creating accounts
export const accountSchema = z.object({
  name: z.string().min(2, "Account name must be at least 2 characters."),
  industry: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL (e.g. https://acme.com)")
    .optional()
    .or(z.literal("")),
});
export type AccountInput = z.infer<typeof accountSchema>;

// Shared Zod schema for creating contacts
export const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  accountId: z.string().min(1, "Contact must belong to an account."),
});
export type ContactInput = z.infer<typeof contactSchema>;

// Shared Zod schema for adding deal notes
export const noteSchema = z.object({
  dealId: z.string().min(1),
  content: z.string().min(1, "Note content cannot be empty."),
});
export type NoteInput = z.infer<typeof noteSchema>;

// Shared Zod schema for query filtering
export const dealFilterSchema = z.object({
  query: z.string().optional(),
  stageId: z.string().optional(),
  ownerId: z.string().optional(),
  status: z.enum(["OPEN", "WON", "LOST"]).optional(),
  sortBy: z.enum(["value", "expectedCloseDate", "createdAt", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});
export type DealFilterInput = z.infer<typeof dealFilterSchema>;
