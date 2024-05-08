import { RelationNode } from '../../foundations/types';

export const dfs = (entryPoint: string, nodeList: RelationNode[]) => {
  const graph: Record<string, string[]> = {};
  const visited = new Set<string>();

  nodeList.forEach(({ parentPath, childPath }) => {
    if (graph[parentPath] == null) {
      graph[parentPath] = [];
    }
    graph[parentPath]?.push(childPath);
  });

  const travarse = (path: string) => {
    visited.add(path);

    if (graph[path]) {
      for (const child of graph[path] ?? []) {
        if (!visited.has(child)) {
          travarse(child);
        }
      }
    }
  };

  travarse(entryPoint);

  return [...visited];
};
