import { Edge, Node } from 'reactflow'

/**
 * Detects if adding a new edge would create a cycle in the graph
 * @param nodes All nodes in the graph
 * @param edges All existing edges in the graph
 * @param newEdge The new edge to be added
 * @returns true if adding the edge would create a cycle, false otherwise
 */
export function wouldCreateCycle(
  nodes: Node[],
  edges: Edge[],
  newEdge: { source: string; target: string }
): boolean {
  // Debug logging
  console.log('Checking cycle for new edge:', newEdge)

  // First, check if the new edge creates an immediate cycle (self-loop)
  if (newEdge.source === newEdge.target) {
    console.log('Self-loop detected')
    return true
  }

  // Create a map of node to its in-degree (number of incoming edges)
  const inDegree = new Map<string, number>()

  // Create adjacency list
  const adjacencyList = new Map<string, Set<string>>()

  // Initialize maps for all nodes
  nodes.forEach((node) => {
    inDegree.set(node.id, 0)
    adjacencyList.set(node.id, new Set())
  })

  // Add all edges including the new edge
  const allEdges = [
    ...edges,
    { source: newEdge.source, target: newEdge.target },
  ]

  // Count in-degrees and build adjacency list
  allEdges.forEach((edge) => {
    const currentInDegree = inDegree.get(edge.target) || 0
    inDegree.set(edge.target, currentInDegree + 1)

    const neighbors = adjacencyList.get(edge.source)
    if (neighbors) {
      neighbors.add(edge.target)
    }
  })

  console.log('Initial in-degrees:', Object.fromEntries(inDegree))
  console.log('Adjacency list:', Object.fromEntries(adjacencyList))

  // Kahn's algorithm for topological sort
  const queue: string[] = []

  // Add all nodes with in-degree 0 to queue
  nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id)
    }
  })

  let visitedCount = 0

  while (queue.length > 0) {
    const current = queue.shift()!
    visitedCount++

    const neighbors = adjacencyList.get(current) || new Set()
    neighbors.forEach((neighbor) => {
      const newInDegree = (inDegree.get(neighbor) || 0) - 1
      inDegree.set(neighbor, newInDegree)

      if (newInDegree === 0) {
        queue.push(neighbor)
      }
    })
  }

  console.log('Visited count:', visitedCount, 'Total nodes:', nodes.length)

  // If we couldn't visit all nodes, there must be a cycle
  const hasCycle = visitedCount !== nodes.length
  console.log('Cycle detected:', hasCycle)

  return hasCycle
}
