import { Button } from '../../ui/button'
import FormPreview from './form-preview'
import { Node, Edge } from 'reactflow'
import { FormSettings } from '@/types/form'
import { findStartNode } from '@/utils/form-utils'

interface FormPreviewModeProps {
  nodes: Node[]
  edges: Edge[]
  settings: FormSettings
  updateFormSettings: (updates: Partial<FormSettings>) => void
  setIsPreviewMode: (value: boolean) => void
}

export const FormPreviewMode = ({
  nodes,
  edges,
  settings,
  updateFormSettings,
  setIsPreviewMode,
}: FormPreviewModeProps) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gradient-to-b mt-2  from-white to-gray-50/50 border-b border-gray-200/80 backdrop-blur-sm p-2 sm:p-3 flex justify-between items-center">
        <h2 className="text-sm sm:text-base ml-10 font-medium flex items-center gap-2 text-gray-900">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Preview
          </span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPreviewMode(false)}
          className="text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
        >
          Exit Preview
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <FormPreview
          nodes={nodes}
          edges={edges}
          startNode={findStartNode(nodes, edges, settings, updateFormSettings)}
          customStyles={{
            useAI: true,
          }}
        />
      </div>
    </div>
  )
}
