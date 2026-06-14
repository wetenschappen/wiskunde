import type { TopologyNode } from '../types/circuit';

// Generate all unique Series-Parallel topologies for n resistors

function canonicalize(node: TopologyNode): string {
    if (node.type === 'resistor') return 'R';
    
    // Canonicalize children
    const childrenStrs = node.children!.map(canonicalize);
    // Sort them so P(R, S(R,R)) is the same as P(S(R,R), R)
    childrenStrs.sort();
    
    return `${node.type.charAt(0)}(${childrenStrs.join(',')})`;
}

// Deep clone a topology to avoid referencing the same objects
function cloneTopology(node: TopologyNode): TopologyNode {
    if (node.type === 'resistor') {
        return { ...node };
    }
    return {
        ...node,
        children: node.children!.map(cloneTopology)
    };
}

// Generate all trees with exactly n leaves (resistors)
export function generateAllTopologies(n: number): TopologyNode[] {
    if (n === 1) {
        return [{ id: 'root', type: 'resistor', resistorId: 'R?' }];
    }

    // Every SP graph of size n > 1 is formed by taking two SP graphs of size k and n-k,
    // and combining them in either Series or Parallel.
    // However, Series of Series should be flattened into a single Series node,
    // and Parallel of Parallel should be flattened.
    // To handle this easily, we can just combine any number of sub-graphs.
    // A partition of n is a way to write n as a sum of integers.
    // For each partition of n, we can create a Series or Parallel node with those sizes.
    
    // To generate all topologies of size N:
    // We already need the topologies of size < N.
    // We will build them bottom-up.
    
    // So we need a cache of all topologies up to n.
    return generateUpTo(n)[n];
}

const cache: Record<number, TopologyNode[]> = {};

function generateUpTo(n: number): Record<number, TopologyNode[]> {
    if (cache[n]) return cache;

    cache[1] = [{ id: 'root', type: 'resistor', resistorId: 'R?' }];

    for (let size = 2; size <= n; size++) {
        const currentLevel: TopologyNode[] = [];
        const seen = new Set<string>();

        const addIfUnique = (node: TopologyNode) => {
            const can = canonicalize(node);
            if (!seen.has(can)) {
                seen.add(can);
                currentLevel.push(cloneTopology(node));
            }
        };

        // We can form a graph of size `size` by partitioning `size` into k parts (k >= 2).
        // Then taking one graph from each part size.
        // Actually, to avoid generating Series(Series(A,B), C) and getting duplicates,
        // we can just consider partitioning `size` into integers p1, p2, ... pk (sum = size).
        // For a Series root, none of the children can be Series (they must be Resistor or Parallel).
        // For a Parallel root, none of the children can be Parallel (they must be Resistor or Series).

        const partitions = getPartitions(size);
        for (const part of partitions) {
            if (part.length < 2) continue; // we need at least 2 parts

            // For this partition, e.g., [2, 1], we need all combinations of valid children.
            // For a Series node, children must NOT be Series.
            const validChildrenForSeries = part.map(p => 
                cache[p].filter(c => c.type !== 'series')
            );
            
            for (const combo of cartesianProduct(validChildrenForSeries)) {
                addIfUnique({
                    id: 'root',
                    type: 'series',
                    children: combo.map(c => cloneTopology(c))
                });
            }

            // For a Parallel node, children must NOT be Parallel.
            const validChildrenForParallel = part.map(p => 
                cache[p].filter(c => c.type !== 'parallel')
            );
            
            for (const combo of cartesianProduct(validChildrenForParallel)) {
                addIfUnique({
                    id: 'root',
                    type: 'parallel',
                    children: combo.map(c => cloneTopology(c))
                });
            }
        }

        cache[size] = currentLevel;
    }

    return cache;
}

// Generate integer partitions of n
function getPartitions(n: number): number[][] {
    const result: number[][] = [];
    function recurse(target: number, maxVal: number, current: number[]) {
        if (target === 0) {
            result.push([...current]);
            return;
        }
        for (let i = Math.min(target, maxVal); i >= 1; i--) {
            current.push(i);
            recurse(target - i, i, current);
            current.pop();
        }
    }
    recurse(n, n, []);
    return result;
}

// Cartesian product of arrays
function cartesianProduct<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>((a, b) => 
        a.flatMap(d => b.map(e => [...d, e])), 
    [[]]);
}

// Assign unique IDs and sequential R1, R2... to resistors in a topology
export function assignLabels(node: TopologyNode, resistorCounter = { count: 1 }, nodeCounter = { count: 1 }): TopologyNode {
    node.id = `node-${nodeCounter.count++}`;
    if (node.type === 'resistor') {
        node.resistorId = `R${resistorCounter.count++}`;
    } else if (node.children) {
        node.children.forEach(c => assignLabels(c, resistorCounter, nodeCounter));
    }
    return node;
}
