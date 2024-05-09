import path from 'path';

import { getFilePathList, isMatchFileName, isMatchPattern } from '../features/fs/utils';
import { getRelationList } from '../features/relation-list/ast';
import { dfs } from '../features/relation-list/dfs';

import { RelationNode } from './types';

export type dededeOption = {
  entryPoint: string;
  targetDir: string;
  targetImportType: ('import' | 'require' | 'dynamicImport')[];
  ignoreFiles?: string[];
  ignorePatterns?: string[];
};

export const dedede = async (option: dededeOption) => {
  console.log('Start Analyze!!');
  console.log('EntryPoint:', path.resolve(option.entryPoint));
  console.log('TargetDir:', path.resolve(option.targetDir));
  console.log();

  const { ignoreFiles = [], ignorePatterns = [] } = option;

  const files = getFilePathList(option.targetDir)
    .filter((filePath) => !isMatchFileName(filePath, ignoreFiles))
    .filter((filePath) => !isMatchPattern(filePath, ignorePatterns));

  const relationList: RelationNode[] = [];

  for (const filePath of files) {
    const relationListPerFile = getRelationList({
      baseFilePath: filePath,
      targetImportType: option.targetImportType,
    });

    relationList.push(...relationListPerFile);
  }

  const visitedList = dfs(path.resolve(option.entryPoint), relationList);

  const usedFiles = visitedList.filter((file) => files.includes(file));
  const unusedFiles = files.filter((file) => !visitedList.includes(file));

  /**
   * TODO: add deps files
   */
  return {
    usedFiles,
    unusedFiles,
  };
};
