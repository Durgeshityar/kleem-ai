'use client'

import type React from 'react'
import type { Node, Edge } from 'reactflow'
import { UnifiedFormResponse } from '../unified-form-response'

interface FormPreviewProps {
  nodes: Node[]
  edges: Edge[]
  startNode: Node | null
  customStyles?: {
    primaryColor?: string
    showBranding?: boolean
    formTitle?: string
    hideStartOver?: boolean
    restrictFeatures?: boolean
    useAI?: boolean
  }
}

export default function FormPreview({
  nodes,
  edges,
  startNode,
  customStyles,
}: FormPreviewProps) {
  // Create default settings for preview mode
  const defaultSettings = {
    primaryColor: customStyles?.primaryColor || '#3b82f6',
    showBranding: customStyles?.showBranding ?? true,
  }

  return (
    <UnifiedFormResponse
      nodes={nodes}
      edges={edges}
      startNode={startNode}
      settings={defaultSettings}
      mode="preview"
      customStyles={customStyles}
    />
  )
}
