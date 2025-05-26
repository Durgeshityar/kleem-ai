import { Panel } from 'reactflow'
import { FormNodeData } from '@/types/form'
import FloatingToolbar from '../floating-toolbar'

interface TopToolbarProps {
  onAddNode: (type: FormNodeData['type']) => void
  onDelete: () => void
  onDuplicate: () => void
  isConnectMode: boolean
  setIsConnectMode: (value: boolean) => void
  hasSelection: boolean
  isSaving: boolean
  interactionMode: 'select' | 'pan' | 'connect'
  onModeChange: (mode: 'select' | 'pan' | 'connect') => void
}

const ConnectionModeHint = () => (
  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md shadow-sm border border-blue-200 text-xs sm:text-sm max-w-[calc(100vw-2rem)] text-center">
    Click and drag from one node&apos;s handle to another to create a connection
  </div>
)

export const TopToolbar = ({
  onAddNode,
  onDelete,
  onDuplicate,
  isConnectMode,
  hasSelection,
  isSaving,
  interactionMode,
  onModeChange,
}: TopToolbarProps) => {
  return (
    <Panel position="top-center" className="w-full px-2 sm:px-0 sm:w-auto">
      <FloatingToolbar
        onAddNode={onAddNode}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        hasSelection={hasSelection}
        isSaving={isSaving}
        className="hidden sm:flex"
        mode={interactionMode}
        onModeChange={onModeChange}
      />
      <FloatingToolbar
        onAddNode={onAddNode}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        hasSelection={hasSelection}
        isSaving={false}
        className="flex sm:hidden"
        mode={interactionMode}
        onModeChange={onModeChange}
      />
      {isConnectMode && <ConnectionModeHint />}
    </Panel>
  )
}
