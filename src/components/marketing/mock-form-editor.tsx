'use client'

import { useEffect, useState } from 'react'
import {
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import { FormNodeData, FormEdgeData, FormSettings } from '@/types/form'
import { MockFormBuilder } from './mock-form-builder'

// Mock data for initial form state
const mockSettings: FormSettings = {
  formId: 'mock_form_123',
  formName: 'Mock Form',
  startNodeId: 'node_1',
  isPublished: false,
  primaryColor: '#3b82f6',
  showBranding: true,
}

// Initial node positions
const getInitialX = () => {
  if (typeof window === 'undefined') return 150
  return window.innerWidth < 640 ? 50 : 150
}

const mockNodes: Node<FormNodeData>[] = [
  {
    id: 'node_1',
    type: 'questionNode',
    position: { x: 150, y: 50 },
    data: {
      question: "What's your name?",
      type: 'text',
      required: true,
      variableName: 'user_name',
      helpText: 'Please enter your full name',
    },
  },
  {
    id: 'node_2',
    type: 'questionNode',
    position: { x: 150, y: 200 },
    data: {
      question: 'What is your age?',
      type: 'text',
      required: true,
      variableName: 'user_age',
      helpText: 'Please enter your age',
    },
  },
]

const mockEdges: Edge<FormEdgeData>[] = [
  {
    id: 'edge_1',
    source: 'node_1',
    target: 'node_2',
    type: 'conditionalEdge',
    data: {
      conditions: [],
      logicalOperator: 'and',
    },
  },
]

// Create a static instance to persist state across remounts
const globalState = {
  nodes: mockNodes,
  edges: mockEdges,
  settings: mockSettings,
  initialized: false,
}

export const MockFormEditor = () => {
  const [isInitializing, setIsInitializing] = useState(!globalState.initialized)
  const [isSaving] = useState(false)

  // Initialize state with persisted data
  const [nodes, setNodes] = useState<Node<FormNodeData>[]>(globalState.nodes)
  const [edges, setEdges] = useState<Edge<FormEdgeData>[]>(globalState.edges)
  const [selectedNode, setSelectedNode] = useState<Node<FormNodeData> | null>(
    null
  )
  const [selectedEdge, setSelectedEdge] = useState<Edge<FormEdgeData> | null>(
    null
  )

  // Handle responsive layout
  useEffect(() => {
    const updateNodePositions = () => {
      const isMobile = window.innerWidth < 640
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          position: {
            x: isMobile ? 50 : 150,
            y: node.position.y,
          },
        }))
      )
    }

    // Update positions initially and on resize
    updateNodePositions()
    window.addEventListener('resize', updateNodePositions)
    return () => window.removeEventListener('resize', updateNodePositions)
  }, [])

  // Sync state changes back to global state
  useEffect(() => {
    globalState.nodes = nodes
  }, [nodes])

  useEffect(() => {
    globalState.edges = edges
  }, [edges])

  // Handle node changes using the built-in helper
  const onNodesChange: OnNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }

  // Handle edge changes using the built-in helper
  const onEdgesChange: OnEdgesChange = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds))
  }

  // Handle new connections
  const onConnect = (params: Connection) => {
    if (!params.source || !params.target) return

    const newEdge: Edge<FormEdgeData> = {
      id: `edge_${edges.length + 1}`,
      source: params.source,
      target: params.target,
      type: 'conditionalEdge',
      data: {
        conditions: [],
        logicalOperator: 'and',
      },
    }
    setEdges((eds) => [...eds, newEdge])
  }

  const onNodeClick = (_: React.MouseEvent, node: Node<FormNodeData>) => {
    setSelectedNode(node)
    setSelectedEdge(null)
  }

  const onEdgeClick = (_: React.MouseEvent, edge: Edge<FormEdgeData>) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }

  const onPaneClick = () => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  const updateNodeData = (nodeId: string, data: Partial<FormNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    )
  }

  const updateEdgeData = (edgeId: string, data: Partial<FormEdgeData>) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? {
              ...edge,
              data: {
                conditions: [...(edge.data?.conditions || [])],
                logicalOperator: edge.data?.logicalOperator || 'and',
                ...edge.data,
                ...data,
              },
            }
          : edge
      )
    )
  }

  const duplicateNode = () => {
    if (selectedNode) {
      const newNode = {
        ...selectedNode,
        id: `node_${nodes.length + 1}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
      }
      setNodes([...nodes, newNode])
    }
  }

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes(nodes.filter((n) => n.id !== selectedNode.id))
      setEdges(
        edges.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      )
      setSelectedNode(null)
    }
    if (selectedEdge) {
      setEdges(edges.filter((e) => e.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
  }

  const onAddNode = (type: FormNodeData['type']) => {
    const newNode: Node<FormNodeData> = {
      id: `node_${nodes.length + 1}`,
      type: 'questionNode',
      position: { x: getInitialX(), y: (nodes.length + 1) * 150 },
      data: {
        question: 'New Question',
        type,
        required: true,
        variableName: `question_${nodes.length + 1}`,
        helpText: 'Help text',
      },
    }
    setNodes([...nodes, newNode])
  }

  // Initialize only once
  useEffect(() => {
    if (!globalState.initialized) {
      const timer = setTimeout(() => {
        setIsInitializing(false)
        globalState.initialized = true
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setIsInitializing(false)
    }
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FAFBFD]">
        <div className="text-gray-500 text-sm sm:text-base">
          Initializing mock form editor...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#FAFBFD] overflow-hidden">
      <main className="flex-1 w-full relative">
        <MockFormBuilder
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
          onAddNode={onAddNode}
          isSaving={isSaving}
        />
      </main>
    </div>
  )
}
