import { useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  Node,
  Edge,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  Panel,
  SelectionMode,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow'
import { FormNodeData, FormEdgeData } from '@/types/form'
import { Loader } from 'lucide-react'
import { X } from 'lucide-react'

import conditionalEdge from '../forms/conditional-edge'
import questionNode from '../forms/question-node'
import PropertiesPanel from '../forms/properties-panel'
import { TopToolbar } from '../forms/toolbar/TopToolbar'

const ReactFlow = dynamic(
  () => import('reactflow').then((mod) => mod.ReactFlow),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FAFBFD]">
        <div className="text-gray-500">Loading form editor...</div>
      </div>
    ),
  }
)

const MiniMap = dynamic(() => import('reactflow').then((mod) => mod.MiniMap), {
  ssr: false,
})
const Background = dynamic(
  () => import('reactflow').then((mod) => mod.Background),
  { ssr: false }
)
const ReactFlowProvider = dynamic(
  () => import('reactflow').then((mod) => mod.ReactFlowProvider),
  { ssr: false }
)

import 'reactflow/dist/style.css'

const nodeTypes = {
  questionNode: questionNode,
}

const edgeTypes = {
  conditionalEdge: conditionalEdge,
}

// Initial node setup
const initialNode: Node<FormNodeData> = {
  id: 'initial-node',
  type: 'questionNode',
  position: { x: 250, y: 100 },
  data: {
    question: "What's your name?",
    type: 'text',
    required: true,
    variableName: 'user_name',
    helpText: 'Please enter your full name',
  },
}

interface FormBuilderProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick: (event: React.MouseEvent, node: Node) => void
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void
  onPaneClick: () => void
  selectedNode: Node | null
  selectedEdge: Edge | null
  onNodeUpdate: (nodeId: string, data: Partial<FormNodeData>) => void
  onEdgeUpdate: (edgeId: string, data: Partial<FormEdgeData>) => void
  onDuplicate: () => void
  onDelete: () => void
  onAddNode: (type: FormNodeData['type']) => void
  isSaving: boolean
}

function FormCanvasContext({
  nodes = [initialNode],
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  selectedNode,
  selectedEdge,
  onNodeUpdate,
  onEdgeUpdate,
  onDuplicate,
  onDelete,
  onAddNode,
  isSaving,
}: FormBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Local state management
  const [snapToGrid] = useState(false)
  const [isConnectMode, setIsConnectMode] = useState(false)
  const [interactionMode, setInteractionMode] = useState<
    'select' | 'pan' | 'connect'
  >('select')

  // Default viewport for mobile
  const defaultViewport = {
    x: 0,
    y: 0,
    zoom: window.innerWidth < 640 ? 0.5 : 1,
  }

  // Handle interaction mode change
  const handleInteractionModeChange = useCallback(
    (mode: 'select' | 'pan' | 'connect') => {
      setInteractionMode(mode)
      setIsConnectMode(mode === 'connect')
    },
    []
  )

  return (
    <div
      className="w-full h-[calc(100dvh-1rem)] sm:h-[600px] overflow-hidden"
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        defaultViewport={defaultViewport}
        connectionMode={
          interactionMode === 'connect'
            ? ConnectionMode.Strict
            : ConnectionMode.Loose
        }
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.Bezier}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.2}
        maxZoom={2}
        className={`touch-none ${
          interactionMode === 'select'
            ? 'cursor-pointer'
            : interactionMode === 'pan'
            ? 'cursor-grab active:cursor-grabbing'
            : interactionMode === 'connect'
            ? 'cursor-crosshair'
            : ''
        }`}
        panOnScroll={false}
        panOnDrag={true}
        selectionMode={SelectionMode.Full}
        nodesDraggable={true}
        nodesConnectable={interactionMode === 'connect'}
        elementsSelectable={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        preventScrolling={true}
        panOnScrollSpeed={0.5}
        elevateNodesOnSelect={true}
        elevateEdgesOnSelect={true}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap className="!hidden sm:!block" />
        <Background
          color="#f3f4f6"
          variant={BackgroundVariant.Lines}
          gap={snapToGrid ? 12 : 1}
          size={1}
        />

        <TopToolbar
          onAddNode={onAddNode}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          isConnectMode={isConnectMode}
          setIsConnectMode={setIsConnectMode}
          hasSelection={!!selectedNode || !!selectedEdge}
          isSaving={isSaving}
          interactionMode={interactionMode}
          onModeChange={handleInteractionModeChange}
        />

        {isSaving && (
          <Panel
            position="bottom-right"
            className="sm:hidden m-4 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Loader className="animate-spin h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Saving...</span>
            </div>
          </Panel>
        )}
      </ReactFlow>
      {selectedNode || selectedEdge ? (
        <div className="fixed inset-x-0 bottom-0 lg:right-0 lg:inset-x-auto lg:bottom-auto lg:inset-y-0 w-full lg:w-80 bg-white border-t lg:border-l border-gray-200 shadow-lg transition-transform duration-200 ease-in-out translate-y-0 lg:translate-y-0 max-h-[85vh] lg:max-h-none overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
            <h3 className="text-sm font-medium">
              {selectedNode ? 'Node Properties' : 'Edge Properties'}
            </h3>
            <button
              onClick={onPaneClick}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <PropertiesPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              nodes={nodes}
              edges={edges}
              onNodeUpdate={onNodeUpdate}
              onEdgeUpdate={onEdgeUpdate}
              onClose={onPaneClick}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export const MockFormBuilder = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  selectedNode,
  selectedEdge,
  onNodeUpdate,
  onEdgeUpdate,
  onDuplicate,
  onDelete,
  onAddNode,
  isSaving,
}: FormBuilderProps) => {
  return (
    <ReactFlowProvider>
      <FormCanvasContext
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
        onNodeUpdate={onNodeUpdate}
        onEdgeUpdate={onEdgeUpdate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onAddNode={onAddNode}
        isSaving={isSaving}
      />
    </ReactFlowProvider>
  )
}
