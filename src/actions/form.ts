'use server'

import { db } from '@/lib/db'
import { currentUser } from '@/lib/auth-util'
import { FormState } from '@/types/form'
import { revalidatePath } from 'next/cache'
import { Node as FlowNode, Edge as FlowEdge } from 'reactflow'
import { Prisma } from '@prisma/client'

export async function getForm(formId: string) {
  const user = await currentUser()
  if (!user) return null

  return await db.form.findUnique({
    where: {
      id: formId,
      userId: user.id,
    },
    include: {
      nodes: true,
      edges: true,
    },
  })
}

export async function createForm(formState: FormState) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  const form = await db.form.create({
    data: {
      name: formState.settings.formName,
      userId: user.id,
      settings: formState.settings as unknown as Prisma.JsonObject,
      nodes: {
        create: formState.nodes.map((node: FlowNode) => ({
          id: node.id,
          type: node.type || 'questionNode',
          position: node.position as unknown as Prisma.JsonObject,
          data: node.data as unknown as Prisma.JsonObject,
        })),
      },
      edges: {
        create: formState.edges.map((edge: FlowEdge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'conditionalEdge',
          data: (edge.data || {
            condition: 'Always',
          }) as unknown as Prisma.JsonObject,
        })),
      },
    },
    include: {
      nodes: true,
      edges: true,
    },
  })

  revalidatePath('/forms')
  return form
}

export async function updateForm(formId: string, formState: FormState) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // First, verify the form belongs to the user
  const existingForm = await db.form.findUnique({
    where: {
      id: formId,
      userId: user.id,
    },
  })

  if (!existingForm) throw new Error('Form not found')

  // Delete existing nodes and edges
  await db.node.deleteMany({
    where: { formId },
  })
  await db.edge.deleteMany({
    where: { formId },
  })

  // Update the form with new data
  const updatedForm = await db.form.update({
    where: { id: formId },
    data: {
      name: formState.settings.formName,
      settings: formState.settings as unknown as Prisma.JsonObject,
      nodes: {
        create: formState.nodes.map((node: FlowNode) => ({
          id: node.id,
          type: node.type || 'questionNode',
          position: node.position as unknown as Prisma.JsonObject,
          data: node.data as unknown as Prisma.JsonObject,
        })),
      },
      edges: {
        create: formState.edges.map((edge: FlowEdge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'conditionalEdge',
          data: (edge.data || {
            condition: 'Always',
          }) as unknown as Prisma.JsonObject,
        })),
      },
    },
    include: {
      nodes: true,
      edges: true,
    },
  })

  revalidatePath('/forms')
  return updatedForm
}

export async function getAllForms() {
  const user = await currentUser()
  if (!user) return null

  return await db.form.findMany({
    where: {
      userId: user.id,
    },
  })
}

export async function deleteFormById(formId: string) {
  const user = await currentUser()
  if (!user) return null

  await db.form.delete({
    where: {
      id: formId,
      userId: user.id,
    },
  })
}

export async function renameForm(formId: string, newName: string) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // Verify the form belongs to the user
  const existingForm = await db.form.findUnique({
    where: {
      id: formId,
      userId: user.id,
    },
  })

  if (!existingForm) throw new Error('Form not found')

  // Update the form name
  const updatedForm = await db.form.update({
    where: { id: formId },
    data: { name: newName },
  })

  revalidatePath('/forms')
  return updatedForm
}

export async function checkEmailSubmission(formId: string, email: string) {
  try {
    // Verify the form exists and is published
    const form = await db.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        settings: true,
      },
    })

    if (!form) {
      throw new Error('Form not found')
    }

    const settings = form.settings as { isPublished?: boolean } & Record<
      string,
      unknown
    >
    if (!settings?.isPublished) {
      throw new Error('Form is not published')
    }

    // Check if there's already a response with this email
    const existingResponse = await db.formResponse.findFirst({
      where: {
        formId,
        responses: {
          path: ['email'],
          equals: email,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    })

    return {
      hasSubmitted: !!existingResponse,
      submissionId: existingResponse?.id,
      submittedAt: existingResponse?.createdAt,
    }
  } catch (error) {
    console.error('Error checking email submission:', error)
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to check email submission'
    )
  }
}

export async function submitFormResponse(
  formId: string,
  responses: Record<string, unknown>,
  metadata?: Record<string, unknown>
) {
  console.log('=== FORM SUBMISSION START ===')
  console.log('Form ID:', formId)
  console.log('Responses:', responses)
  console.log('Metadata:', metadata)

  try {
    // Input validation with detailed error messages
    if (!formId) {
      throw new Error('Form ID is required')
    }

    if (!responses || typeof responses !== 'object') {
      console.error('Invalid responses:', responses)
      throw new Error('Invalid form responses data')
    }

    // Ensure responses is serializable
    const serializedResponses = Object.entries(responses).reduce(
      (acc, [key, value]) => {
        // Handle Date objects
        if (value instanceof Date) {
          acc[key] = value.toISOString()
        }
        // Handle other values
        else {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>
    )

    console.log('Serialized responses:', serializedResponses)

    // Verify the form exists and is published
    const form = await db.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        name: true,
        settings: true,
        nodes: {
          select: {
            data: true,
          },
        },
      },
    })

    console.log('Form found:', !!form)
    if (!form) {
      throw new Error('Form not found')
    }

    const settings = form.settings as { isPublished?: boolean } & Record<
      string,
      unknown
    >
    console.log('Form settings:', settings)

    if (!settings?.isPublished) {
      throw new Error('Form is not published')
    }

    // Validate responses against form structure
    const formNodes = form.nodes || []
    const requiredFields = formNodes
      .filter((node: { data: unknown }) => {
        const nodeData = node.data as {
          required?: boolean
          variableName?: string
        }
        return nodeData?.required === true
      })
      .map((node: { data: unknown }) => {
        const nodeData = node.data as { variableName?: string }
        return nodeData?.variableName
      })
      .filter(Boolean) as string[]

    console.log('Form nodes count:', formNodes.length)
    console.log('Required fields found:', requiredFields)
    console.log('Responses received:', Object.keys(serializedResponses))

    // Check if all required fields are present (excluding email which is handled separately)
    for (const requiredField of requiredFields) {
      // Skip email validation as it's handled separately
      if (requiredField === 'email') continue

      if (
        !serializedResponses.hasOwnProperty(requiredField) ||
        serializedResponses[requiredField] === null ||
        serializedResponses[requiredField] === undefined ||
        (typeof serializedResponses[requiredField] === 'string' &&
          serializedResponses[requiredField].trim() === '')
      ) {
        console.error(`Validation failed for required field: ${requiredField}`)
        console.error('Available responses:', Object.keys(serializedResponses))
        console.error('Required fields:', requiredFields)
        throw new Error(`Required field '${requiredField}' is missing`)
      }
    }

    // Prepare enhanced metadata with proper serialization
    const enhancedMetadata = {
      submittedAt: new Date().toISOString(),
      userAgent: metadata?.userAgent || 'Unknown',
      ipAddress: metadata?.ipAddress || 'Unknown',
      formName: form.name,
      responseCount: Object.keys(serializedResponses).length,
      ...(metadata || {}),
    }

    console.log('Enhanced metadata:', enhancedMetadata)
    console.log('About to create form response...')

    // Validate data before database operation
    if (!serializedResponses || typeof serializedResponses !== 'object') {
      throw new Error('Invalid serialized responses data')
    }

    if (!enhancedMetadata || typeof enhancedMetadata !== 'object') {
      throw new Error('Invalid metadata data')
    }

    // Ensure objects are not null and are plain objects
    if (serializedResponses === null || Array.isArray(serializedResponses)) {
      throw new Error('Responses must be a valid object')
    }

    if (enhancedMetadata === null || Array.isArray(enhancedMetadata)) {
      throw new Error('Metadata must be a valid object')
    }

    // Create clean objects for database insertion
    const cleanResponses = JSON.parse(JSON.stringify(serializedResponses))
    const cleanMetadata = JSON.parse(JSON.stringify(enhancedMetadata))

    console.log('Clean responses:', cleanResponses)
    console.log('Clean metadata:', cleanMetadata)

    // Create the form response with validated data
    const formResponse = await db.formResponse
      .create({
        data: {
          formId,
          responses: cleanResponses,
          metadata: cleanMetadata,
        },
      })
      .catch((error) => {
        console.error('Database error details:', error)
        console.error('Database error code:', error.code)
        console.error('Database error message:', error.message)

        // Log the data that caused the error
        console.error('Data being inserted:', {
          formId,
          responses: cleanResponses,
          metadata: cleanMetadata,
          responsesType: typeof cleanResponses,
          metadataType: typeof cleanMetadata,
          responsesIsNull: cleanResponses === null,
          metadataIsNull: cleanMetadata === null,
        })

        throw new Error(`Database operation failed: ${error.message}`)
      })

    if (!formResponse) {
      throw new Error('Failed to create form response')
    }

    // Log successful submission
    console.log(
      `Form response submitted successfully for form ${formId}: ${formResponse.id}`
    )
    console.log('=== FORM SUBMISSION SUCCESS ===')

    return {
      success: true,
      responseId: formResponse.id,
      message: 'Form submitted successfully',
    }
  } catch (error) {
    console.error('=== FORM SUBMISSION ERROR ===')
    console.error('Error submitting form response:', error)
    console.error('Error details:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      formId,
      responses,
      metadata,
    })

    // Return structured error response
    throw new Error(
      error instanceof Error ? error.message : 'Failed to submit form response'
    )
  }
}

export async function publishForm(formId: string, shouldPublish: boolean) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // First, verify the form belongs to the user
  const existingForm = await db.form.findUnique({
    where: {
      id: formId,
      userId: user.id,
    },
  })

  if (!existingForm) throw new Error('Form not found')

  // Update the form's published status
  const updatedForm = await db.form.update({
    where: { id: formId },
    data: {
      settings: {
        ...(existingForm.settings as Record<string, unknown>),
        isPublished: shouldPublish,
      },
    },
  })

  revalidatePath('/forms')
  revalidatePath(`/f/${formId}`)
  return updatedForm
}

export async function getFormResponses(formId: string) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // First, verify the form belongs to the user
  const form = await db.form.findUnique({
    where: {
      id: formId,
      userId: user.id,
    },
  })

  if (!form) throw new Error('Form not found or you do not have access')

  // Get form responses
  const responses = await db.formResponse.findMany({
    where: {
      formId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return responses
}

export async function getFormResponsesCount(formId: string) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // First, verify the form belongs to the user
  const form = await db.form.findUnique({
    where: {
      id: formId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  })

  if (!form) throw new Error('Form not found or you do not have access')

  // Get form responses count
  const count = await db.formResponse.count({
    where: {
      formId,
    },
  })

  return count
}

export async function deleteFormResponse(formId: string, responseId: string) {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // First, verify the form belongs to the user
  const form = await db.form.findUnique({
    where: {
      id: formId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  })

  if (!form) throw new Error('Form not found or you do not have access')

  // Delete the form response
  await db.formResponse.delete({
    where: {
      id: responseId,
      formId: formId,
    },
  })

  revalidatePath(`/forms/${formId}/responses`)
  return { success: true }
}

export async function getPublicForm(formId: string) {
  try {
    const form = await db.form.findUnique({
      where: { id: formId },
      include: {
        nodes: true,
        edges: true,
      },
    })

    if (!form) {
      throw new Error('Form not found')
    }

    const settings = form.settings as { isPublished?: boolean } & Record<
      string,
      unknown
    >
    if (!settings?.isPublished) {
      throw new Error('Form is not published')
    }

    return {
      id: form.id,
      name: form.name,
      settings: form.settings,
      nodes: form.nodes,
      edges: form.edges,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    }
  } catch (error) {
    console.error('Error fetching public form:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch form'
    )
  }
}

export async function getAllFormResponses() {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // Get all form responses for forms belonging to the user
  const responses = await db.formResponse.findMany({
    where: {
      form: {
        userId: user.id,
      },
    },
    include: {
      form: {
        select: {
          id: true,
          name: true,
          nodes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return responses
}

export async function getUserForms() {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.id) throw new Error('Invalid user')

  // Get all forms belonging to the user
  const forms = await db.form.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return forms
}
