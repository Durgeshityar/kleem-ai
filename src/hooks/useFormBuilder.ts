import { useCallback, useState, useEffect, useRef } from 'react'
import {
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeChange,
  EdgeChange,
} from 'reactflow'
import {
  FormNodeData,
  FormEdgeData,
  FormState,
  FormSettings,
} from '../types/form'
import { v4 as uuidv4 } from 'uuid'
import { wouldCreateCycle } from '../utils/graph-utils'
import { toast } from 'sonner'

interface UseFormBuilderProps {
  onSave?: (formState: FormState) => Promise<void>
}

const generateFormId = () => 'form_' + Math.random().toString(36).substr(2, 9)

const generateNodeId = () => uuidv4()

const initialNodes: Node<FormNodeData>[] = [
  {
    id: generateNodeId(),
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

export function useFormBuilder({ onSave }: UseFormBuilderProps = {}) {
  // Form state
  const [nodes, setNodes, originalOnNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, originalOnEdgesChange] = useEdgesState([])
  const [settings, setSettings] = useState<FormSettings>({
    formId: generateFormId(),
    formName: 'My Conversational Form',
    startNodeId: initialNodes[0].id,
    isPublished: false,
    primaryColor: '#3b82f6',
    showBranding: true,
  })

  // Add interaction mode state
  const [interactionMode, setInteractionMode] = useState<
    'select' | 'pan' | 'connect'
  >('select')

  // Selection state
  const [selectedNode, setSelectedNode] = useState<Node<FormNodeData> | null>(
    null
  )
  const [selectedEdge, setSelectedEdge] = useState<Edge<FormEdgeData> | null>(
    null
  )

  // UI state
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [isConnectMode, setIsConnectMode] = useState(false)
  const [isZoomedOut, setIsZoomedOut] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Add a debounce timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  // Add a ref to track the last saved state
  const savedStateRef = useRef('')

  // Add a state to track if we need to save
  const [isDirty, setIsDirty] = useState(false)

  // Implement the actual save function
  const saveFormToDatabase = useCallback(
    async (formState: FormState) => {
      if (!onSave) return

      try {
        await onSave(formState)
      } catch (error) {
        console.error('Error saving form:', error)
      }
    },
    [onSave]
  )

  // Modify the debounced save function to be more specific
  const debouncedSave = useCallback(() => {
    if (!isDirty) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      const formState: FormState = {
        nodes,
        edges,
        settings,
      }
      saveFormToDatabase(formState)
      setIsDirty(false)
    }, 1000) // 1 second debounce
  }, [nodes, edges, settings, saveFormToDatabase, isDirty])

  // Update node operations to mark as dirty
  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<FormNodeData>) => {
      setIsDirty(true)
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  // Update edge operations to mark as dirty
  const onConnect = useCallback(
    (connection: Connection) => {
      // Check that we have valid source and target
      if (!connection.source || !connection.target) {
        return
      }

      // Check if this connection would create a cycle
      if (
        wouldCreateCycle(nodes, edges, {
          source: connection.source,
          target: connection.target,
        })
      ) {
        toast.error('Cannot create a loop in the form flow', {
          description: 'Forms must have a linear progression without cycles.',
        })
        return
      }

      setIsDirty(true)
      const newEdge = {
        ...connection,
        type: 'conditionalEdge',
        data: {
          conditions: [],
          logicalOperator: 'and',
        } as FormEdgeData,
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges, nodes, edges]
  )

  /**
   * Helper to update any of the form-level settings while marking the form as dirty so
   * the auto-save debounce kicks in.
   */
  const updateFormSettings = useCallback((updates: Partial<FormSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
    setIsDirty(true)
  }, [])

  // Find and update start node when nodes or edges change
  useEffect(() => {
    if (nodes.length === 0) return

    // Find a node with no incoming edges
    const targetNodeIds = edges.map((edge) => edge.target)
    const possibleStartNodes = nodes.filter(
      (node) => !targetNodeIds.includes(node.id)
    )

    let startNode = null
    if (possibleStartNodes.length > 0) {
      startNode = possibleStartNodes[0]
    } else {
      startNode = nodes[0]
    }

    if (startNode && startNode.id !== settings.startNodeId) {
      updateFormSettings({ startNodeId: startNode.id })
    }
  }, [nodes, edges, settings.startNodeId, updateFormSettings])

  // Rename the handlers to avoid conflicts
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Only mark as dirty for significant changes, not temporary drag states
      const hasSignificantChange = changes.some(
        (change) =>
          (change.type === 'position' && !change.dragging) || // Only mark dirty when drag ends
          change.type === 'add' ||
          change.type === 'remove' ||
          change.type === 'dimensions' ||
          change.type === 'select'
      )
      if (hasSignificantChange) {
        setIsDirty(true)
      }
      originalOnNodesChange(changes)
    },
    [originalOnNodesChange]
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Only mark as dirty for permanent changes
      const hasSignificantChange = changes.some(
        (change) =>
          change.type === 'add' ||
          change.type === 'remove' ||
          change.type === 'select'
      )
      if (hasSignificantChange) {
        setIsDirty(true)
      }
      originalOnEdgesChange(changes)
    },
    [originalOnEdgesChange]
  )

  // Set up effect to trigger save when dirty
  useEffect(() => {
    if (!isDirty) return

    // Prevent save spam by checking if nodes/edges actually changed
    const currentState = JSON.stringify({ nodes, edges, settings })

    if (currentState === savedStateRef.current) {
      return // Skip save if state hasn't actually changed
    }

    debouncedSave()
    savedStateRef.current = currentState

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [isDirty, debouncedSave, nodes, edges, settings])

  // Update the existing saveForm function to use the new saveFormToDatabase
  const saveForm = useCallback(async () => {
    const formState: FormState = {
      nodes,
      edges,
      settings,
    }
    await saveFormToDatabase(formState)
  }, [nodes, edges, settings, saveFormToDatabase])

  // Node operations
  const addNode = useCallback(
    (type: FormNodeData['type']) => {
      const newNode: Node<FormNodeData> = {
        id: generateNodeId(),
        type: 'questionNode',
        position: {
          x: 250,
          y:
            nodes.length === 0
              ? 100
              : Math.max(...nodes.map((node) => node.position.y)) + 150,
        },
        data: {
          question: 'New Question',
          type,
          required: false,
          variableName: `question_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          helpText: '',
          options:
            type === 'multipleChoice' || type === 'dropdown'
              ? ['Option 1', 'Option 2']
              : undefined,
        },
      }

      setNodes((nds) => nds.concat(newNode))
      setIsDirty(true)
    },
    [setNodes]
  )

  const duplicateNode = useCallback(() => {
    if (selectedNode) {
      const newNode: Node<FormNodeData> = {
        id: generateNodeId(),
        type: selectedNode.type,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
        data: {
          ...selectedNode.data,
          variableName: `question_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        },
      }
      setNodes((nds) => nds.concat(newNode))
      setIsDirty(true)
    }
  }, [selectedNode, nodes, setNodes])

  // Edge operations
  const updateEdgeData = useCallback(
    (edgeId: string, newData: Partial<FormEdgeData>) => {
      setIsDirty(true)
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            // Ensure we maintain the correct structure
            const updatedData = {
              conditions: edge.data?.conditions || [],
              logicalOperator: edge.data?.logicalOperator || 'and',
              ...edge.data,
              ...newData,
            }
            return {
              ...edge,
              data: updatedData,
            }
          }
          return edge
        })
      )
    },
    [setEdges]
  )

  // Selection handlers
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<FormNodeData>) => {
      setSelectedNode(node)
      setSelectedEdge(null)
    },
    []
  )

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge<FormEdgeData>) => {
      setSelectedEdge(edge)
      setSelectedNode(null)
    },
    []
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [])

  // Delete operation
  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      )
      setSelectedNode(null)
      setIsDirty(true)
    }
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id))
      setSelectedEdge(null)
      setIsDirty(true)
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges])

  // Form operations
  const loadForm = useCallback(async (formId: string) => {
    // API Integration Point: Load form from backend
    // TODO: Implement API call to load form
    console.log('Loading form:', formId)
  }, [])

  // Update setInteractionMode to also handle isConnectMode
  const handleInteractionModeChange = useCallback(
    (mode: 'select' | 'pan' | 'connect') => {
      setInteractionMode(mode)
      setIsConnectMode(mode === 'connect')
    },
    []
  )

  return {
    // State
    nodes,
    edges,
    settings,
    selectedNode,
    selectedEdge,
    snapToGrid,
    isConnectMode,
    isZoomedOut,
    isPreviewMode,
    isSettingsOpen,
    isDirty,
    interactionMode,

    // State updates
    setSettings,
    setSnapToGrid,
    setIsConnectMode,
    setIsZoomedOut,
    setIsPreviewMode,
    setIsSettingsOpen,
    updateFormSettings,
    handleInteractionModeChange,

    // INTERNAL setters (exposed for initialization)
    setNodes,
    setEdges,

    // Node/Edge operations
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onConnect,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    addNode,
    updateNodeData,
    updateEdgeData,
    duplicateNode,
    deleteSelected,

    // Form operations
    saveForm,
    loadForm,
  }
}
