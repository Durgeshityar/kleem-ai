'use client'

import { memo, useState } from 'react'
import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FormEdgeData } from '@/types/form'

const ConditionalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<FormEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const [isHovered, setIsHovered] = useState(false)

  // Determine color based on conditions
  const getEdgeColor = () => {
    if (!data?.conditions || data.conditions.length === 0) return '#94a3b8' // Default gray
    if (data.logicalOperator === 'or') return '#3b82f6' // Blue for OR
    return '#22c55e' // Green for AND
  }

  // Get condition display text
  const getConditionText = () => {
    if (!data?.conditions || data.conditions.length === 0) return 'Always'
    if (data.conditions.length === 1) {
      const cond = data.conditions[0]
      return `${cond.sourceVariable} ${cond.operator}`
    }
    return `${
      data.conditions.length
    } conditions (${data.logicalOperator.toUpperCase()})`
  }

  const edgeColor = getEdgeColor()

  return (
    <>
      <path
        id={id}
        className={cn(
          'react-flow__edge-path transition-all',
          isHovered && 'stroke-[3px]'
        )}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: edgeColor,
          strokeWidth: isHovered ? 3 : 2,
          cursor: 'pointer',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            cursor: 'pointer',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Badge
            variant="outline"
            className={cn(
              'text-xs whitespace-nowrap shadow-sm border',
              isHovered && 'bg-white'
            )}
            style={{ borderColor: edgeColor, color: edgeColor }}
          >
            {getConditionText()}
          </Badge>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(ConditionalEdge)
