import { Node, Edge } from 'reactflow'

export type MediaType = 'image' | 'video' | 'pdf'

export type QuestionType =
  | 'text'
  | 'multipleChoice'
  | 'dropdown'
  | 'boolean'
  | 'date'
  | 'rating'
  | 'slider'
  | 'longText'
  | 'media'

export interface FormNodeData {
  question: string
  type: QuestionType
  required: boolean
  variableName: string
  helpText?: string
  options?: string[]
  imageUrl?: string | null
  videoUrl?: string | null // For both uploaded videos and embedded videos
  pdfUrl?: string | null // For PDF files
  mediaTypes?: MediaType[] // Allowed media types for media questions
}

export type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty'

export type LogicalOperator = 'and' | 'or'

export interface Condition {
  sourceVariable: string
  operator: ComparisonOperator
  value?: string | number | boolean | Date | null
  type?: 'value' | 'variable' // If type is 'variable', value is another variable name
}

export interface FormEdgeData {
  conditions: Condition[]
  logicalOperator: LogicalOperator
  customExpression?: string
}

export interface FormSettings {
  formId: string
  formName: string
  startNodeId: string
  isPublished: boolean
  primaryColor: string
  showBranding: boolean
}

export interface FormState {
  nodes: Node<FormNodeData>[]
  edges: Edge<FormEdgeData>[]
  settings: FormSettings
}

export type FormValue = string | number | boolean | Date | null | undefined

export interface FormValues {
  [key: string]: FormValue
}
