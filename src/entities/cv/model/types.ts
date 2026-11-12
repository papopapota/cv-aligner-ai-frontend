import { z } from "zod"

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024

export const ACCEPTED_CV_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const cvFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  type: z.string().min(1),
  uploadedAt: z.string().min(1),
})

export type CvFile = z.infer<typeof cvFileSchema>

export const cvStatusSchema = z.string()

export const cvUploadResponseSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  content_type: z.string(),
  size_bytes: z.number().int().nonnegative(),
  sha256: z.string(),
  status: cvStatusSchema,
  action_required: z.string().nullable(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type CvUploadResponse = z.infer<typeof cvUploadResponseSchema>

export const cvStatusResponseSchema = cvUploadResponseSchema.extend({
  error_code: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
})

export type CvStatusResponse = z.infer<typeof cvStatusResponseSchema>

export const locationSchema = z
  .object({
    city: z.string().optional(),
    country: z.string().optional(),
  })
  .partial()

export const linksSchema = z
  .object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
  })
  .partial()

export const personalInfoSchema = z
  .object({
    full_name: z.string().optional(),
    headline: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: locationSchema.optional(),
    links: linksSchema.optional(),
  })
  .partial()
  .catchall(z.unknown())

export type PersonalInfo = z.infer<typeof personalInfoSchema>

export const technicalDataSchema = z
  .object({
    summary: z.string().optional(),
    technical_skills: z.string().optional(),
    experience: z.string().optional(),
    projects: z.string().optional(),
    education: z.string().optional(),
    certifications: z.string().optional(),
    languages: z.string().optional(),
  })
  .partial()
  .catchall(z.unknown())

export type TechnicalData = z.infer<typeof technicalDataSchema>

export const structuredCvSchema = z.object({
  personal_info: personalInfoSchema.optional(),
  technical_data: technicalDataSchema.optional(),
})

export type StructuredCv = z.infer<typeof structuredCvSchema>

export const cvContentResponseSchema = z.object({
  id: z.string().uuid(),
  status: cvStatusSchema,
  raw_text: z.string(),
  characters_extracted: z.number().int().nonnegative(),
  structured_cv: structuredCvSchema.nullable().optional(),
})

export type CvContentResponse = z.infer<typeof cvContentResponseSchema>
