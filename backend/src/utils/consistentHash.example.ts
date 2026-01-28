/**
 * Example usage and testing of ConsistentHashRing
 * Run with: npx ts-node src/utils/consistentHash.example.ts
 */

import { ConsistentHashRing, analyzeDistribution } from './consistentHash';

// Example 1: Basic usage
console.log('=== Example 1: Basic Consistent Hashing ===\n');

const ring = new ConsistentHashRing([
  'cache-node-1',
  'cache-node-2',
  'cache-node-3',
]);
console.log('Ring initialized with 3 nodes:', ring.getInfo());
console.log('');

// Test key distribution
const testKeys = [
  'user:123',
  'user:456',
  'user:789',
  'link:abc123',
  'link:def456',
];
console.log('Key assignments:');
testKeys.forEach((key) => {
  const node = ring.getNode(key);
  console.log(`  ${key} -> ${node}`);
});
console.log('');

// Example 2: Load distribution analysis
console.log('=== Example 2: Load Distribution ===\n');

const manyKeys = Array.from({ length: 1000 }, (_, i) => `key-${i}`);
const distribution = analyzeDistribution(ring, manyKeys);

console.log('Distribution of 1000 keys:');
Object.entries(distribution).forEach(([node, count]) => {
  const percentage = ((count / manyKeys.length) * 100).toFixed(1);
  console.log(`  ${node}: ${count} keys (${percentage}%)`);
});
console.log('');

// Example 3: Dynamic node addition
console.log('=== Example 3: Adding a Node ===\n');

ring.addNode('cache-node-4');
console.log('Added cache-node-4. Ring info:', ring.getInfo());

// Some keys will now map to the new node
console.log('Key reassignments after adding node:');
testKeys.forEach((key) => {
  const node = ring.getNode(key);
  console.log(`  ${key} -> ${node}`);
});
console.log('');

// Example 4: Dynamic node removal
console.log('=== Example 4: Removing a Node ===\n');

ring.removeNode('cache-node-2');
console.log('Removed cache-node-2. Ring info:', ring.getInfo());

console.log('Key reassignments after removing node:');
testKeys.forEach((key) => {
  const node = ring.getNode(key);
  console.log(`  ${key} -> ${node}`);
});
console.log('');

// Example 5: Minimal key collision on changes
console.log('=== Example 5: Consistency Check ===\n');

const originalRing = new ConsistentHashRing(['node-1', 'node-2']);
const testSet = Array.from({ length: 100 }, (_, i) => `cache-key-${i}`);
const originalMapping = new Map(
  testSet.map((key) => [key, originalRing.getNode(key)]),
);

// Add a new node
originalRing.addNode('node-3');

let movedKeys = 0;
testSet.forEach((key) => {
  const oldNode = originalMapping.get(key);
  const newNode = originalRing.getNode(key);
  if (oldNode !== newNode) {
    movedKeys++;
  }
});

const movePercentage = ((movedKeys / testSet.length) * 100).toFixed(1);
console.log(
  `Keys redistributed when adding 1 node to 2 nodes: ${movedKeys}/${testSet.length} (${movePercentage}%)`,
);
console.log('Expected: ~33% (1/3 of keys move to the new node)');
console.log('');

console.log('✅ Consistent Hashing Examples Complete');
