import { useRef } from 'react'
import dynamic from 'next/dynamic'
import {
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  Panel,
  useReactFlow,
  SelectionMode,
} from 'reactflow'
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from 'reactflow'
import { FormNodeData, FormEdgeData, FormSettings } from '@/types/form'
import { Loader } from 'lucide-react'

import conditionalEdge from './conditional-edge'
import questionNode from './question-node'
import FormSettingsPanel from './form-seetings'
import PropertiesPanel from './properties-panel'
import { useFormBuilder } from '../../hooks/useFormBuilder'
import { TopToolbar } from './toolbar/TopToolbar'
import { BottomToolbar } from './toolbar/BottomToolbar'
import { FormPreviewMode } from './preview/FormPreviewMode'
import { findStartNode } from '@/utils/form-utils'

// Dynamically import ReactFlow components with no SSR
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

// Import styles
import 'reactflow/dist/style.css'

// Node and edge type definitions
const nodeTypes = {
  questionNode: questionNode,
}

const edgeTypes = {
  conditionalEdge: conditionalEdge,
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
  settings: FormSettings
  updateFormSettings: (updates: Partial<FormSettings>) => void
}

function FormCanvasContext({
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
  settings,
  updateFormSettings,
}: FormBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { setViewport } = useReactFlow()
  const {
    snapToGrid,
    isConnectMode,
    isZoomedOut,
    isPreviewMode,
    isSettingsOpen,
    setSnapToGrid,
    setIsConnectMode,
    setIsZoomedOut,
    setIsPreviewMode,
    setIsSettingsOpen,
    interactionMode,
    handleInteractionModeChange,
  } = useFormBuilder()

  // Toggle zoom level
  const toggleZoom = () => {
    if (isZoomedOut) {
      setViewport({ x: 0, y: 0, zoom: 1 })
    } else {
      if (nodes.length > 0) {
        const xPositions = nodes.map((node) => node.position.x)
        const yPositions = nodes.map((node) => node.position.y)
        const minX = Math.min(...xPositions)
        const maxX = Math.max(...xPositions)
        const minY = Math.min(...yPositions)
        const maxY = Math.max(...yPositions)
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2
        setViewport({ x: -centerX + 400, y: -centerY + 300, zoom: 0.5 })
      } else {
        setViewport({ x: 0, y: 0, zoom: 0.5 })
      }
    }
    setIsZoomedOut(!isZoomedOut)
  }

  return (
    <div className="w-full h-[100dvh] overflow-hidden" ref={reactFlowWrapper}>
      {isSettingsOpen && (
        <FormSettingsPanel
          nodes={nodes}
          edges={edges}
          startNode={findStartNode(nodes, edges, settings, updateFormSettings)}
          formId={settings.formId}
          formName={settings.formName}
          isPublished={settings.isPublished}
          primaryColor={settings.primaryColor}
          showBranding={settings.showBranding}
          onUpdateSettings={updateFormSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isPreviewMode ? (
        <FormPreviewMode
          nodes={nodes}
          edges={edges}
          settings={settings}
          updateFormSettings={updateFormSettings}
          setIsPreviewMode={setIsPreviewMode}
        />
      ) : (
        <>
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
            connectionMode={
              interactionMode === 'connect'
                ? ConnectionMode.Strict
                : ConnectionMode.Loose
            }
            connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
            connectionLineType={ConnectionLineType.Bezier}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            className={`touch-none ${
              interactionMode === 'select'
                ? 'cursor-pointer'
                : interactionMode === 'pan'
                ? 'cursor-grab active:cursor-grabbing'
                : interactionMode === 'connect'
                ? 'cursor-crosshair'
                : ''
            }`}
            panOnScroll={interactionMode === 'pan'}
            panOnDrag={interactionMode === 'pan'}
            selectionMode={
              interactionMode === 'select'
                ? SelectionMode.Partial
                : SelectionMode.Full
            }
            nodesDraggable={interactionMode === 'select'}
            nodesConnectable={interactionMode === 'connect'}
            elementsSelectable={interactionMode === 'select'}
            zoomOnScroll={interactionMode !== 'pan'}
            zoomOnPinch={interactionMode !== 'pan'}
            zoomOnDoubleClick={false}
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

            <BottomToolbar
              setIsSettingsOpen={setIsSettingsOpen}
              setIsPreviewMode={setIsPreviewMode}
              snapToGrid={snapToGrid}
              setSnapToGrid={setSnapToGrid}
              isZoomedOut={isZoomedOut}
              toggleZoom={toggleZoom}
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
          {!isPreviewMode && (selectedNode || selectedEdge) && (
            <div className="fixed lg:right-0 inset-x-0 lg:inset-x-auto bottom-0 lg:bottom-auto lg:inset-y-0 w-full lg:w-80 bg-white border-t lg:border-l border-gray-200 shadow-lg transition-transform duration-200 ease-in-out max-h-[85vh] lg:max-h-none overflow-hidden">
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
          )}
        </>
      )}
    </div>
  )
}

export const FormBuilder = ({
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
  settings,
  updateFormSettings,
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
        settings={settings}
        updateFormSettings={updateFormSettings}
      />
    </ReactFlowProvider>
  )
}
