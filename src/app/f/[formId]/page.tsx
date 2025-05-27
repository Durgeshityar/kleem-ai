import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Node, Edge } from 'reactflow'
import { FormNodeData, FormEdgeData, FormSettings } from '@/types/form'
import { UnifiedFormResponse } from '@/components/forms/unified-form-response'

interface PublicFormPageProps {
  params: Promise<{ formId: string }>
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { formId } = await params

  console.log('Loading form:', formId)

  const form = await db.form.findUnique({
    where: { id: formId },
    include: {
      nodes: true,
      edges: true,
    },
  })

  if (!form) {
    console.log('Form not found')
    notFound()
  }

  console.log('Form found:', {
    name: form.name,
    nodeCount: form.nodes.length,
    edgeCount: form.edges.length,
  })

  const settings = form.settings as unknown as FormSettings
  console.log('Form settings:', {
    isPublished: settings.isPublished,
    startNodeId: settings.startNodeId,
  })

  if (!settings.isPublished) {
    console.log('Form is not published')
    notFound()
  }

  const nodes: Node<FormNodeData>[] = form.nodes.map((node) => ({
    id: node.id,
    type: (node.type as string) || 'questionNode',
    position: (node.position as unknown as { x: number; y: number }) || {
      x: 0,
      y: 0,
    },
    data: node.data as unknown as FormNodeData,
  }))

  const edges: Edge<FormEdgeData>[] = form.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: (edge.type as string) || 'conditionalEdge',
    data: edge.data as unknown as FormEdgeData,
  }))

  // Find the start node - either from settings or find first node with no incoming edges
  let startNode: Node<FormNodeData> | null = null

  if (settings.startNodeId) {
    const foundNode = nodes.find((node) => node.id === settings.startNodeId)
    if (foundNode) {
      startNode = foundNode
    }
  }

  if (!startNode && nodes.length > 0) {
    // Find a node with no incoming edges
    const targetNodeIds = edges.map((edge) => edge.target)
    const possibleStartNodes = nodes.filter(
      (node) => !targetNodeIds.includes(node.id)
    )

    if (possibleStartNodes.length > 0) {
      startNode = possibleStartNodes[0]
      console.log(
        'Using first node with no incoming edges as start node:',
        startNode.id
      )
    } else {
      // If no node without incoming edges found, use the first node
      startNode = nodes[0]
      console.log('Using first node as start node:', startNode.id)
    }
  }

  console.log(
    'Start node:',
    startNode
      ? {
          id: startNode.id,
          type: startNode.type,
          data: startNode.data,
        }
      : 'Not found'
  )

  return (
    <UnifiedFormResponse
      nodes={nodes}
      edges={edges}
      startNode={startNode}
      formId={formId}
      formName={form.name}
      settings={{
        primaryColor: settings.primaryColor,
        showBranding: settings.showBranding,
      }}
      mode="live"
    />
  )
}
