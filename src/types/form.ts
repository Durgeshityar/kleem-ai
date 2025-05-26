import { Node, Edge } from 'reactflow'

export type QuestionType =
  | 'text'
  | 'multipleChoice'
  | 'dropdown'
  | 'boolean'
  | 'date'
  | 'rating'
  | 'slider'
  | 'longText'

export interface FormNodeData {
  question: string
  type: QuestionType
  required: boolean
  variableName: string
  helpText?: string
  options?: string[]
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
  customExpression?: string // For advanced users who want to write custom JS conditions
}

export interface FormSettings {
  formId: string
  formName: string
  startNodeId: string
  /** Indicates whether the form is publicly accessible */
  isPublished: boolean
  /** Primary theme colour used in the rendered form */
  primaryColor: string
  /** Whether to show "Powered by Kleem AI" footer */
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
