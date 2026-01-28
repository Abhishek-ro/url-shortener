import crypto from 'crypto';

/**
 * Node position in the hash ring
 * Stores both the hash value and the node identifier
 */
interface NodePosition {
  hash: number;
  node: string;
}

/**
 * ConsistentHashRing - Implements consistent hashing with virtual nodes
 *
 * Features:
 * - Distributes keys across N real nodes
 * - Uses virtual nodes for better load distribution (default: 100 per node)
 * - Binary search for O(log N) lookup time
 * - Supports dynamic node addition/removal
 * - Uses MD5 hash truncated to 32 bits (0 to 2^32-1 space)
 *
 * @example
 * const ring = new ConsistentHashRing(['node1', 'node2', 'node3']);
 * const assignedNode = ring.getNode('user-123');
 * console.log(assignedNode); // 'node1', 'node2', or 'node3'
 */
export class ConsistentHashRing {
  private positions: NodePosition[] = [];
  private nodes: Set<string> = new Set();
  private virtualNodes: number;

  /**
   * Initialize the hash ring with initial nodes
   * @param nodes - Array of node identifiers
   * @param virtualNodes - Number of virtual nodes per real node (default: 100)
   */
  constructor(nodes: string[], virtualNodes: number = 100) {
    this.virtualNodes = virtualNodes;

    // Add all initial nodes to the ring
    for (const node of nodes) {
      this.addNode(node);
    }
  }

  /**
   * Hash a key to a 32-bit integer using MD5
   * @param key - The key to hash
   * @returns Hash value in range [0, 2^32-1]
   */
  private hashKey(key: string): number {
    // Create MD5 hash of the key
    const hash = crypto.createHash('md5').update(key).digest('hex');
    // Take first 8 hex characters (32 bits) and convert to decimal
    // This gives us a uniform distribution across 0 to 2^32-1
    return parseInt(hash.substring(0, 8), 16);
  }

  /**
   * Add a new node to the hash ring
   * Creates virtual nodes for better distribution
   * @param node - Node identifier to add
   */
  addNode(node: string): void {
    // Skip if node already exists
    if (this.nodes.has(node)) {
      return;
    }

    // Track the real node
    this.nodes.add(node);

    // Create virtual nodes for this real node
    // Virtual nodes help distribute the load more evenly
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualKey = `${node}:${i}`;
      const hash = this.hashKey(virtualKey);
      this.positions.push({ hash, node });
    }

    // Keep positions sorted by hash for binary search
    this.positions.sort((a, b) => a.hash - b.hash);
  }

  /**
   * Remove a node from the hash ring
   * Also removes all virtual nodes associated with it
   * @param node - Node identifier to remove
   */
  removeNode(node: string): void {
    // Skip if node doesn't exist
    if (!this.nodes.has(node)) {
      return;
    }

    // Remove the real node tracking
    this.nodes.delete(node);

    // Remove all virtual nodes for this node
    this.positions = this.positions.filter(
      (position) => position.node !== node,
    );
  }

  /**
   * Find which node a key belongs to using binary search
   * @param key - The key to look up
   * @returns The node identifier responsible for this key
   * @throws Error if no nodes are available in the ring
   */
  getNode(key: string): string {
    // Check if ring has any nodes
    if (this.positions.length === 0) {
      throw new Error('No nodes available in the hash ring');
    }

    // Hash the key
    const hash = this.hashKey(key);

    // Binary search to find the first position with hash >= key's hash
    let left = 0;
    let right = this.positions.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.positions[mid].hash < hash) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // If no position found with hash >= key's hash, wrap around to first position
    // This completes the ring topology
    const index = left % this.positions.length;
    return this.positions[index].node;
  }

  /**
   * Get all active real nodes in the ring
   * @returns Array of node identifiers
   */
  getNodes(): string[] {
    return Array.from(this.nodes);
  }

  /**
   * Get the total number of positions (real + virtual) in the ring
   * Useful for debugging and monitoring
   * @returns Number of positions in the ring
   */
  getPositionCount(): number {
    return this.positions.length;
  }

  /**
   * Get detailed ring information for debugging
   * @returns Object containing nodes and position count
   */
  getInfo(): {
    nodes: string[];
    totalPositions: number;
    virtualNodesPerNode: number;
  } {
    return {
      nodes: this.getNodes(),
      totalPositions: this.getPositionCount(),
      virtualNodesPerNode: this.virtualNodes,
    };
  }
}

/**
 * Helper function to distribute a batch of keys across the ring
 * Useful for analyzing load distribution
 * @param ring - The ConsistentHashRing instance
 * @param keys - Array of keys to distribute
 * @returns Object showing key distribution per node
 */
export function analyzeDistribution(
  ring: ConsistentHashRing,
  keys: string[],
): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const key of keys) {
    const node = ring.getNode(key);
    distribution[node] = (distribution[node] || 0) + 1;
  }

  return distribution;
}
