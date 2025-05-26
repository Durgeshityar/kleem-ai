'use client'

import type React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Node, Edge } from 'reactflow'
import { FormNodeData, FormEdgeData } from '@/types/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import {
  CalendarIcon,
  StarIcon,
  SendIcon,
  AlertCircleIcon,
  RefreshCcwIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { submitFormResponse, checkEmailSubmission } from '@/actions/form'
import { findNextNode } from '@/utils/form-utils'
import { generateConversationalResponse } from '@/utils/openai-utils'

type QuestionType =
  | 'text'
  | 'longText'
  | 'multipleChoice'
  | 'date'
  | 'rating'
  | 'boolean'
  | 'dropdown'
  | 'slider'

type FormValue = string | number | boolean | Date

interface UnifiedFormResponseProps {
  nodes: Node<FormNodeData>[]
  edges: Edge<FormEdgeData>[]
  startNode: Node<FormNodeData> | null
  formId?: string
  formName?: string
  settings: {
    primaryColor: string
    showBranding: boolean
  }
  // Mode configuration
  mode: 'live' | 'preview'
  // Preview-specific props
  customStyles?: {
    primaryColor?: string
    showBranding?: boolean
    formTitle?: string
    hideStartOver?: boolean
    restrictFeatures?: boolean
    useAI?: boolean
  }
}

interface Message {
  id: string
  type: 'system' | 'user'
  content: React.ReactNode
  questionNode?: Node<FormNodeData>
  variableName?: string
  value?: FormValue
  inputType?: QuestionType
  isTyping?: boolean
  originalQuestion?: string
}

interface ValidationError {
  field: string
  message: string
}

export function UnifiedFormResponse({
  nodes,
  edges,
  startNode,
  formId,
  formName,
  settings,
  mode = 'live',
  customStyles,
}: UnifiedFormResponseProps) {
  const [currentNode, setCurrentNode] = useState<Node<FormNodeData> | null>(
    null
  )
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState<string>('')
  const [currentSliderValue, setCurrentSliderValue] = useState<number>(50)
  const [isComplete, setIsComplete] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  const [isEditingSpecific, setIsEditingSpecific] = useState(false)
  const [editingNodeData, setEditingNodeData] = useState<{
    node: Node<FormNodeData>
    variable: string
    currentValue: FormValue
  } | null>(null)

  // Add state for tracking question progress
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalQuestions] = useState(0)
  const [isResponseSubmitted, setIsResponseSubmitted] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  // Email validation states
  const [isEmailValidationMode, setIsEmailValidationMode] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Smart style resolution - preview styles override live styles
  const resolvedStyles = {
    primaryColor:
      customStyles?.primaryColor || settings?.primaryColor || '#3b82f6',
    showBranding: customStyles?.showBranding ?? settings?.showBranding ?? true,
    formTitle: customStyles?.formTitle || formName,
    useAI: customStyles?.useAI ?? true,
  }

  // Validate input based on node configuration
  const validateInput = useCallback(
    (value: FormValue, node: Node<FormNodeData>): ValidationError | null => {
      const { type, required } = node.data

      if (
        required &&
        (!value || (typeof value === 'string' && value.trim() === ''))
      ) {
        return {
          field: node.data.variableName,
          message: 'This field is required',
        }
      }

      // Basic validation for text types
      if (type === 'text' || type === 'longText') {
        const stringValue = String(value)

        // Basic length checks for live mode
        if (mode === 'live' && stringValue.length > 10000) {
          return {
            field: node.data.variableName,
            message: 'Text is too long (maximum 10,000 characters)',
          }
        }
      }

      return null
    },
    [mode]
  )

  // Reset the form to initial state
  const resetForm = useCallback(async () => {
    setCurrentNode(null)
    setFormValues({})
    setMessages([])
    setCurrentInput('')
    setCurrentSliderValue(50)
    setIsComplete(false)
    setIsReviewMode(false)
    setValidationErrors([])
    setIsSubmitting(false)
    setShowInput(false)
    setIsEditingSpecific(false)
    setEditingNodeData(null)
    setShouldScrollToBottom(true)
    setCurrentQuestionIndex(1)
    setIsResponseSubmitted(false)
    setIsFormSubmitted(false)

    // Reset email validation states
    setIsEmailValidationMode(false)
    setEmailInput('')
    setIsCheckingEmail(false)

    if (startNode) {
      const welcomeId = `welcome-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`

      // Create different welcome messages based on mode
      let welcomeMessage =
        mode === 'live'
          ? `Hi there! 👋 Welcome to ${
              resolvedStyles.formTitle || 'this form'
            }. Let's start with: ${replacePlaceholders(
              startNode.data.question
            )}`
          : `Hi there! 👋 I'd love to learn more about you. Let's start with: ${replacePlaceholders(
              startNode.data.question
            )}`

      // Try to use AI for enhanced conversational flow if available
      if (resolvedStyles.useAI) {
        try {
          const contextInfo = `
            Original Question: "${startNode.data.question}"
            Form Name: "${resolvedStyles.formTitle || 'this form'}"
            Mode: "${mode}"
            
            Instructions:
            1. Create a warm, brief greeting (1-2 sentences max)
            2. MUST include the EXACT original question at the end
            3. DO NOT rephrase or modify the original question
            4. DO NOT explain how to answer or mention the options
            5. Keep the conversational tone light and friendly
            
            Example format:
            "Hi! 👋 ${
              mode === 'live'
                ? `Welcome to ${resolvedStyles.formTitle || 'this form'}`
                : 'Great to meet you'
            }. ${startNode.data.question}"
          `

          const aiResponse = await generateConversationalResponse(
            welcomeMessage,
            contextInfo
          )
          welcomeMessage = aiResponse
        } catch (error) {
          console.error('Error generating AI responses:', error)
          // Fall back to default message if AI fails
        }
      }

      setMessages([
        {
          id: welcomeId,
          type: 'system',
          content: <p>{welcomeMessage}</p>,
          questionNode: startNode,
          variableName: startNode.data.variableName,
          inputType: startNode.data.type,
          originalQuestion: startNode.data.question,
        },
      ])

      setCurrentNode(startNode)
      // Show input for the first question immediately since there's no typing animation
      setShowInput(true)
    }
  }, [startNode, mode, resolvedStyles.formTitle, resolvedStyles.useAI])

  useEffect(() => {
    if (messages.length === 0) {
      if (mode === 'live' && formId) {
        // Live mode with form ID - check email first
        startEmailValidation()
      } else {
        // Preview mode - start normally
        resetForm()
      }
    }
  }, [startNode, nodes, mode, formId, messages.length, resetForm])

  // Scroll to bottom when messages change (but not during editing)
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom()
    }
  }, [messages, shouldScrollToBottom])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle scrolling behavior when user manually scrolls
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

      // Only update if the value actually changes to prevent unnecessary re-renders
      if (isAtBottom !== shouldScrollToBottom) {
        setShouldScrollToBottom(isAtBottom)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [shouldScrollToBottom])

  // Start email validation flow
  const startEmailValidation = () => {
    setIsEmailValidationMode(true)
    setMessages([
      {
        id: `email-validation-${Date.now()}`,
        type: 'system',
        content: (
          <p>
            Hi there! 👋 Before we begin, I need to collect your email address
            to ensure you haven&apos;t already submitted a response to this
            form.
          </p>
        ),
      },
    ])
    setShowInput(true)
  }

  // Handle email validation
  const handleEmailValidation = async (email: string) => {
    if (!formId) return

    setIsCheckingEmail(true)
    setEmailInput(email)

    try {
      const result = await checkEmailSubmission(formId, email)

      if (result.hasSubmitted) {
        // Email has already submitted
        setMessages((prev) => [
          ...prev,
          {
            id: `user-email-${Date.now()}`,
            type: 'user',
            content: email,
          },
          {
            id: `email-exists-${Date.now()}`,
            type: 'system',
            content: (
              <div className="space-y-2">
                <p>
                  Thank you! I found that this email address has already
                  submitted a response to this form.
                </p>
                <p className="text-sm text-gray-600">
                  Submitted on:{' '}
                  {result.submittedAt
                    ? new Date(result.submittedAt).toLocaleDateString()
                    : 'Unknown date'}
                </p>
                <p className="text-sm text-gray-600">
                  If you believe this is an error, please contact the form
                  administrator.
                </p>
              </div>
            ),
          },
        ])
        setIsComplete(true)
        setShowInput(false)
      } else {
        // Email is new, proceed with form
        setMessages((prev) => [
          ...prev,
          {
            id: `user-email-${Date.now()}`,
            type: 'user',
            content: email,
          },
          {
            id: `email-validated-${Date.now()}`,
            type: 'system',
            content: (
              <p>
                Perfect! ✅ Your email has been verified. Let&apos;s proceed
                with the form.
              </p>
            ),
          },
        ])

        // Store email in form values
        setFormValues({ email })
        setIsEmailValidationMode(false)

        // Start the actual form after a brief delay
        setTimeout(() => {
          proceedWithForm()
        }, 1000)
      }
    } catch (error) {
      console.error('Email validation error:', error)
      toast.error('Failed to validate email. Please try again.')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Proceed with the actual form after email validation
  const proceedWithForm = async () => {
    if (!startNode) return

    const welcomeId = `welcome-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`

    let welcomeMessage = `Great! Now let's get started: ${startNode.data.question}`

    // Try to use AI for enhanced conversational flow if available
    if (resolvedStyles.useAI) {
      try {
        const contextInfo = `
          Original Question: "${startNode.data.question}"
          Form Name: "${resolvedStyles.formTitle || 'this form'}"
          Context: User has just provided their email and we're starting the form
          
          Instructions:
          1. Create a brief transition (1-2 sentences max)
          2. MUST include the EXACT original question at the end
          3. DO NOT rephrase or modify the original question
          4. Keep it conversational and smooth
          
          Example format:
          "Great! Now let's get started. ${startNode.data.question}"
        `

        const aiResponse = await generateConversationalResponse(
          welcomeMessage,
          contextInfo
        )
        welcomeMessage = aiResponse
      } catch (error) {
        console.error('Error generating AI response:', error)
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: welcomeId,
        type: 'system',
        content: <p>{welcomeMessage}</p>,
        questionNode: startNode,
        variableName: startNode.data.variableName,
        inputType: startNode.data.type,
        originalQuestion: startNode.data.question,
      },
    ])

    setCurrentNode(startNode)
    setShowInput(true)
  }

  // Add a system message (question) with enhanced context awareness
  const addSystemMessage = async (node: Node<FormNodeData>) => {
    // Hide input while typing animation plays
    setShowInput(false)
    setCurrentNode(node)
    setCurrentInput('')
    setCurrentSliderValue(50)
    setValidationErrors([])
    setIsResponseSubmitted(false)

    // Increment question index for non-first questions
    if (messages.length > 0) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }

    const uniqueId = `system-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`

    // Store the original question
    const originalQuestion = node.data.question
    const processedQuestion = replacePlaceholders(originalQuestion)

    // Get previous interactions for context
    const previousMessage = messages[messages.length - 2]
    const previousAnswer = previousMessage?.value
    const previousQuestion = previousMessage?.originalQuestion

    // Add typing indicator message
    setMessages((prev) => [
      ...prev,
      {
        id: uniqueId,
        type: 'system',
        content: (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        ),
        isTyping: true,
      },
    ])

    let conversationalPrefix = ''

    // Create natural transitions based on previous answer
    if (resolvedStyles.useAI && previousAnswer !== undefined) {
      try {
        const contextInfo = `
          Previous question: "${previousQuestion}"
          Previous answer: "${previousAnswer}"
          Current question: "${originalQuestion}"
          
          Instructions:
          1. Create a VERY brief transition (1-2 words or a short phrase)
          2. The transition should acknowledge their previous answer naturally
          3. MUST be followed by the EXACT original question
          4. DO NOT rephrase or modify the original question
          5. DO NOT add explanations or options
          
          Good examples:
          - "Great! ${originalQuestion}"
          - "Thanks! ${originalQuestion}" 
          - "Got it. ${originalQuestion}"
          - "Perfect. ${originalQuestion}"
          - "Excellent choice! ${originalQuestion}"
          
          Bad examples:
          - Adding extra context or rephrasing the question
          - Explaining what the question means
          - Mentioning the available options
        `

        const response = await generateConversationalResponse(
          `Create a brief transition to: ${originalQuestion}`,
          contextInfo
        )

        // Ensure the response includes the original question
        if (!response.includes(originalQuestion)) {
          conversationalPrefix = response + ' '
        } else {
          conversationalPrefix = response.replace(originalQuestion, '')
        }
      } catch (error) {
        console.error('Error generating transition:', error)
        conversationalPrefix = 'Thanks! '
      }
    } else {
      // Default transitions without AI
      const transitions = [
        'Great!',
        'Thanks!',
        'Got it.',
        'Perfect.',
        'Awesome!',
      ]
      conversationalPrefix =
        transitions[Math.floor(Math.random() * transitions.length)] + ' '
    }

    const finalMessage = `${conversationalPrefix}${processedQuestion}`

    // Add a natural typing delay
    const typingDelay = Math.min(1500, finalMessage.length * 20)

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === uniqueId
            ? {
                ...msg,
                content: <p>{finalMessage}</p>,
                questionNode: node,
                variableName: node.data.variableName,
                inputType: node.data.type,
                isTyping: false,
                originalQuestion: originalQuestion,
              }
            : msg
        )
      )
      // Show input after question appears
      setShowInput(true)
    }, typingDelay)
  }

  // Add a user message (answer) with enhanced acknowledgment
  const addUserMessage = async (value: FormValue, node: Node<FormNodeData>) => {
    let displayValue: React.ReactNode = ''

    // Enhanced value display with more context
    switch (node.data.type) {
      case 'boolean':
        displayValue = value === true ? 'Yes' : 'No'
        break
      case 'date':
        displayValue =
          value instanceof Date ? format(value, 'PPP') : String(value)
        break
      case 'rating':
        displayValue = (
          <div className="flex items-center gap-1">
            <span className="mr-2">{String(value)}/5</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= (typeof value === 'number' ? value : 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-none text-gray-300'
                  )}
                />
              ))}
            </div>
          </div>
        )
        break
      case 'slider':
        const sliderValue = typeof value === 'number' ? value : 0
        displayValue = (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${sliderValue}%`,
                  backgroundColor: resolvedStyles.primaryColor,
                }}
              />
            </div>
            <span>{sliderValue}%</span>
          </div>
        )
        break
      default:
        displayValue = String(value)
    }

    const messageId = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        type: 'user',
        content: displayValue,
        questionNode: node,
        variableName: node.data.variableName,
        value: value,
      },
    ])

    setFormValues((prev) => ({
      ...prev,
      [node.data.variableName]: value,
    }))
  }

  // Handle form submission with enhanced context
  const handleSubmit = async (value: FormValue) => {
    if (!currentNode) return

    // Validate input
    const error = validateInput(value, currentNode)
    if (error) {
      setValidationErrors([error])
      toast.error(error.message)
      return
    }

    // Create updated form values
    const updatedFormValues: Record<string, FormValue> = {
      ...formValues,
      [currentNode.data.variableName]: value,
    }

    // Update form values first
    setFormValues(updatedFormValues)

    // Add the answer to messages
    addUserMessage(value, currentNode)

    // If we're editing a specific answer, handle based on mode
    if (isEditingSpecific) {
      // Store scroll position before state changes
      const container = chatContainerRef.current
      const currentScrollTop = container?.scrollTop || 0

      setIsEditingSpecific(false)
      setEditingNodeData(null)
      setShowInput(false)

      // Different behavior based on mode
      if (mode === 'live') {
        setIsReviewMode(true)
      } else {
        // Preview mode - simpler feedback
        const successMessage = {
          id: `updated-${Date.now()}`,
          type: 'system' as const,
          content: (
            <p className="text-green-600 font-medium">
              ✅ Response updated successfully! You can continue or start over
              to see the complete flow.
            </p>
          ),
        }

        setMessages((prev) => [...prev, successMessage])
      }

      // Restore scroll position and then re-enable auto-scroll
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = currentScrollTop
        }
        // Re-enable auto-scroll after a short delay
        setTimeout(() => {
          setShouldScrollToBottom(true)
        }, 100)
      })

      return
    }

    // Find the next question based on conditions using the updated values
    const nextNode = findNextNode(currentNode, nodes, edges, updatedFormValues)

    if (nextNode) {
      // Add a small delay to make the conversation feel more natural
      setTimeout(() => {
        addSystemMessage(nextNode)
      }, 500)
    } else {
      // Reached end of questions: different behavior based on mode
      setCurrentNode(null)
      setShowInput(false)

      if (mode === 'live') {
        // Live mode: enter review mode
        setIsReviewMode(true)
      } else {
        // Preview mode: show completion message
        setTimeout(() => {
          setIsComplete(true)
          showCompletionMessage()
        }, 600)
      }
    }
  }

  // Handle text input form submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentNode) return

    if (currentNode.data.required && currentInput.trim() === '') {
      return
    }

    handleSubmit(currentInput)
  }

  // Finalize submission after review (live mode only)
  const finalizeSubmission = async () => {
    if (mode !== 'live' || !formId) return

    setIsComplete(true)
    setIsSubmitting(true)
    setIsFormSubmitted(true)

    try {
      // Validate form values before submission
      if (!formValues || Object.keys(formValues).length === 0) {
        throw new Error('No form values to submit')
      }

      // Ensure all form values are serializable
      const serializedFormValues = Object.entries(formValues).reduce(
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

      // Prepare metadata for submission
      const submissionMetadata = {
        timestamp: new Date().toISOString(),
        userAgent:
          typeof window !== 'undefined'
            ? window.navigator.userAgent
            : 'Unknown',
        formName: resolvedStyles.formTitle || 'Untitled Form',
        totalQuestions: totalQuestions,
        submissionTime: Date.now(),
        language:
          typeof window !== 'undefined' ? window.navigator.language : 'Unknown',
        userEmail: serializedFormValues.email || 'Unknown',
      }

      console.log('Submitting form with values:', serializedFormValues)
      console.log('Submission metadata:', submissionMetadata)
      console.log('Form ID:', formId)

      let result
      try {
        result = await submitFormResponse(
          formId,
          serializedFormValues,
          submissionMetadata
        )
      } catch (serverError) {
        console.error('Server action error:', serverError)

        // Check if it's a server action error with a specific message
        if (serverError instanceof Error) {
          throw serverError
        } else {
          // Handle cases where the error might not be a proper Error object
          throw new Error(`Server error: ${String(serverError)}`)
        }
      }

      if (!result) {
        throw new Error('No response received from server')
      }

      setIsSubmitting(false)

      const nameVal =
        (serializedFormValues as Record<string, unknown>)['user_name'] ||
        (serializedFormValues as Record<string, unknown>)['name']
      const userName = nameVal ? String(nameVal) : ''
      const completionMsg = userName
        ? `Thank you so much, ${userName}! Your responses have been recorded successfully. 🎉`
        : 'Thank you so much! Your responses have been recorded successfully. 🎉'

      setMessages((prev) => [
        ...prev,
        {
          id: `complete-${Date.now()}`,
          type: 'system',
          content: (
            <div className="space-y-3">
              <p>{completionMsg}</p>
              {result.responseId && (
                <p className="text-sm text-gray-600">
                  Response ID: {result.responseId}
                </p>
              )}
            </div>
          ),
        },
      ])
    } catch (error) {
      console.error('Failed to submit form:', error)

      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      } else {
        console.error('Non-Error object thrown:', error)
      }

      console.error('Form submission context:', {
        formId,
        formValuesKeys: Object.keys(formValues),
        totalQuestions,
        mode,
      })

      // Show a more user-friendly error message
      let errorMessage = 'Failed to submit form. Please try again.'

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Required field')) {
          errorMessage = error.message
        } else if (error.message.includes('Form not found')) {
          errorMessage = 'This form is no longer available.'
        } else if (error.message.includes('not published')) {
          errorMessage = 'This form is not currently accepting responses.'
        } else if (error.message.includes('already submitted')) {
          errorMessage = 'You have already submitted a response to this form.'
        } else {
          errorMessage = `Submission failed: ${error.message}`
        }
      }

      toast.error(errorMessage)
      setIsSubmitting(false)
      setIsComplete(false)
      setIsFormSubmitted(false)
    }
  }

  // Show a completion message for preview mode
  const showCompletionMessage = () => {
    const nameVal =
      (formValues as Record<string, FormValue>)['user_name'] ||
      (formValues as Record<string, FormValue>)['name']
    const userName = nameVal ? String(nameVal) : ''
    const completionMsg = userName
      ? `Thank you so much, ${userName}! This is a preview of how your form responses would be collected. 🎉`
      : 'Thank you so much! This is a preview of how your form responses would be collected. 🎉'

    setMessages((prev) => [
      ...prev,
      {
        id: `complete-${Date.now()}`,
        type: 'system',
        content: (
          <div>
            <p>{completionMsg}</p>
          </div>
        ),
      },
    ])
  }

  // Handle editing a particular answer (live mode only)
  const handleEditAnswer = (variable: string) => {
    if (mode !== 'live') return

    // Prevent editing after form submission in live mode
    if (isFormSubmitted) {
      toast.error('Form has already been submitted and cannot be edited.')
      return
    }

    const nodeToEdit = nodes.find((n) => n.data.variableName === variable)
    if (!nodeToEdit) return

    // Find the index of this question
    const questionNodes = nodes.filter((n) => n.type === 'questionNode')
    const questionIndex =
      questionNodes.findIndex((n) => n.data.variableName === variable) + 1
    setCurrentQuestionIndex(questionIndex)

    // Store editing data for clean interface
    setEditingNodeData({
      node: nodeToEdit,
      variable,
      currentValue: formValues[variable],
    })

    // Set editing states
    setIsEditingSpecific(true)
    setIsReviewMode(false)

    // Pre-fill current values for text inputs
    if (
      nodeToEdit.data.type === 'text' ||
      nodeToEdit.data.type === 'longText'
    ) {
      const existingVal = formValues[variable]
      setCurrentInput(existingVal ? String(existingVal) : '')
    }

    // Set current node for input rendering
    setCurrentNode(nodeToEdit)
    setShowInput(true)
  }

  // Render the appropriate input for the current question
  const renderCurrentQuestionInput = () => {
    // Email validation mode
    if (isEmailValidationMode) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (emailInput.trim() && emailInput.includes('@')) {
              handleEmailValidation(emailInput.trim())
            }
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1"
              autoFocus
              disabled={isCheckingEmail}
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                !emailInput.trim() ||
                !emailInput.includes('@') ||
                isCheckingEmail
              }
              style={{ backgroundColor: resolvedStyles.primaryColor }}
            >
              {isCheckingEmail ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          {emailInput && !emailInput.includes('@') && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircleIcon className="h-3 w-3" />
              Please enter a valid email address
            </div>
          )}
        </form>
      )
    }

    if (!currentNode) return null

    const { type, variableName, options, required } = currentNode.data
    const hasError = validationErrors.some((e) => e.field === variableName)

    switch (type as QuestionType) {
      case 'text':
        return (
          <form onSubmit={handleTextSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your answer here..."
                className={cn(
                  'flex-1',
                  hasError && 'border-red-500 focus:border-red-500'
                )}
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                disabled={required && currentInput.trim() === ''}
                style={{ backgroundColor: resolvedStyles.primaryColor }}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
              {isEditingSpecific && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingNodeData(null)
                    setIsEditingSpecific(false)
                    if (mode === 'live') {
                      setIsReviewMode(true)
                    }
                    setShowInput(false)
                    setCurrentNode(null)
                  }}
                >
                  ✕
                </Button>
              )}
            </div>
            {hasError && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircleIcon className="h-3 w-3" />
                {
                  validationErrors.find((e) => e.field === variableName)
                    ?.message
                }
              </div>
            )}
          </form>
        )

      case 'longText':
        return (
          <div className="flex flex-col gap-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Share your detailed thoughts here..."
              className={cn(
                'min-h-[100px] resize-none',
                hasError && 'border-red-500 focus:border-red-500'
              )}
              autoFocus
            />
            {hasError && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircleIcon className="h-3 w-3" />
                {
                  validationErrors.find((e) => e.field === variableName)
                    ?.message
                }
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (isResponseSubmitted) {
                    if (mode === 'preview') return
                    toast.success('Response has been submitted')
                    return
                  }
                  handleSubmit(currentInput)
                  setIsResponseSubmitted(true)
                  if (mode === 'preview') {
                    setShowInput(false)
                  }
                }}
                className="flex-1"
                disabled={
                  !isResponseSubmitted && required && currentInput.trim() === ''
                }
                style={{ backgroundColor: resolvedStyles.primaryColor }}
              >
                {isResponseSubmitted ? 'Response Submitted' : 'Send Response'}
              </Button>
              {isEditingSpecific && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingNodeData(null)
                    setIsEditingSpecific(false)
                    if (mode === 'live') {
                      setIsReviewMode(true)
                    }
                    setShowInput(false)
                    setCurrentNode(null)
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )

      case 'multipleChoice':
        return (
          <RadioGroup
            className="space-y-1"
            onValueChange={(val) => handleSubmit(val)}
          >
            {options?.map((option: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RadioGroupItem
                  value={option}
                  id={`${variableName}-option-${index}`}
                  style={
                    {
                      borderColor: resolvedStyles.primaryColor,
                      '&:checked': {
                        backgroundColor: resolvedStyles.primaryColor,
                        borderColor: resolvedStyles.primaryColor,
                      },
                    } as React.CSSProperties
                  }
                />
                <Label
                  htmlFor={`${variableName}-option-${index}`}
                  className="cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'dropdown':
        return (
          <div className="flex flex-col gap-2">
            <Select onValueChange={(val) => handleSubmit(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option: string, index: number) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'boolean':
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit(true)}
              style={{
                borderColor: resolvedStyles.primaryColor,
                color: resolvedStyles.primaryColor,
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit(false)}
              style={{
                borderColor: resolvedStyles.primaryColor,
                color: resolvedStyles.primaryColor,
              }}
            >
              No
            </Button>
          </div>
        )

      case 'date':
        return (
          <div className="flex flex-col gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Select a date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  onSelect={(date) => date && handleSubmit(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )

      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleSubmit(rating)}
                style={{
                  borderColor: resolvedStyles.primaryColor,
                  color: resolvedStyles.primaryColor,
                }}
              >
                <StarIcon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        )

      case 'slider':
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <Slider
                defaultValue={[50]}
                value={[currentSliderValue]}
                max={100}
                step={1}
                onValueChange={(vals) => setCurrentSliderValue(vals[0])}
                className="[&>span]:bg-current"
                style={{ color: resolvedStyles.primaryColor }}
              />
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">0</span>
                <span className="text-sm font-medium">
                  {currentSliderValue}
                </span>
                <span className="text-sm text-gray-500">100</span>
              </div>
            </div>
            <Button
              onClick={() => handleSubmit(currentSliderValue)}
              className="w-full"
              style={{ backgroundColor: resolvedStyles.primaryColor }}
            >
              Submit
            </Button>
          </div>
        )

      default:
        return <div>Unsupported question type: {type}</div>
    }
  }

  // Helper: replace placeholders like [user_name] with actual answers
  const replacePlaceholders = useCallback(
    (text: string): string => {
      if (!text) return text
      return text.replace(/\[(\w+)\]/g, (_, key: string) => {
        const rawVal = formValues[key]
        if (rawVal === undefined) return ''
        if (rawVal instanceof Date) {
          return format(rawVal, 'PPP')
        }
        if (typeof rawVal === 'boolean') {
          return rawVal ? 'Yes' : 'No'
        }
        return String(rawVal)
      })
    },
    [formValues]
  )

  // Dynamic Review Message Component (live mode only)
  const ReviewMessage = ({
    updatedFormValues,
    isSubmitted = false,
  }: {
    updatedFormValues: Record<string, FormValue>
    isSubmitted?: boolean
  }) => {
    return (
      <div>
        <p className="mb-3 font-medium">
          {isSubmitted
            ? '✅ Your responses have been submitted successfully!'
            : "Review your answers below and let me know if you'd like to change anything. 👇"}
        </p>
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="space-y-2 text-sm">
            {Object.keys(updatedFormValues).map((key) => {
              const node = nodes.find((n) => n.data.variableName === key)
              if (!node) return null

              const rawVal = updatedFormValues[key]

              // Determine human-readable value based on question type
              let displayVal: React.ReactNode = String(rawVal)
              switch (node.data.type) {
                case 'boolean':
                  displayVal = rawVal === true ? 'Yes' : 'No'
                  break
                case 'date':
                  displayVal =
                    rawVal instanceof Date
                      ? format(rawVal, 'PPP')
                      : String(rawVal)
                  break
                case 'rating':
                  displayVal = `${rawVal}/5`
                  break
                case 'slider':
                  displayVal = `${rawVal}%`
                  break
              }

              return (
                <div
                  key={key}
                  className="flex justify-between items-start gap-4 py-1"
                >
                  <span className="font-medium text-gray-800">
                    {replacePlaceholders(node.data.question)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 whitespace-nowrap">
                      {displayVal}
                    </span>
                    {!isComplete &&
                      !isFormSubmitted &&
                      !isSubmitted &&
                      mode === 'live' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAnswer(key)}
                          className="text-xs px-2 py-1 h-6"
                        >
                          Edit
                        </Button>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {!isSubmitted && (
          <p className="text-sm text-gray-600">
            If everything looks good, go ahead and submit! 🚀
          </p>
        )}
      </div>
    )
  }

  // If no nodes, show empty state
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-medium mb-2">
          {mode === 'live' ? 'Form Not Found' : 'No Form Questions'}
        </h2>
        <p className="text-gray-600 mb-4">
          {mode === 'live'
            ? "This form doesn't seem to have any questions."
            : 'Add some questions to your form to preview it.'}
        </p>
      </div>
    )
  }

  // Clean edit interface when editing a specific answer
  if (editingNodeData) {
    const { node, currentValue } = editingNodeData

    // Format current value for display with proper fallbacks
    let displayCurrentValue: React.ReactNode = 'No answer yet'

    if (currentValue !== undefined && currentValue !== null) {
      switch (node.data.type) {
        case 'boolean':
          displayCurrentValue = currentValue === true ? 'Yes' : 'No'
          break
        case 'date':
          displayCurrentValue =
            currentValue instanceof Date
              ? format(currentValue, 'PPP')
              : String(currentValue)
          break
        case 'rating':
          displayCurrentValue = `${currentValue}/5`
          break
        case 'slider':
          displayCurrentValue = `${currentValue}%`
          break
        default:
          displayCurrentValue = String(currentValue)
      }
    }

    return (
      <div
        className={cn(
          'flex flex-col min-h-screen',
          mode === 'live' ? 'bg-gray-50' : 'bg-white'
        )}
      >
        {/* Header with back button */}
        <div className="border-b p-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingNodeData(null)
                  setIsEditingSpecific(false)
                  if (mode === 'live') {
                    setIsReviewMode(true)
                  }
                  setShowInput(false)
                  setCurrentNode(null)
                }}
                className="flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to {mode === 'live' ? 'Review' : 'Form'}
              </Button>
              <div className="flex-1 text-center">
                <h3 className="font-medium text-gray-900">Edit Response</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Edit content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question being edited */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="font-medium text-blue-900 mb-2">Question:</h4>
                <p className="text-blue-800">
                  {replacePlaceholders(node.data.question)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  Current Answer:
                </h4>
                <div className="text-blue-800 bg-blue-100 rounded px-3 py-2">
                  {displayCurrentValue}
                </div>
              </div>
            </div>

            {/* New answer prompt */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Enter your new response:
              </h4>
            </div>
          </div>
        </div>

        {/* Input area */}
        {currentNode && showInput && (
          <div className="border-t p-4 bg-white">
            <div className="max-w-2xl mx-auto">
              {totalQuestions > 0 && (
                <div className="mb-3 text-sm text-gray-500">
                  Question {currentQuestionIndex} of {totalQuestions}
                </div>
              )}
              {renderCurrentQuestionInput()}
            </div>
          </div>
        )}

        {/* Branding */}
        {resolvedStyles.showBranding && (
          <div className="text-center py-4 text-sm text-gray-500 bg-white border-t">
            Powered by{' '}
            <a href="#" className="font-medium text-gray-900 hover:underline">
              Kleem AI
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen',
        mode === 'live' ? 'bg-gray-50' : 'bg-white'
      )}
    >
      {/* Chat messages area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Form title if provided */}
          {resolvedStyles.formTitle && messages.length > 0 && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {resolvedStyles.formTitle}
              </h2>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.type === 'user' ? 'justify-end' : 'justify-start',
                message.isTyping && 'opacity-70'
              )}
            >
              {message.type === 'system' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback
                    style={{ backgroundColor: resolvedStyles.primaryColor }}
                    className="text-white"
                  >
                    KA
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  'rounded-lg p-3 relative max-w-[80%]',
                  message.type === 'system' ? 'bg-gray-100' : 'text-white',
                  message.isTyping && 'min-w-[60px]'
                )}
                style={
                  message.type === 'user'
                    ? { backgroundColor: resolvedStyles.primaryColor }
                    : {}
                }
              >
                {message.content}

                {/* Chat bubble pointer */}
                <div
                  className={cn(
                    'absolute top-3 w-2 h-2 transform rotate-45',
                    message.type === 'system'
                      ? 'left-0 -translate-x-1 bg-gray-100'
                      : 'right-0 translate-x-1'
                  )}
                  style={
                    message.type === 'user'
                      ? { backgroundColor: resolvedStyles.primaryColor }
                      : {}
                  }
                ></div>
              </div>

              {message.type === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-gray-300">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed input area at bottom */}
      {!isComplete &&
        !isReviewMode &&
        (isEmailValidationMode || (currentNode && showInput)) && (
          <div className="border-t p-4 bg-white">
            <div className="max-w-2xl mx-auto">
              {totalQuestions > 0 && !isEmailValidationMode && (
                <div className="mb-3 text-sm text-gray-500">
                  Question {currentQuestionIndex} of {totalQuestions}
                </div>
              )}
              {isEmailValidationMode && (
                <div className="mb-3 text-sm text-gray-500">
                  Email Verification Required
                </div>
              )}
              {renderCurrentQuestionInput()}
            </div>
          </div>
        )}

      {/* Review mode UI (live mode only) */}
      {isReviewMode && !isComplete && mode === 'live' && (
        <div className="border-t p-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col gap-2">
              <Button
                onClick={finalizeSubmission}
                disabled={isSubmitting}
                style={{ backgroundColor: resolvedStyles.primaryColor }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Responses'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion UI (preview mode) */}
      {isComplete && mode === 'preview' && (
        <div className="border-t p-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-gray-600">
              Form preview completed! Use &quot;Start Over&quot; to try again.
            </p>
          </div>
        </div>
      )}

      {/* Start Over button (preview mode only) */}
      {mode === 'preview' &&
        !customStyles?.hideStartOver &&
        messages.length > 0 && (
          <div className="border-t p-3 flex justify-between items-center bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="flex items-center gap-1.5"
            >
              <RefreshCcwIcon className="h-3.5 w-3.5" />
              Start Over
            </Button>
          </div>
        )}

      {/* Branding */}
      {resolvedStyles.showBranding && (
        <div className="text-center py-4 text-sm text-gray-500 bg-white border-t">
          Powered by{' '}
          <a href="#" className="font-medium text-gray-900 hover:underline">
            Kleem AI
          </a>
        </div>
      )}

      {/* Review mode UI (live mode only) */}
      {isReviewMode && (
        <div className="max-w-2xl mx-auto my-6">
          <ReviewMessage
            updatedFormValues={formValues}
            isSubmitted={isFormSubmitted || isComplete}
          />
        </div>
      )}
    </div>
  )
}
