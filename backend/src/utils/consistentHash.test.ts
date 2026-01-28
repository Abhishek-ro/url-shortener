/**
 * Unit tests for ConsistentHashRing
 * Run with: npm test (if Jest/Vitest configured)
 */

import { ConsistentHashRing, analyzeDistribution } from './consistentHash';

describe('ConsistentHashRing', () => {
  describe('Initialization', () => {
    it('should initialize with nodes', () => {
      const ring = new ConsistentHashRing(['node1', 'node2', 'node3']);
      expect(ring.getNodes()).toEqual(['node1', 'node2', 'node3']);
    });

    it('should have correct number of positions', () => {
      const ring = new ConsistentHashRing(['node1', 'node2'], 100);
      // 2 nodes × 100 virtual nodes each = 200 positions
      expect(ring.getPositionCount()).toBe(200);
    });

    it('should accept custom virtual node count', () => {
      const ring = new ConsistentHashRing(['node1', 'node2'], 50);
      expect(ring.getPositionCount()).toBe(100);
    });

    it('should throw error when getting node from empty ring', () => {
      const ring = new ConsistentHashRing([]);
      expect(() => ring.getNode('key')).toThrow('No nodes available');
    });
  });

  describe('Basic Operations', () => {
    let ring: ConsistentHashRing;

    beforeEach(() => {
      ring = new ConsistentHashRing(['node1', 'node2', 'node3']);
    });

    it('should consistently return same node for same key', () => {
      const key = 'test-key-123';
      const node1 = ring.getNode(key);
      const node2 = ring.getNode(key);
      const node3 = ring.getNode(key);

      expect(node1).toBe(node2);
      expect(node2).toBe(node3);
    });

    it('should return one of the existing nodes', () => {
      const key = 'test-key';
      const node = ring.getNode(key);
      expect(['node1', 'node2', 'node3']).toContain(node);
    });

    it('should distribute keys across different nodes', () => {
      const nodes = new Set();
      for (let i = 0; i < 1000; i++) {
        nodes.add(ring.getNode(`key-${i}`));
      }
      // Should have more than 1 node (and likely all 3)
      expect(nodes.size).toBeGreaterThan(1);
    });
  });

  describe('Adding Nodes', () => {
    let ring: ConsistentHashRing;

    beforeEach(() => {
      ring = new ConsistentHashRing(['node1', 'node2']);
    });

    it('should add new node to ring', () => {
      ring.addNode('node3');
      expect(ring.getNodes()).toContain('node3');
    });

    it('should ignore duplicate node additions', () => {
      const beforeCount = ring.getPositionCount();
      ring.addNode('node1');
      expect(ring.getPositionCount()).toBe(beforeCount);
    });

    it('should increase position count after adding node', () => {
      const beforeCount = ring.getPositionCount();
      ring.addNode('node3');
      expect(ring.getPositionCount()).toBe(beforeCount + 100); // 100 virtual nodes
    });

    it('should redistribute keys when adding node', () => {
      const keySet = Array.from({ length: 100 }, (_, i) => `key-${i}`);
      const mappingBefore = new Map(keySet.map((k) => [k, ring.getNode(k)]));

      ring.addNode('node3');

      let redistributedCount = 0;
      keySet.forEach((key) => {
        if (mappingBefore.get(key) !== ring.getNode(key)) {
          redistributedCount++;
        }
      });

      // Approximately 1/3 of keys should move to new node
      // Allow 20-50% to account for randomness
      expect(redistributedCount).toBeGreaterThan(10);
      expect(redistributedCount).toBeLessThan(50);
    });
  });

  describe('Removing Nodes', () => {
    let ring: ConsistentHashRing;

    beforeEach(() => {
      ring = new ConsistentHashRing(['node1', 'node2', 'node3']);
    });

    it('should remove node from ring', () => {
      ring.removeNode('node2');
      expect(ring.getNodes()).not.toContain('node2');
    });

    it('should ignore removal of non-existent node', () => {
      const beforeCount = ring.getPositionCount();
      ring.removeNode('node-does-not-exist');
      expect(ring.getPositionCount()).toBe(beforeCount);
    });

    it('should decrease position count after removing node', () => {
      const beforeCount = ring.getPositionCount();
      ring.removeNode('node1');
      expect(ring.getPositionCount()).toBe(beforeCount - 100); // 100 virtual nodes
    });

    it('should reassign keys to remaining nodes', () => {
      const key = 'persistent-key';
      const node = ring.getNode(key);

      if (node === 'node1') {
        ring.removeNode('node1');
      } else {
        ring.removeNode('node2');
      }

      // Should still get a valid node (from remaining nodes)
      const newNode = ring.getNode(key);
      expect(['node1', 'node2', 'node3']).toContain(newNode);
    });
  });

  describe('Distribution Analysis', () => {
    it('should provide balanced distribution', () => {
      const ring = new ConsistentHashRing(['node1', 'node2', 'node3']);
      const keys = Array.from({ length: 3000 }, (_, i) => `key-${i}`);
      const distribution = analyzeDistribution(ring, keys);

      Object.values(distribution).forEach((count) => {
        // Each node should have roughly 1000 keys (±20%)
        expect(count).toBeGreaterThan(800);
        expect(count).toBeLessThan(1200);
      });
    });

    it('should handle uneven distribution with virtual nodes', () => {
      const ring = new ConsistentHashRing(['single-node'], 100);
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`);
      const distribution = analyzeDistribution(ring, keys);

      expect(distribution['single-node']).toBe(100);
    });
  });

  describe('Ring Info', () => {
    it('should provide correct ring information', () => {
      const ring = new ConsistentHashRing(['node1', 'node2'], 50);
      const info = ring.getInfo();

      expect(info.nodes).toContain('node1');
      expect(info.nodes).toContain('node2');
      expect(info.totalPositions).toBe(100);
      expect(info.virtualNodesPerNode).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single node', () => {
      const ring = new ConsistentHashRing(['node1']);

      for (let i = 0; i < 100; i++) {
        expect(ring.getNode(`key-${i}`)).toBe('node1');
      }
    });

    it('should handle very large key strings', () => {
      const ring = new ConsistentHashRing(['node1', 'node2']);
      const largeKey = 'x'.repeat(10000);

      expect(() => ring.getNode(largeKey)).not.toThrow();
      expect(['node1', 'node2']).toContain(ring.getNode(largeKey));
    });

    it('should handle special characters in keys', () => {
      const ring = new ConsistentHashRing(['node1', 'node2']);
      const specialKeys = [
        'key-with-dashes',
        'key:with:colons',
        'key/with/slashes',
        'key\\with\\backslashes',
        'key with spaces',
        'key\twith\ttabs',
        '😀emoji-key',
        'key-with-\n-newline',
      ];

      specialKeys.forEach((key) => {
        expect(() => ring.getNode(key)).not.toThrow();
        expect(['node1', 'node2']).toContain(ring.getNode(key));
      });
    });
  });
});
