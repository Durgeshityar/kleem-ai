import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  User,
  Mail,
  Building,
  MessageSquare,
  Star,
  Clock,
  Globe,
  Monitor,
  Hash,
  FileText,
  Settings,
  Copy,
  Check,
} from 'lucide-react'
import { ReactNode, useState } from 'react'

interface FormNode {
  id: string
  data: {
    question: string
    type: string
    variableName: string
    required: boolean
    helpText?: string
    options?: string[]
  }
}

interface FormResponse {
  id: string
  formId: string
  createdAt: Date
  responses: Record<string, unknown>
  metadata?: Record<string, unknown>
  form?: {
    id: string
    name: string
    nodes?: FormNode[]
  }
}

interface FormResponseDetailProps {
  response: FormResponse
}

export function FormResponseDetail({ response }: FormResponseDetailProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const safeString = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  const safeNumber = (value: unknown): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Function to get question text from variable name
  const getQuestionFromVariableName = (variableName: string): string => {
    if (!response.form?.nodes) return variableName

    const node = response.form.nodes.find(
      (node) => node.data.variableName === variableName
    )

    return node?.data.question || variableName
  }

  // Function to get question type from variable name
  const getQuestionType = (variableName: string): string => {
    if (!response.form?.nodes) return 'text'

    const node = response.form.nodes.find(
      (node) => node.data.variableName === variableName
    )

    return node?.data.type || 'text'
  }

  // Function to get icon for question type
  const getQuestionIcon = (variableName: string) => {
    if (variableName.toLowerCase().includes('email')) {
      return <Mail className="h-4 w-4 text-blue-500" />
    }
    if (variableName.toLowerCase().includes('company')) {
      return <Building className="h-4 w-4 text-purple-500" />
    }
    if (variableName.toLowerCase().includes('name')) {
      return <User className="h-4 w-4 text-green-500" />
    }
    if (variableName.toLowerCase().includes('message')) {
      return <MessageSquare className="h-4 w-4 text-orange-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  // Function to render value based on question type
  const renderValueByType = (
    variableName: string,
    value: unknown
  ): ReactNode => {
    const questionType = getQuestionType(variableName)

    switch (questionType) {
      case 'rating':
        const rating = safeNumber(value)
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-700">
              {rating}/5
            </span>
          </div>
        )
      case 'boolean':
        return (
          <div className="text-sm px-4 py-2 font-medium bg-gray-100 rounded-md">
            {value === true ? '✓ Yes' : '✗ No'}
          </div>
        )
      case 'date':
        if (typeof value === 'string') {
          try {
            const date = new Date(value)
            return (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-base font-medium text-blue-800">
                  {date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )
          } catch {
            return (
              <span className="text-base text-gray-800">
                {safeString(value)}
              </span>
            )
          }
        }
        return (
          <span className="text-base text-gray-800">{safeString(value)}</span>
        )
      case 'slider':
        const percentage = safeNumber(value)
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-lg font-semibold text-blue-600">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
        )
      case 'longText':
        return (
          <div className="space-y-2">
            <div className="relative">
              <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-4 border">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-800">
                  {safeString(value)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(safeString(value), variableName)}
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
              >
                {copiedField === variableName ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
        )
      default:
        if (typeof value === 'object') {
          const jsonString = JSON.stringify(value, null, 2)
          return (
            <div className="space-y-2">
              <div className="relative">
                <div className="max-h-40 overflow-y-auto bg-gray-900 rounded-lg p-4 border">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {jsonString}
                  </pre>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(jsonString, `json-${variableName}`)
                  }
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-gray-800/80 hover:bg-gray-800 text-white"
                >
                  {copiedField === `json-${variableName}` ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-300" />
                  )}
                </Button>
              </div>
            </div>
          )
        }
        return (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <span className="text-base font-medium text-gray-800 flex-1 break-words">
              {safeString(value)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(safeString(value), variableName)}
              className="h-8 w-8 p-0 ml-2 flex-shrink-0"
            >
              {copiedField === variableName ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        )
    }
  }

  // Get all form questions in the order they were defined by the form owner
  const getAllFormQuestions = () => {
    if (!response.form?.nodes) {
      // Fallback: if no form nodes, show all responses except special fields
      return Object.entries(response.responses).filter(
        ([key]) => !['enhancedMessage'].includes(key)
      )
    }

    // Use form nodes to get questions in the correct order
    const orderedQuestions: Array<[string, unknown]> = []

    response.form.nodes.forEach((node) => {
      const variableName = node.data.variableName
      if (response.responses.hasOwnProperty(variableName)) {
        orderedQuestions.push([variableName, response.responses[variableName]])
      }
    })

    // Add any responses that don't have corresponding nodes (shouldn't happen but just in case)
    Object.entries(response.responses).forEach(([key, value]) => {
      if (
        !orderedQuestions.some(([varName]) => varName === key) &&
        key !== 'enhancedMessage'
      ) {
        orderedQuestions.push([key, value])
      }
    })

    return orderedQuestions
  }

  const allFormQuestions = getAllFormQuestions()

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
              {response.form?.name || 'Form Response'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(response.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span className="font-mono text-xs">
                  {response.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>
        <Separator />
      </div>

      {/* Tabs Section */}
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-lg shadow-sm border">
        <Tabs defaultValue="responses" className="flex-1">
          <TabsList className="w-full grid grid-cols-2 lg:grid-cols-3 p-1 bg-muted/50">
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Responses</span>
              <span className="sm:hidden">Q&A</span>
            </TabsTrigger>
            <TabsTrigger
              value="technical"
              className="flex items-center gap-2"
              disabled={!response.metadata}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Technical</span>
              <span className="sm:hidden">Tech</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Details</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Form Responses Tab */}
            <TabsContent
              value="responses"
              className="h-full overflow-y-auto p-4 lg:p-6"
            >
              {allFormQuestions.length > 0 ? (
                <div className="space-y-4">
                  {allFormQuestions.map(([variableName, value]) => (
                    <div
                      key={variableName}
                      className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getQuestionIcon(variableName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 mb-2">
                            {getQuestionFromVariableName(variableName)}
                          </h3>
                          <div className="relative">
                            {renderValueByType(variableName, value)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p>No responses found</p>
                </div>
              )}
            </TabsContent>

            {/* Technical Information Tab */}
            <TabsContent
              value="technical"
              className="h-full overflow-y-auto p-4 lg:p-6"
            >
              {response.metadata ? (
                <div className="space-y-4">
                  {response.metadata.userAgent &&
                  typeof response.metadata.userAgent === 'string' ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Monitor className="h-5 w-5 text-gray-600" />
                          User Agent
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <div className="bg-gray-50 rounded-lg p-4 border">
                            <p className="text-sm font-mono text-gray-600 break-all leading-relaxed pr-8">
                              {safeString(response.metadata.userAgent)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                safeString(response.metadata?.userAgent || ''),
                                'userAgent'
                              )
                            }
                            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                          >
                            {copiedField === 'userAgent' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {response.metadata.ipAddress &&
                  typeof response.metadata.ipAddress === 'string' ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-gray-600" />
                          IP Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <div className="bg-gray-50 rounded-lg p-4 border">
                            <p className="font-mono text-base text-gray-800 pr-8">
                              {safeString(response.metadata.ipAddress)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                safeString(response.metadata?.ipAddress || ''),
                                'ipAddress'
                              )
                            }
                            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                          >
                            {copiedField === 'ipAddress' ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Other metadata fields */}
                  {Object.entries(response.metadata)
                    .filter(
                      ([key]) => !['userAgent', 'ipAddress'].includes(key)
                    )
                    .map(([key, value]) => (
                      <Card key={key}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-600" />
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <div className="bg-gray-50 rounded-lg p-4 border">
                              {typeof value === 'object' ? (
                                <pre className="text-sm text-gray-600 whitespace-pre-wrap break-words pr-8">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                <span className="text-base text-gray-800 pr-8">
                                  {safeString(value)}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  typeof value === 'object'
                                    ? JSON.stringify(value, null, 2)
                                    : safeString(value),
                                  `metadata-${key}`
                                )
                              }
                              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                            >
                              {copiedField === `metadata-${key}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Monitor className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      No technical information available
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Details Tab */}
            <TabsContent
              value="details"
              className="h-full overflow-y-auto p-4 lg:p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Hash className="h-5 w-5 text-gray-600" />
                      Response Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Response ID
                      </label>
                      <div className="relative">
                        <div className="font-mono text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border break-all pr-10">
                          {response.id}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(response.id, 'responseId')
                          }
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          {copiedField === 'responseId' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Form ID
                      </label>
                      <div className="relative">
                        <div className="font-mono text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border break-all pr-10">
                          {response.formId}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(response.formId, 'formId')
                          }
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          {copiedField === 'formId' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Submission Date
                      </label>
                      <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border">
                        {formatDate(response.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      Form Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Form Name
                      </label>
                      <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border break-words">
                        {response.form?.name || 'Unknown Form'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Total Questions
                      </label>
                      <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border">
                        {response.form?.nodes?.length ||
                          Object.keys(response.responses).filter(
                            (key) => key !== 'enhancedMessage'
                          ).length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
