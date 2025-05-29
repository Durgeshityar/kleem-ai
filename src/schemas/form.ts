import { z } from 'zod'

// Form Node Data Schema
export const FormNodeDataSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(1000, 'Question must be less than 1000 characters'),
  type: z.enum(
    [
      'text',
      'longText',
      'multipleChoice',
      'dropdown',
      'boolean',
      'date',
      'rating',
      'slider',
      'media',
    ],
    {
      errorMap: () => ({ message: 'Invalid question type selected' }),
    }
  ),
  required: z.boolean(),
  variableName: z
    .string()
    .min(1, 'Variable name is required')
    .max(50, 'Variable name must be less than 50 characters')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores'
    ),
  helpText: z
    .string()
    .max(500, 'Help text must be less than 500 characters')
    .optional(),
  options: z
    .array(z.string().max(200, 'Each option must be less than 200 characters'))
    .max(50, 'Maximum 50 options allowed')
    .optional()
    .refine((options) => !options || options.length > 0, {
      message: 'Options array cannot be empty when provided',
    }),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .max(1000, 'Image URL must be less than 1000 characters')
    .nullable()
    .optional(),
  videoUrl: z
    .string()
    .url('Video URL must be a valid URL')
    .max(1000, 'Video URL must be less than 1000 characters')
    .nullable()
    .optional(),
  pdfUrl: z
    .string()
    .url('PDF URL must be a valid URL')
    .max(1000, 'PDF URL must be less than 1000 characters')
    .nullable()
    .optional(),
  mediaTypes: z
    .array(z.enum(['image', 'video', 'pdf']))
    .optional()
    .refine((types) => !types || types.length > 0, {
      message: 'At least one media type must be selected',
    }),
})

// Form Edge Data Schema
export const FormEdgeDataSchema = z.object({
  condition: z
    .string()
    .min(1, 'Condition is required')
    .max(500, 'Condition must be less than 500 characters'),
})

// Form Settings Schema
export const FormSettingsSchema = z.object({
  formId: z
    .string()
    .min(1, 'Form ID is required')
    .cuid('Invalid form ID format'),
  formName: z
    .string()
    .min(1, 'Form name is required')
    .max(200, 'Form name must be less than 200 characters'),
  startNodeId: z
    .string()
    .min(1, 'Start node ID is required')
    .cuid('Invalid start node ID format'),
})

// Form Node Schema
export const FormNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required').cuid('Invalid node ID format'),
  formId: z
    .string()
    .min(1, 'Form ID is required')
    .cuid('Invalid form ID format'),
  type: z.string().min(1, 'Node type is required'),
  position: z.object({
    x: z.number().min(-10000).max(10000),
    y: z.number().min(-10000).max(10000),
  }),
  data: FormNodeDataSchema,
})

// Form Edge Schema
export const FormEdgeSchema = z.object({
  id: z.string().min(1, 'Edge ID is required').cuid('Invalid edge ID format'),
  formId: z
    .string()
    .min(1, 'Form ID is required')
    .cuid('Invalid form ID format'),
  source: z
    .string()
    .min(1, 'Source node ID is required')
    .cuid('Invalid source node ID format'),
  target: z
    .string()
    .min(1, 'Target node ID is required')
    .cuid('Invalid target node ID format'),
  type: z.string().min(1, 'Edge type is required'),
  data: FormEdgeDataSchema,
})

// Form State Schema
export const FormStateSchema = z.object({
  nodes: z.array(FormNodeSchema).min(1, 'At least one node is required'),
  edges: z.array(FormEdgeSchema),
  settings: FormSettingsSchema,
})

// API Request Schemas
export const CreateFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Form name is required')
    .max(200, 'Form name must be less than 200 characters'),
  userId: z
    .string()
    .min(1, 'User ID is required')
    .cuid('Invalid user ID format'),
  settings: FormSettingsSchema,
})

export const UpdateFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Form name is required')
      .max(200, 'Form name must be less than 200 characters')
      .optional(),
    nodes: z
      .array(FormNodeSchema)
      .min(1, 'At least one node is required')
      .optional(),
    edges: z.array(FormEdgeSchema).optional(),
    settings: FormSettingsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  })

// Form Response Schema
export const FormResponseSchema = z
  .object({
    id: z.string().min(1, 'Form ID is required').cuid('Invalid form ID format'),
    name: z
      .string()
      .min(1, 'Form name is required')
      .max(200, 'Form name must be less than 200 characters'),
    userId: z
      .string()
      .min(1, 'User ID is required')
      .cuid('Invalid user ID format'),
    createdAt: z.date(),
    updatedAt: z.date(),
    nodes: z.array(FormNodeSchema).min(1, 'At least one node is required'),
    edges: z.array(FormEdgeSchema),
    settings: FormSettingsSchema,
  })
  .refine((data) => data.updatedAt >= data.createdAt, {
    message: 'Updated at date cannot be before created at date',
    path: ['updatedAt'],
  })

// Type exports
export type FormNodeData = z.infer<typeof FormNodeDataSchema>
export type FormEdgeData = z.infer<typeof FormEdgeDataSchema>
export type FormSettings = z.infer<typeof FormSettingsSchema>
export type FormNode = z.infer<typeof FormNodeSchema>
export type FormEdge = z.infer<typeof FormEdgeSchema>
export type FormState = z.infer<typeof FormStateSchema>
export type CreateFormRequest = z.infer<typeof CreateFormSchema>
export type UpdateFormRequest = z.infer<typeof UpdateFormSchema>
export type FormResponse = z.infer<typeof FormResponseSchema>
