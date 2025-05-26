import { Node, Edge } from 'reactflow'
import {
  FormSettings,
  FormEdgeData,
  Condition,
  ComparisonOperator,
  QuestionType,
} from '@/types/form'

export const findStartNode = (
  nodes: Node[],
  edges: Edge[],
  settings: FormSettings,
  updateFormSettings: (updates: Partial<FormSettings>) => void
) => {
  const targetNodeIds = edges.map((edge) => edge.target)
  const possibleStartNodes = nodes.filter(
    (node) => !targetNodeIds.includes(node.id)
  )

  if (possibleStartNodes.length > 0) {
    const startNode = possibleStartNodes.sort((a, b) => {
      const aIdNum = Number.parseInt(a.id)
      const bIdNum = Number.parseInt(b.id)
      if (!isNaN(aIdNum) && !isNaN(bIdNum)) {
        return aIdNum - bIdNum
      }
      return a.position.y - b.position.y
    })[0]

    if (startNode && !settings.startNodeId) {
      updateFormSettings({ startNodeId: startNode.id })
    }

    return startNode
  }

  if (nodes.length > 0) {
    const firstNode = nodes[0]
    if (!settings.startNodeId) {
      updateFormSettings({ startNodeId: firstNode.id })
    }
    return firstNode
  }

  return null
}

type FormValue = string | number | boolean | Date | null
type FormValues = Record<string, FormValue>

// Helper function to normalize values based on question type
const normalizeValue = (value: FormValue, type: QuestionType): FormValue => {
  switch (type) {
    case 'rating':
    case 'slider':
      return typeof value === 'string' ? Number(value) : value
    case 'date':
      return typeof value === 'string' ? new Date(value) : value
    case 'boolean':
      return typeof value === 'string'
        ? value.toLowerCase() === 'true'
        : Boolean(value)
    default:
      return value
  }
}

const evaluateComparison = (
  operator: ComparisonOperator,
  value1: FormValue,
  value2: FormValue,
  type: QuestionType
): boolean => {
  // Handle isEmpty/isNotEmpty operators
  if (operator === 'isEmpty') {
    return value1 === null || value1 === '' || value1 === undefined
  }
  if (operator === 'isNotEmpty') {
    return value1 !== null && value1 !== '' && value1 !== undefined
  }

  // If either value is null/undefined (except for isEmpty/isNotEmpty which we handled above)
  if (
    value1 === null ||
    value1 === undefined ||
    value2 === null ||
    value2 === undefined
  ) {
    return false
  }

  // Normalize values based on question type
  const normalizedValue1 = normalizeValue(value1, type)
  const normalizedValue2 = normalizeValue(value2, type)

  // Special handling for dates
  if (type === 'date') {
    const time1 = (normalizedValue1 as Date).getTime()
    const time2 = (normalizedValue2 as Date).getTime()

    switch (operator) {
      case 'equals':
        return time1 === time2
      case 'notEquals':
        return time1 !== time2
      case 'greaterThan':
        return time1 > time2
      case 'lessThan':
        return time1 < time2
      case 'greaterThanOrEqual':
        return time1 >= time2
      case 'lessThanOrEqual':
        return time1 <= time2
      default:
        return false
    }
  }

  // Special handling for boolean values
  if (type === 'boolean') {
    switch (operator) {
      case 'equals':
        return normalizedValue1 === normalizedValue2
      case 'notEquals':
        return normalizedValue1 !== normalizedValue2
      default:
        return false
    }
  }

  // Special handling for numeric values (rating, slider)
  if (type === 'rating' || type === 'slider') {
    const num1 = Number(normalizedValue1)
    const num2 = Number(normalizedValue2)

    if (isNaN(num1) || isNaN(num2)) return false

    switch (operator) {
      case 'equals':
        return num1 === num2
      case 'notEquals':
        return num1 !== num2
      case 'greaterThan':
        return num1 > num2
      case 'lessThan':
        return num1 < num2
      case 'greaterThanOrEqual':
        return num1 >= num2
      case 'lessThanOrEqual':
        return num1 <= num2
      default:
        return false
    }
  }

  // Handle text-based comparisons (text, longText, multipleChoice, dropdown)
  switch (operator) {
    case 'equals':
      return normalizedValue1 === normalizedValue2
    case 'notEquals':
      return normalizedValue1 !== normalizedValue2
    case 'contains':
      return String(normalizedValue1).includes(String(normalizedValue2))
    case 'notContains':
      return !String(normalizedValue1).includes(String(normalizedValue2))
    default:
      return false
  }
}

const evaluateCondition = (
  condition: Condition,
  formValues: FormValues,
  nodes: Node[]
): boolean => {
  // Find the source node to get its type
  const sourceNode = nodes.find(
    (node) => node.data?.variableName === condition.sourceVariable
  )
  if (!sourceNode) {
    console.log('Source node not found:', condition.sourceVariable)
    return false
  }

  const sourceValue = formValues[condition.sourceVariable]
  const sourceType = sourceNode.data.type

  console.log('Evaluating condition:', {
    condition,
    sourceValue,
    sourceType,
    formValues,
  })

  // Handle isEmpty/isNotEmpty operators
  if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
    return evaluateComparison(condition.operator, sourceValue, null, sourceType)
  }

  // If comparing against another variable
  if (condition.type === 'variable' && typeof condition.value === 'string') {
    const compareNode = nodes.find(
      (node) => node.data?.variableName === condition.value
    )
    if (!compareNode) return false

    const compareValue = formValues[condition.value]
    return evaluateComparison(
      condition.operator,
      sourceValue,
      compareValue,
      sourceType
    )
  }

  // Regular value comparison
  const result = evaluateComparison(
    condition.operator,
    sourceValue,
    condition.value ?? null,
    sourceType
  )
  console.log('Comparison result:', result)
  return result
}

export const evaluateEdgeConditions = (
  edge: Edge<FormEdgeData>,
  formValues: FormValues,
  nodes: Node[]
): boolean => {
  // If no conditions are set, edge is always active
  if (!edge.data?.conditions || edge.data.conditions.length === 0) {
    return true
  }

  // If custom expression is provided, evaluate it
  if (edge.data.customExpression) {
    try {
      // Create a safe evaluation context with access to form values
      const evalContext = new Function(
        'formValues',
        `with(formValues) { return ${edge.data.customExpression} }`
      )
      return evalContext(formValues)
    } catch (error) {
      console.error('Error evaluating custom expression:', error)
      return false
    }
  }

  // Evaluate all conditions
  const results = edge.data.conditions.map((condition) =>
    evaluateCondition(condition, formValues, nodes)
  )

  // Apply logical operator
  return edge.data.logicalOperator === 'and'
    ? results.every(Boolean)
    : results.some(Boolean)
}

export const findNextNode = (
  currentNode: Node,
  nodes: Node[],
  edges: Edge<FormEdgeData>[],
  formValues: FormValues
): Node | null => {
  const outgoingEdges = edges.filter((edge) => edge.source === currentNode.id)

  // If no outgoing edges, return null
  if (outgoingEdges.length === 0) {
    return null
  }

  // Find first edge whose conditions are met
  const validEdge = outgoingEdges.find((edge) =>
    evaluateEdgeConditions(edge, formValues, nodes)
  )

  if (!validEdge) {
    return null
  }

  return nodes.find((node) => node.id === validEdge.target) || null
}
