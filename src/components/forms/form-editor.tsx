'use client'

import { useEffect, useTransition, useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { FormBuilder } from './form-builder'
import { useFormBuilder } from '@/hooks/useFormBuilder'
import { Form, Node as PrismaNode, Edge as PrismaEdge } from '@prisma/client'
import { createForm, updateForm } from '@/actions/form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  FormNodeData,
  FormEdgeData,
  FormState,
  FormSettings,
} from '@/types/form'
import { Node, Edge } from 'reactflow'

interface FormEditorProps {
  formToEdit?: Form & {
    nodes: PrismaNode[]
    edges: PrismaEdge[]
  }
}

export const FormEditor = ({ formToEdit }: FormEditorProps) => {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const initializationDone = useRef(false)

  const {
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    addNode,
    updateNodeData,
    updateEdgeData,
    duplicateNode,
    deleteSelected,
    setSettings,
    setNodes,
    setEdges,
    settings,
    updateFormSettings,
  } = useFormBuilder({
    onSave: async (formData) => {
      if (!formToEdit) return

      setIsSaving(true)
      try {
        await updateForm(formToEdit.id, formData)
      } catch (error) {
        toast.error('Failed to save form')
        console.error(error)
      } finally {
        setIsSaving(false)
      }
    },
  })

  const createNewForm = useCallback(
    async (
      formId: string,
      defaultNodeId: string,
      initialNodes: Node<FormNodeData>[],
      initialEdges: Edge<FormEdgeData>[]
    ) => {
      setIsSaving(true)
      try {
        const formState: FormState = {
          nodes: initialNodes,
          edges: initialEdges,
          settings: {
            formId,
            formName: 'New Form',
            startNodeId: defaultNodeId,
            isPublished: false,
            primaryColor: '#3b82f6',
            showBranding: true,
          },
        }

        const form = await createForm(formState)

        if (!form) {
          throw new Error('Failed to create form')
        }

        router.push(`/forms?formId=${form.id}`)
      } catch (error) {
        // Log the error without triggering the React error overlay
        console.warn('Form creation error:', error)

        if (error instanceof Error) {
          if (error.message.includes('Not authenticated')) {
            toast.error('Please log in to create a form')
            router.push('/auth/login')
            return
          }

          toast.error(`Failed to create form: ${error.message}`)
        } else {
          toast.error('An unexpected error occurred')
        }

        // Stay on the current page so the user can retry or navigate manually
      } finally {
        setIsSaving(false)
      }
    },
    [router]
  )

  // Initialize form data
  useEffect(() => {
    if (initializationDone.current) return
    initializationDone.current = true

    const initializeForm = async () => {
      try {
        if (formToEdit) {
          // Initialize existing form
          const persistedSettings =
            formToEdit.settings as unknown as FormSettings

          setSettings({
            formId: formToEdit.id,
            formName: formToEdit.name,
            startNodeId: persistedSettings?.startNodeId || '',
            isPublished: persistedSettings?.isPublished ?? false,
            primaryColor: persistedSettings?.primaryColor ?? '#3b82f6',
            showBranding: persistedSettings?.showBranding ?? true,
          })

          // Convert Prisma nodes and edges to React Flow format
          const convertedNodes: Node<FormNodeData>[] = formToEdit.nodes.map(
            (node) => ({
              id: node.id,
              type: (node.type as string) || 'questionNode',
              position: (node.position as unknown as {
                x: number
                y: number
              }) || {
                x: 0,
                y: 0,
              },
              data: node.data as unknown as FormNodeData,
            })
          )

          const convertedEdges: Edge<FormEdgeData>[] = formToEdit.edges.map(
            (edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: (edge.type as string) || 'conditionalEdge',
              data: edge.data as unknown as FormEdgeData,
            })
          )

          setNodes(convertedNodes)
          setEdges(convertedEdges)

          setIsInitializing(false)
        } else {
          // Create a new form with a default question
          const defaultNodeId = uuidv4()
          const formId = 'form_' + Math.random().toString(36).substr(2, 9)

          // Initialize form settings
          setSettings({
            formId,
            formName: 'New Form',
            startNodeId: defaultNodeId,
            isPublished: false,
            primaryColor: '#3b82f6',
            showBranding: true,
          })

          // Create initial node data
          const initialNodes: Node<FormNodeData>[] = [
            {
              id: defaultNodeId,
              type: 'questionNode',
              position: { x: 250, y: 100 },
              data: {
                question: "What's your name?",
                type: 'text',
                required: true,
                variableName: 'user_name',
                helpText: 'Please enter your full name',
              },
            },
          ]

          const initialEdges: Edge<FormEdgeData>[] = []

          // Set nodes directly into builder state
          setNodes(initialNodes)
          setEdges(initialEdges)

          // Start form creation after a short delay
          setTimeout(() => {
            startTransition(() => {
              createNewForm(
                formId,
                defaultNodeId,
                initialNodes,
                initialEdges
              ).finally(() => {
                setIsInitializing(false)
              })
            })
          }, 100)
        }
      } catch (error) {
        console.error('Form initialization error:', error)
        toast.error('Failed to initialize form')
        setIsInitializing(false)
      }
    }

    initializeForm()
  }, [
    formToEdit,
    setSettings,
    addNode,
    updateNodeData,
    createNewForm,
    setNodes,
    setEdges,
  ])

  if (isInitializing) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FAFBFD]">
        <div className="text-gray-500">Initializing form editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#FAFBFD] overflow-hidden">
      <main className="h-full w-full relative">
        <FormBuilder
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onNodeUpdate={updateNodeData}
          onEdgeUpdate={updateEdgeData}
          onDuplicate={duplicateNode}
          onDelete={deleteSelected}
          onAddNode={addNode}
          isSaving={isSaving}
          settings={settings}
          updateFormSettings={updateFormSettings}
        />
      </main>
    </div>
  )
}
