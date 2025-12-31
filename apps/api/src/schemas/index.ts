import { z } from "zod";

// ============================================================================
// Shared Enums and Constants
// ============================================================================

export const programs = ["ftc", "frc", "mate", "vex", "tarc", "other"] as const;
export const programSchema = z.enum(programs);

export const teamRoles = ["admin", "mentor", "student"] as const;
export const teamRoleSchema = z.enum(teamRoles);

export const subsystems = [
  "drivetrain",
  "intake",
  "lift",
  "scoring",
  "electronics",
  "hardware",
  "other",
] as const;
export const subsystemSchema = z.enum(subsystems);

export const orderStatuses = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "ordered",
  "received",
] as const;
export const orderStatusSchema = z.enum(orderStatuses);

// ============================================================================
// Team Schemas
// ============================================================================

export const createTeamSchema = z.object({
  name: z
    .string({ error: "Team name is required" })
    .min(1, "Team name is required")
    .max(100, "Team name must be 100 characters or less")
    .transform((v) => v.trim()),
  number: z
    .string({ error: "Team number is required" })
    .regex(/^\d+$/, "Team number must be numeric")
    .transform((v) => v.trim()),
  season: z
    .string({ error: "Season is required" })
    .min(1, "Season is required"),
  program: programSchema.optional().default("ftc"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

// ============================================================================
// Team Member Schemas
// ============================================================================

export const updateMemberRoleSchema = z.object({
  role: teamRoleSchema,
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const createInviteSchema = z.object({
  role: teamRoleSchema.optional().default("student"),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

// ============================================================================
// Part Schemas
// ============================================================================

export const createPartSchema = z.object({
  name: z
    .string({ error: "Part name is required" })
    .min(1, "Part name is required")
    .max(200, "Part name must be 200 characters or less")
    .transform((v) => v.trim()),
  sku: z
    .string()
    .max(100, "SKU must be 100 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
  vendorId: z.string().uuid().nullable().optional(),
  quantity: z
    .union([z.string(), z.number()])
    .transform((v) => parseInt(String(v)) || 0)
    .optional()
    .default(0),
  reorderPoint: z
    .union([z.string(), z.number()])
    .transform((v) => parseInt(String(v)) || 0)
    .optional()
    .default(0),
  location: z
    .string()
    .max(100, "Location must be 100 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
  unitPrice: z
    .union([z.string(), z.number()])
    .transform((v) => parseFloat(String(v)) || 0)
    .optional()
    .default(0),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
});

export type CreatePartInput = z.infer<typeof createPartSchema>;

export const updatePartSchema = createPartSchema;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;

// ============================================================================
// Order Schemas
// ============================================================================

const orderItemSchema = z.object({
  partId: z.string({ error: "Part ID is required" }).uuid(),
  quantity: z
    .union([z.string(), z.number()])
    .transform((v) => parseInt(String(v)) || 1)
    .optional()
    .default(1),
  unitPrice: z
    .union([z.string(), z.number()])
    .transform((v) => parseFloat(String(v)) || 0)
    .optional()
    .default(0),
});

export const createOrderSchema = z.object({
  vendorId: z.string().uuid().nullable().optional(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  vendorId: z.string().uuid().nullable().optional(),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export const rejectOrderSchema = z.object({
  reason: z
    .string()
    .max(1000, "Rejection reason must be 1000 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
});

export type RejectOrderInput = z.infer<typeof rejectOrderSchema>;

// ============================================================================
// BOM Schemas
// ============================================================================

export const createBomItemSchema = z.object({
  partId: z.string({ error: "Part ID is required" }).uuid(),
  subsystem: subsystemSchema,
  quantityNeeded: z
    .union([z.string(), z.number()])
    .transform((v) => parseInt(String(v)) || 1)
    .optional()
    .default(1),
  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
});

export type CreateBomItemInput = z.infer<typeof createBomItemSchema>;

export const updateBomItemSchema = z.object({
  subsystem: subsystemSchema.optional(),
  quantityNeeded: z
    .union([z.string(), z.number()])
    .transform((v) => parseInt(String(v)) || 1)
    .optional()
    .default(1),
  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .transform((v) => v?.trim() || null)
    .nullable()
    .optional(),
});

export type UpdateBomItemInput = z.infer<typeof updateBomItemSchema>;

// ============================================================================
// Season Schemas
// ============================================================================

export const createSeasonSchema = z.object({
  seasonYear: z
    .string({ error: "Season year is required" })
    .regex(
      /^\d{4}-\d{4}$/,
      "Season year must be in format YYYY-YYYY (e.g., 2024-2025)"
    )
    .refine((v) => {
      const [start, end] = v.split("-").map(Number);
      return end === start + 1;
    }, "End year must be one year after start year"),
  seasonName: z
    .string({ error: "Season name is required" })
    .min(1, "Season name is required")
    .max(100, "Season name must be 100 characters or less")
    .transform((v) => v.trim()),
  startDate: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  endDate: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  copyMembers: z.boolean().optional().default(false),
  copyRobots: z.boolean().optional().default(false),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;

export const updateSeasonSchema = z.object({
  seasonYear: z
    .string()
    .regex(
      /^\d{4}-\d{4}$/,
      "Season year must be in format YYYY-YYYY (e.g., 2024-2025)"
    )
    .refine((v) => {
      const [start, end] = v.split("-").map(Number);
      return end === start + 1;
    }, "End year must be one year after start year")
    .optional(),
  seasonName: z
    .string()
    .min(1, "Season name is required")
    .max(100, "Season name must be 100 characters or less")
    .transform((v) => v.trim())
    .optional(),
  startDate: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  endDate: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullable()
    .optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;

// ============================================================================
// Validation Error Response Helper
// ============================================================================

export interface ValidationError {
  error: string;
  code: "validation_error";
  details: Array<{
    path: (string | number | symbol)[];
    message: string;
  }>;
}

export function formatZodError(error: z.ZodError): ValidationError {
  return {
    error: "Validation failed",
    code: "validation_error",
    details: error.issues.map((issue) => ({
      path: issue.path as (string | number | symbol)[],
      message: issue.message,
    })),
  };
}
