import { Edge, Node } from 'reactflow'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  AlertCircle,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Video,
  FileText,
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { useState, useEffect, useMemo } from 'react'
import {
  FormNodeData,
  FormEdgeData,
  Condition,
  ComparisonOperator,
  QuestionType,
  MediaType,
} from '@/types/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import Image from 'next/image'
import { UploadButton } from '@/lib/uploadthing'

interface PropertiesPanelProps {
  selectedNode: Node<FormNodeData> | null
  selectedEdge: Edge<FormEdgeData> | null
  nodes: Node<FormNodeData>[]
  edges: Edge<FormEdgeData>[]
  onNodeUpdate: (nodeId: string, data: Partial<FormNodeData>) => void
  onEdgeUpdate: (edgeId: string, data: Partial<FormEdgeData>) => void
  onClose: () => void
}

const getAppropriateOperators = (nodeType: QuestionType) => {
  switch (nodeType) {
    case 'text':
      return [
        { value: 'equals', label: 'is exactly' },
        { value: 'notEquals', label: 'is not' },
        { value: 'contains', label: 'contains' },
        { value: 'notContains', label: 'does not contain' },
        { value: 'isEmpty', label: 'is empty' },
        { value: 'isNotEmpty', label: 'is not empty' },
      ]
    case 'boolean':
      return [
        { value: 'equals', label: 'is' },
        { value: 'notEquals', label: 'is not' },
      ]
    case 'rating':
      return [
        { value: 'equals', label: 'is exactly' },
        { value: 'notEquals', label: 'is not' },
        { value: 'greaterThan', label: 'is greater than' },
        { value: 'lessThan', label: 'is less than' },
        { value: 'greaterThanOrEqual', label: 'is at least' },
        { value: 'lessThanOrEqual', label: 'is at most' },
      ]
    default:
      return [
        { value: 'equals', label: 'is exactly' },
        { value: 'notEquals', label: 'is not' },
      ]
  }
}

const ConditionBuilder = ({
  condition,
  availableVariables,
  sourceNodeType,
  onUpdate,
  onDelete,
}: {
  condition: Condition
  availableVariables: { label: string; value: string }[]
  sourceNodeType: QuestionType
  onUpdate: (updates: Partial<Condition>) => void
  onDelete: () => void
}) => {
  const operators = getAppropriateOperators(sourceNodeType)
  const [error, setError] = useState<string | null>(null)

  // Get valid comparison types based on source node type
  const getValidComparisonTypes = () => {
    switch (sourceNodeType) {
      case 'rating':
        return [{ value: 'value', label: 'Fixed Value' }]
      case 'boolean':
        return [{ value: 'value', label: 'Fixed Value' }]
      case 'multipleChoice':
      case 'dropdown':
        return [{ value: 'value', label: 'Fixed Value' }]
      default:
        return [
          { value: 'value', label: 'Fixed Value' },
          { value: 'variable', label: 'Another Question' },
        ]
    }
  }

  // Validate condition
  useEffect(() => {
    if (!condition.sourceVariable) {
      setError('Please select a question to check')
      return
    }
    if (!condition.operator) {
      setError('Please select how to compare the answer')
      return
    }
    if (
      !['isEmpty', 'isNotEmpty'].includes(condition.operator) &&
      !condition.value &&
      condition.value !== false
    ) {
      setError('Please specify a value to compare against')
      return
    }
    setError(null)
  }, [condition])

  const renderValueInput = () => {
    if (['isEmpty', 'isNotEmpty'].includes(condition.operator)) {
      return null
    }

    if (condition.type === 'variable') {
      return (
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">the answer to</Label>
          <Select
            value={condition.value as string}
            onValueChange={(value) => onUpdate({ value })}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Select another question" />
            </SelectTrigger>
            <SelectContent>
              {availableVariables.map((variable) => (
                <SelectItem key={variable.value} value={variable.value}>
                  {variable.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    switch (sourceNodeType) {
      case 'boolean':
        return (
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">the value</Label>
            <Select
              value={String(condition.value)}
              onValueChange={(value) => onUpdate({ value: value === 'true' })}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select yes or no" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'rating':
        return (
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              the rating of
            </Label>
            <Select
              value={String(condition.value || '')}
              onValueChange={(value) => onUpdate({ value: Number(value) })}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating} value={String(rating)}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'multipleChoice':
      case 'dropdown':
        return (
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              the selected option
            </Label>
            <Input
              value={String(condition.value ?? '')}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className="w-full text-sm"
              placeholder="Type the exact option text"
            />
          </div>
        )

      default:
        return (
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">the text</Label>
            <Input
              value={String(condition.value ?? '')}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className="w-full text-sm"
              placeholder="Type the value to compare"
            />
          </div>
        )
    }
  }

  return (
    <Card
      className={cn(
        'transition-colors overflow-y-auto',
        error ? 'border-red-200' : ''
      )}
    >
      <CardContent className="space-y-4 pt-4 overflow-y-auto">
        {/* Natural language condition builder */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              When the answer to
            </Label>
            <Select
              value={condition.sourceVariable}
              onValueChange={(value) => onUpdate({ sourceVariable: value })}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {availableVariables.map((variable) => (
                  <SelectItem key={variable.value} value={variable.value}>
                    {variable.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              is compared as follows
            </Label>
            <Select
              value={condition.operator}
              onValueChange={(value) =>
                onUpdate({ operator: value as ComparisonOperator })
              }
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select how to compare" />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!['isEmpty', 'isNotEmpty'].includes(condition.operator) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Compare against
                </Label>
                <Select
                  value={condition.type || 'value'}
                  onValueChange={(value: 'value' | 'variable') => {
                    onUpdate({
                      type: value,
                      value: value === 'variable' ? '' : condition.value,
                    })
                  }}
                >
                  <SelectTrigger className="w-[160px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getValidComparisonTypes().map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderValueInput()}
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Remove Condition
        </Button>
      </CardContent>
    </Card>
  )
}

const PropertiesPanel = ({
  selectedNode,
  selectedEdge,
  nodes,
  edges,
  onNodeUpdate,
  onEdgeUpdate,
  onClose,
}: PropertiesPanelProps) => {
  const [localNodeData, setLocalNodeData] = useState<FormNodeData | null>(null)
  const [localEdgeData, setLocalEdgeData] = useState<FormEdgeData | null>(null)
  const [activeTab, setActiveTab] = useState<'conditions' | 'advanced'>(
    'conditions'
  )

  // Get source node type whenever selectedEdge changes
  const sourceNodeType = useMemo(() => {
    if (!selectedEdge || !nodes || !Array.isArray(nodes)) return 'text'
    const sourceNode = nodes.find((node) => node.id === selectedEdge.source)
    return sourceNode?.data?.type || 'text'
  }, [selectedEdge, nodes])

  // Update local state when selection changes
  useEffect(() => {
    if (selectedNode) {
      setLocalNodeData({ ...selectedNode.data } as FormNodeData)
      setLocalEdgeData(null)
    } else if (selectedEdge) {
      setLocalEdgeData({
        conditions: selectedEdge.data?.conditions || [],
        logicalOperator: selectedEdge.data?.logicalOperator || 'and',
        customExpression: selectedEdge.data?.customExpression,
      })
      setLocalNodeData(null)
    }
  }, [selectedNode, selectedEdge])

  // Effect to handle mutual exclusivity between conditions and custom expression
  useEffect(() => {
    if (!localEdgeData) return

    if (activeTab === 'advanced' && localEdgeData.customExpression) {
      // If switching to advanced and there's a custom expression, clear conditions
      handleEdgeDataChange('conditions', [])
    } else if (
      activeTab === 'conditions' &&
      localEdgeData.conditions?.length > 0
    ) {
      // If switching to conditions and there are conditions, clear custom expression
      handleEdgeDataChange('customExpression', '')
    }
  }, [activeTab])

  // Handle node data changes
  const handleNodeDataChange = <K extends keyof FormNodeData>(
    key: K,
    value: K extends 'required' ? boolean : FormNodeData[K]
  ) => {
    if (!selectedNode || !localNodeData) return

    // For variable name changes, check for duplicates
    if (key === 'variableName') {
      const variableName = value as string
      const isDuplicate = nodes.some(
        (node) =>
          node.id !== selectedNode.id && node.data.variableName === variableName
      )

      if (isDuplicate) {
        toast.error(
          'This variable name is already in use. Please choose a different one.'
        )
        return
      }

      // Validate variable name format
      if (!variableName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        toast.error(
          'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores'
        )
        return
      }
    }

    const newData = { ...localNodeData, [key]: value }
    setLocalNodeData(newData)
    onNodeUpdate(selectedNode.id, { [key]: value })
  }

  // Handle edge data changes
  const handleEdgeDataChange = <K extends keyof FormEdgeData>(
    key: K,
    value: FormEdgeData[K]
  ) => {
    if (!selectedEdge || !localEdgeData) return

    const newData = { ...localEdgeData, [key]: value }
    setLocalEdgeData(newData)
    onEdgeUpdate(selectedEdge.id, { [key]: value })
  }

  // Add option to multiple choice
  const addOption = () => {
    if (!selectedNode || !localNodeData) return

    const options = localNodeData.options || []
    const newOptions = [...options, 'New Option']
    handleNodeDataChange('options', newOptions)
  }

  // Update option
  const updateOption = (index: number, value: string) => {
    if (!selectedNode || !localNodeData || !localNodeData.options) return

    const newOptions = [...localNodeData.options]
    newOptions[index] = value
    handleNodeDataChange('options', newOptions)
  }

  // Remove option
  const removeOption = (index: number) => {
    if (!selectedNode || !localNodeData || !localNodeData.options) return

    const newOptions = [...localNodeData.options]
    newOptions.splice(index, 1)
    handleNodeDataChange('options', newOptions)
  }

  // Add a new condition
  const addCondition = () => {
    if (!selectedEdge || !localEdgeData) return

    const newCondition: Condition = {
      sourceVariable: '',
      operator: 'equals',
      value: '',
      type: 'value',
    }

    const newConditions = [...(localEdgeData.conditions || []), newCondition]
    handleEdgeDataChange('conditions', newConditions)
  }

  // Update a condition
  const updateCondition = (index: number, updates: Partial<Condition>) => {
    if (!selectedEdge || !localEdgeData || !localEdgeData.conditions) return

    const newConditions = [...localEdgeData.conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    handleEdgeDataChange('conditions', newConditions)
  }

  // Remove a condition
  const removeCondition = (index: number) => {
    if (!selectedEdge || !localEdgeData || !localEdgeData.conditions) return

    const newConditions = [...localEdgeData.conditions]
    newConditions.splice(index, 1)
    handleEdgeDataChange('conditions', newConditions)
  }

  // Get available variables from nodes
  const getAvailableVariables = () => {
    if (!selectedEdge || !nodes || !Array.isArray(nodes)) return []

    // Find all connected nodes that lead to the target node
    const connectedNodes = new Set<string>()
    const targetNodeId = selectedEdge.target
    const sourceNodeId = selectedEdge.source

    // Helper function to find all nodes that can reach the target
    const findConnectedNodes = (nodeId: string, visited: Set<string>) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      connectedNodes.add(nodeId)

      // Find all edges that connect to this node
      edges.forEach((edge: Edge<FormEdgeData>) => {
        if (edge.target === nodeId) {
          findConnectedNodes(edge.source, visited)
        }
      })
    }

    // Start from the target node and work backwards
    findConnectedNodes(targetNodeId, new Set())

    // Get all nodes that are connected and come before the target node
    const availableNodes = nodes.filter(
      (node) =>
        node.data?.variableName &&
        node.data?.question &&
        node.id !== targetNodeId &&
        (node.id === sourceNodeId || connectedNodes.has(node.id))
    )

    return availableNodes.map((node) => ({
      label: node.data.question,
      value: node.data.variableName,
    }))
  }

  const toggleMediaType = (type: MediaType) => {
    if (!selectedNode || !localNodeData) return

    const currentTypes = localNodeData.mediaTypes || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]

    handleNodeDataChange('mediaTypes', newTypes)
  }

  return (
    <div className="flex flex-col h-[100dvh] lg:h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 lg:p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h3 className="text-base lg:text-sm font-medium text-gray-900 pl-0 lg:pl-14 [@media(min-width:792px)]:ml-10">
          {selectedNode ? 'Question Properties' : 'Connection Properties'}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 lg:p-3">
        {selectedNode && localNodeData && (
          <div className="space-y-5 lg:space-y-4 max-w-lg mx-auto lg:max-w-none">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-base lg:text-sm">
                Question Text
              </Label>
              <Textarea
                id="question"
                value={localNodeData.question || ''}
                onChange={(e) =>
                  handleNodeDataChange('question', e.target.value)
                }
                className="resize-none min-h-[100px] text-base lg:text-sm"
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="media">
                <AccordionTrigger className="text-base lg:text-sm">
                  Media Attachments
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Image Upload Section */}
                    <Card>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <ImageIcon className="h-4 w-4" />
                            <Label className="text-sm">Image Upload</Label>
                          </div>
                          <div className="flex-shrink-0">
                            <UploadButton
                              appearance={{
                                button: 'px-2 py-1',
                                allowedContent: 'hidden',
                              }}
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                if (res && res[0]) {
                                  handleNodeDataChange('imageUrl', res[0].url)
                                  toast.success('Image uploaded successfully')
                                }
                              }}
                              onUploadError={(error: Error) => {
                                toast.error(`Upload failed: ${error.message}`)
                              }}
                            />
                          </div>
                        </div>
                        {localNodeData.imageUrl ? (
                          <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden">
                            <Image
                              src={localNodeData.imageUrl}
                              alt="Question media"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() =>
                                handleNodeDataChange('imageUrl', null)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                            No image uploaded
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Supported formats: JPG, PNG, GIF (max 5MB)
                        </p>
                      </CardContent>
                    </Card>

                    {/* Video Embed Section */}
                    <Card>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <Label className="text-sm">Video</Label>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <div className="w-full">
                            <UploadButton
                              appearance={{
                                button: 'px-2 py-1',
                                allowedContent: 'hidden',
                              }}
                              endpoint="videoUploader"
                              onClientUploadComplete={(res) => {
                                if (res && res[0]) {
                                  handleNodeDataChange('videoUrl', res[0].url)
                                  toast.success('Video uploaded successfully')
                                }
                              }}
                              onUploadError={(error: Error) => {
                                toast.error(`Upload failed: ${error.message}`)
                              }}
                            />
                          </div>
                          <Input
                            placeholder=" Or paste YouTube, Vimeo, or other video URL"
                            value={localNodeData.videoUrl || ''}
                            onChange={(e) =>
                              handleNodeDataChange('videoUrl', e.target.value)
                            }
                            className="text-sm flex-1"
                          />
                        </div>
                        {localNodeData.videoUrl && (
                          <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden">
                            {localNodeData.videoUrl.includes('youtube.com') ||
                            localNodeData.videoUrl.includes('youtu.be') ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${
                                  localNodeData.videoUrl.split('v=')[1] ||
                                  localNodeData.videoUrl.split('youtu.be/')[1]
                                }`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            ) : localNodeData.videoUrl.includes('vimeo.com') ? (
                              <iframe
                                src={`https://player.vimeo.com/video/${
                                  localNodeData.videoUrl.split('vimeo.com/')[1]
                                }`}
                                title="Vimeo video player"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            ) : localNodeData.videoUrl.startsWith(
                                'https://'
                              ) ? (
                              <video
                                src={localNodeData.videoUrl}
                                controls
                                className="absolute inset-0 w-full h-full"
                                preload="metadata"
                              >
                                <source
                                  src={localNodeData.videoUrl}
                                  type="video/mp4"
                                />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                <Video className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Video preview not available
                                </p>
                              </div>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() =>
                                handleNodeDataChange('videoUrl', null)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Supports YouTube and Vimeo video URLs
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-base lg:text-sm">
                Question Type
              </Label>
              <Select
                value={localNodeData.type}
                onValueChange={(value) =>
                  handleNodeDataChange('type', value as QuestionType)
                }
              >
                <SelectTrigger
                  id="type"
                  className="w-full text-base lg:text-sm"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="multipleChoice">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="date">Date Picker</SelectItem>
                  <SelectItem value="longText">Long Text</SelectItem>
                  <SelectItem value="boolean">Yes/No Toggle</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variableName" className="text-base lg:text-sm">
                Variable Name
              </Label>
              <Input
                id="variableName"
                value={localNodeData.variableName || ''}
                onChange={(e) =>
                  handleNodeDataChange('variableName', e.target.value)
                }
                className="w-full text-base lg:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpText" className="text-base lg:text-sm">
                Help Text
              </Label>
              <Textarea
                id="helpText"
                value={localNodeData.helpText || ''}
                onChange={(e) =>
                  handleNodeDataChange('helpText', e.target.value)
                }
                className="resize-none min-h-[60px] text-base lg:text-sm"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="required" className="text-base lg:text-sm">
                Required
              </Label>
              <Switch
                id="required"
                checked={localNodeData.required || false}
                onCheckedChange={(checked) =>
                  handleNodeDataChange('required', checked)
                }
              />
            </div>

            {(localNodeData.type === 'multipleChoice' ||
              localNodeData.type === 'dropdown') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base lg:text-sm">Options</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="h-9 lg:h-8 px-3 lg:px-2 text-base lg:text-sm"
                  >
                    <Plus className="h-4 lg:h-3.5 w-4 lg:w-3.5 mr-1.5 lg:mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-3 lg:space-y-2">
                  {(localNodeData.options || []).map(
                    (option: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 text-base lg:text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="h-9 w-9 lg:h-8 lg:w-8"
                        >
                          <Trash2 className="h-4.5 w-4.5 lg:h-4 lg:w-4" />
                        </Button>
                      </div>
                    )
                  )}
                  {(!localNodeData.options ||
                    localNodeData.options.length === 0) && (
                    <p className="text-sm text-gray-500">
                      No options added yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {localNodeData.type === 'media' && (
              <div className="space-y-2">
                <Label className="text-sm">Allowed Media Types</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={
                      localNodeData.mediaTypes?.includes('image')
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => toggleMediaType('image')}
                    className="flex items-center gap-1.5"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </Button>
                  <Button
                    variant={
                      localNodeData.mediaTypes?.includes('video')
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => toggleMediaType('video')}
                    className="flex items-center gap-1.5"
                  >
                    <Video className="h-4 w-4" />
                    Video
                  </Button>
                  <Button
                    variant={
                      localNodeData.mediaTypes?.includes('pdf')
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => toggleMediaType('pdf')}
                    className="flex items-center gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
                {(!localNodeData.mediaTypes ||
                  localNodeData.mediaTypes.length === 0) && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select at least one media type
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        {selectedEdge && localEdgeData && (
          <div className="space-y-5 lg:space-y-4 max-w-lg mx-auto lg:max-w-none">
            <Tabs
              defaultValue="conditions"
              className="w-full"
              onValueChange={(value) =>
                setActiveTab(value as 'conditions' | 'advanced')
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="conditions" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {/* Help text */}
                  <Alert>
                    <AlertDescription className="text-sm">
                      {localEdgeData.customExpression ? (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Please clear the custom expression in the Advanced tab
                          before adding conditions.
                        </div>
                      ) : (
                        'Add conditions to control when this connection should be active. If no conditions are added, the connection will always be active.'
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Conditions list */}
                  <div className="space-y-4">
                    {localEdgeData.conditions?.map((condition, index) => (
                      <ConditionBuilder
                        key={index}
                        condition={condition}
                        availableVariables={getAvailableVariables()}
                        sourceNodeType={sourceNodeType}
                        onUpdate={(updates) => updateCondition(index, updates)}
                        onDelete={() => removeCondition(index)}
                      />
                    ))}
                  </div>

                  {/* Add condition button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCondition}
                    className="w-full"
                    disabled={!!localEdgeData.customExpression}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add New Condition
                  </Button>

                  {/* Logical operator selection */}
                  {localEdgeData.conditions &&
                    localEdgeData.conditions.length > 1 && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <Label className="text-sm">
                              How should these conditions be combined?
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <Button
                                variant={
                                  localEdgeData.logicalOperator === 'and'
                                    ? 'default'
                                    : 'outline'
                                }
                                className="w-full"
                                onClick={() =>
                                  handleEdgeDataChange('logicalOperator', 'and')
                                }
                              >
                                <Badge
                                  variant={
                                    localEdgeData.logicalOperator === 'and'
                                      ? 'default'
                                      : 'outline'
                                  }
                                  className="mr-2"
                                >
                                  AND
                                </Badge>
                                All Must Be True
                              </Button>
                              <Button
                                variant={
                                  localEdgeData.logicalOperator === 'or'
                                    ? 'default'
                                    : 'outline'
                                }
                                className="w-full"
                                onClick={() =>
                                  handleEdgeDataChange('logicalOperator', 'or')
                                }
                              >
                                <Badge
                                  variant={
                                    localEdgeData.logicalOperator === 'or'
                                      ? 'default'
                                      : 'outline'
                                  }
                                  className="mr-2"
                                >
                                  OR
                                </Badge>
                                Any Can Be True
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="space-y-4 pt-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm ml-2">
                        {localEdgeData.conditions?.length > 0
                          ? 'Please remove all conditions from the Conditions tab before adding a custom expression.'
                          : 'This section is for advanced users only. You can write custom JavaScript expressions to determine when this connection should be active.'}
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label className="text-sm">Custom Expression</Label>
                      <Textarea
                        value={localEdgeData.customExpression || ''}
                        onChange={(e) =>
                          handleEdgeDataChange(
                            'customExpression',
                            e.target.value
                          )
                        }
                        className="font-mono text-sm min-h-[100px]"
                        placeholder="Example: formValues.rating > 3 && formValues.feedback.length > 0"
                        disabled={localEdgeData.conditions?.length > 0}
                      />
                      <p className="text-xs text-gray-500">
                        Use formValues.questionName to access question answers.
                        The expression should return true or false.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertiesPanel
