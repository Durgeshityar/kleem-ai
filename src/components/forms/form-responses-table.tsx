'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Eye, ArrowUpDown, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormResponseDetail } from './form-response-detail'
import { deleteFormResponse, getAllFormResponses } from '@/actions/form'
import { enhanceFormResponseWithAI } from '@/utils/openai-utils'
import { toast } from 'sonner'

interface FormResponse {
  id: string
  formId: string
  createdAt: Date
  responses: Record<string, unknown>
  metadata?: Record<string, unknown>
  form?: {
    id: string
    name: string
    nodes?: Array<{
      id: string
      data: {
        question: string
        type: string
        variableName: string
        required: boolean
        helpText?: string
        options?: string[]
      }
    }>
  }
}

interface FormResponsesTableProps {
  searchParams: {
    query?: string
    formId?: string
    page?: string
    sort?: string
    direction?: string
  }
}

export function FormResponsesTable({ searchParams }: FormResponsesTableProps) {
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  )
  const [page, setPage] = useState(Number(searchParams.page) || 1)
  const [sortField, setSortField] = useState(searchParams.sort || 'createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (searchParams.direction as 'asc' | 'desc') || 'desc'
  )

  const itemsPerPage = 10

  const loadResponses = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch real responses from the database
      const realResponses = await getAllFormResponses()

      // Transform the data to match our interface
      const transformedResponses: FormResponse[] = realResponses.map(
        (response) => ({
          id: response.id,
          formId: response.formId,
          createdAt: response.createdAt,
          responses: response.responses as Record<string, unknown>,
          metadata: response.metadata as Record<string, unknown> | undefined,
          form: response.form
            ? {
                id: response.form.id,
                name: response.form.name,
                nodes: response.form.nodes?.map((node) => ({
                  id: node.id,
                  data: node.data as {
                    question: string
                    type: string
                    variableName: string
                    required: boolean
                    helpText?: string
                    options?: string[]
                  },
                })),
              }
            : undefined,
        })
      )

      // Filter responses based on search query
      let filteredResponses = transformedResponses
      if (searchParams.query) {
        const query = searchParams.query.toLowerCase()
        filteredResponses = transformedResponses.filter((response) => {
          const searchableFields = [
            response.responses.name,
            response.responses.email,
            response.responses.company,
            response.responses.message,
            response.form?.name,
          ].filter(Boolean)

          return searchableFields.some((field) =>
            String(field).toLowerCase().includes(query)
          )
        })
      }

      // Filter by form ID if specified
      if (searchParams.formId) {
        filteredResponses = filteredResponses.filter(
          (response) => response.formId === searchParams.formId
        )
      }

      setResponses(filteredResponses)
    } catch (error) {
      console.error('Error loading responses:', error)
      toast.error('Failed to load responses')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    loadResponses()
    // Update sort states when URL parameters change
    setSortField(searchParams.sort || 'createdAt')
    setSortDirection((searchParams.direction as 'asc' | 'desc') || 'desc')
  }, [searchParams, loadResponses])

  // Sort responses
  const sortedResponses = [...responses].sort((a, b) => {
    if (sortField === 'createdAt') {
      return sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    if (sortField === 'name') {
      const aName = String(a.responses.name || '')
      const bName = String(b.responses.name || '')
      return sortDirection === 'asc'
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName)
    }

    return 0
  })

  // Paginate responses
  const paginatedResponses = sortedResponses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const totalPages = Math.ceil(sortedResponses.length / itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async (responseId: string, formId: string) => {
    try {
      await deleteFormResponse(formId, responseId)
      toast.success('Response deleted successfully')
      loadResponses()
    } catch (error) {
      console.error('Error deleting response:', error)
      toast.error('Failed to delete response')
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const enhanceResponseWithAI = async (response: FormResponse) => {
    try {
      if (
        response.responses.message &&
        typeof response.responses.message === 'string'
      ) {
        const enhancedMessage = await enhanceFormResponseWithAI(
          response.responses.message,
          {
            respondentName: String(response.responses.name || 'a user'),
            formName: response.form?.name,
            additionalContext: `Rating: ${
              response.responses.rating || 'Not provided'
            }`,
          }
        )

        return {
          ...response,
          responses: {
            ...response.responses,
            enhancedMessage,
          },
        }
      }
      return response
    } catch (error) {
      console.error('Error enhancing response with AI:', error)
      return response
    }
  }

  if (loading) {
    return <div>Loading responses...</div>
  }

  // Group responses by form for summary when no specific form is selected
  const responsesByForm = !searchParams.formId
    ? responses.reduce((acc, response) => {
        const formName = response.form?.name || 'Unknown Form'
        if (!acc[formName]) {
          acc[formName] = []
        }
        acc[formName].push(response)
        return acc
      }, {} as Record<string, FormResponse[]>)
    : null

  return (
    <>
      {/* Summary Section - only show when viewing all forms */}
      {responsesByForm && Object.keys(responsesByForm).length > 1 && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            Response Summary by Form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(responsesByForm).map(
              ([formName, formResponses]) => (
                <div
                  key={formName}
                  className="bg-background p-3 rounded-md border"
                >
                  <h4 className="font-medium truncate" title={formName}>
                    {formName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formResponses.length} response
                    {formResponses.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] lg:w-[100px]">ID</TableHead>
              <TableHead className="hidden sm:table-cell">Form</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Respondent
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('createdAt')}
                  className={`flex items-center p-0 h-auto font-medium ${
                    sortField === 'createdAt' ? 'text-primary' : ''
                  }`}
                >
                  Date
                  <ArrowUpDown
                    className={`ml-2 h-4 w-4 ${
                      sortField === 'createdAt' ? 'text-primary' : ''
                    }`}
                  />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResponses.length > 0 ? (
              paginatedResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">
                    {response.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-medium">
                    {response.form?.name || 'Unknown Form'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {String(response.responses.name || 'Anonymous')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {String(response.responses.email || 'No email')}
                        <div className="sm:hidden mt-1">
                          {response.form?.name || 'Unknown Form'} •{' '}
                          {formatDate(response.createdAt)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(response.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const enhanced = await enhanceResponseWithAI(
                                response
                              )
                              setSelectedResponse(enhanced)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">View details</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px] mx-4 sm:mx-0">
                          <DialogHeader>
                            <DialogTitle>Form Response Details</DialogTitle>
                            <DialogDescription>
                              Submitted on {formatDate(response.createdAt)}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedResponse && (
                            <FormResponseDetail response={selectedResponse} />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(response.id, response.formId)
                        }
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <span className="sr-only">Delete response</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No responses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent className="flex-wrap justify-center gap-2">
            <PaginationItem className="hidden sm:inline-block">
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* Mobile Previous Button */}
            <PaginationItem className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
                disabled={page <= 1}
                className="h-8"
              >
                Previous
              </Button>
            </PaginationItem>

            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(i + 1)
                    }}
                    isActive={page === i + 1}
                    className="h-8 w-8"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </div>

            {/* Mobile Next Button */}
            <PaginationItem className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) setPage(page + 1)
                }}
                disabled={page >= totalPages}
                className="h-8"
              >
                Next
              </Button>
            </PaginationItem>

            <PaginationItem className="hidden sm:inline-block">
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) setPage(page + 1)
                }}
                className={
                  page >= totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}
