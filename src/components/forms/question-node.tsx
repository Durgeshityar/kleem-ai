'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Type,
  CheckSquare,
  Star,
  List,
  Calendar,
  FileText,
  ToggleLeft,
  FileSlidersIcon as Slider,
  GripVertical,
  Upload,
} from 'lucide-react'
import { FormNodeData } from '@/types/form'

type QuestionNodeData = FormNodeData

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
      return <Type className="h-4 w-4" />
    case 'multipleChoice':
      return <CheckSquare className="h-4 w-4" />
    case 'rating':
      return <Star className="h-4 w-4" />
    case 'dropdown':
      return <List className="h-4 w-4" />
    case 'date':
      return <Calendar className="h-4 w-4" />
    case 'longText':
      return <FileText className="h-4 w-4" />
    case 'boolean':
      return <ToggleLeft className="h-4 w-4" />
    case 'slider':
      return <Slider className="h-4 w-4" />
    case 'media':
      return <Upload className="h-4 w-4" />
    default:
      return <Type className="h-4 w-4" />
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'text':
      return 'Text'
    case 'multipleChoice':
      return 'Multiple Choice'
    case 'rating':
      return 'Rating'
    case 'dropdown':
      return 'Dropdown'
    case 'date':
      return 'Date'
    case 'longText':
      return 'Long Text'
    case 'boolean':
      return 'Yes/No'
    case 'slider':
      return 'Slider'
    case 'media':
      return 'Media Upload'
    default:
      return 'Text'
  }
}

function QuestionNodeComponent({
  data,
  isConnectable,
}: NodeProps<QuestionNodeData>) {
  return (
    <div className="group">
      <Card className="w-[280px] sm:w-64 shadow-md border-2 border-transparent hover:border-blue-200 transition-all">
        <CardHeader className="p-2 sm:p-3 pb-0 flex flex-row items-center">
          <div className="mr-2 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-3 sm:h-4 w-3 sm:w-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 sm:h-4 w-3 sm:w-4">
              {getTypeIcon(data.type)}
            </div>
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs font-normal"
            >
              {getTypeLabel(data.type)}
            </Badge>
          </div>
          {data.required && (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] sm:text-xs"
            >
              Required
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-2 sm:p-3 pt-2">
          <CardTitle className="text-xs sm:text-sm font-medium mb-1">
            {data.question}
          </CardTitle>
          {data.helpText && (
            <p className="text-[10px] sm:text-xs text-gray-500">
              {data.helpText}
            </p>
          )}

          {data.type === 'multipleChoice' && data.options && (
            <div className="mt-2 space-y-1">
              {data.options.map((option, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full border border-gray-300"></div>
                  <span className="text-[10px] sm:text-xs">{option}</span>
                </div>
              ))}
            </div>
          )}

          {data.type === 'media' && (
            <div className="mt-2 border border-dashed border-gray-300 rounded-md p-2">
              <div className="flex items-center justify-center gap-2">
                <Upload className="h-3 w-3 text-gray-400" />
                <span className="text-[10px] sm:text-xs text-gray-500">
                  Upload media here
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 sm:w-3 h-2 sm:h-3 bg-blue-500 border-2 border-white hover:bg-blue-600 hover:w-3 sm:hover:w-4 hover:h-3 sm:hover:h-4 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 sm:w-3 h-2 sm:h-3 bg-blue-500 border-2 border-white hover:bg-blue-600 hover:w-3 sm:hover:w-4 hover:h-3 sm:hover:h-4 transition-all"
      />
    </div>
  )
}

export default memo(QuestionNodeComponent)
