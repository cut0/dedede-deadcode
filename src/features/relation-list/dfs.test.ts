import { expect, test } from 'vitest';

import { RelationNode } from '../../foundations/types';

import { dfs } from './dfs';

test(dfs.name, () => {
  const entryPoint = 'A';
  const nodeList = [
    {
      parentPath: 'A',
      childPath: 'B',
    },
    {
      parentPath: 'A',
      childPath: 'C',
    },
    {
      parentPath: 'A',
      childPath: 'D',
    },
    {
      parentPath: 'B',
      childPath: 'E',
    },
    {
      parentPath: 'E',
      childPath: 'F',
    },
    {
      parentPath: 'D',
      childPath: 'G',
    },
    {
      parentPath: 'a',
      childPath: 'b',
    },
    {
      parentPath: 'a',
      childPath: 'c',
    },
    {
      parentPath: 'a',
      childPath: 'd',
    },
    {
      parentPath: 'b',
      childPath: 'e',
    },
    {
      parentPath: 'e',
      childPath: 'f',
    },
    {
      parentPath: 'd',
      childPath: 'g',
    },
  ] as RelationNode[];
  expect(dfs(entryPoint, nodeList)).toEqual(['A', 'B', 'E', 'F', 'C', 'D', 'G']);
});
