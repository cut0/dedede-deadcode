import * as path from 'path';

import { Project, SyntaxKind } from 'ts-morph';

import { SUPPORT_EXTENSIONS } from '../../foundations/constants';
import { ImportType, RelationNode } from '../../foundations/types';
import { findFileWithExtension, hasExtension, isExternalPath, isSupportExtension } from '../fs/utils';

const insertRelationNode = (
  baseFilePath: string,
  childFile: string,
  {
    relationList,
    importType,
  }: {
    relationList: RelationNode[];
    importType: ImportType;
  },
) => {
  if (isExternalPath(childFile)) {
    relationList.push({
      parentPath: baseFilePath,
      childPath: childFile,
      context: {
        importType: importType,
        targetType: 'external',
        isSupported: true,
      },
    });
    return;
  }
  if (hasExtension(childFile)) {
    relationList.push({
      parentPath: baseFilePath,
      childPath: path.join(path.dirname(baseFilePath), childFile),
      context: {
        importType: importType,
        targetType: 'file',
        isSupported: isSupportExtension(childFile, SUPPORT_EXTENSIONS),
      },
    });
    return;
  }
  findFileWithExtension(path.join(path.dirname(baseFilePath), childFile), SUPPORT_EXTENSIONS).forEach((childPath) => {
    relationList.push({
      parentPath: baseFilePath,
      childPath,
      context: {
        importType: importType,
        targetType: 'file',
        isSupported: true,
      },
    });
  });
};

const project = new Project();

type Option = {
  baseFilePath: string;
  targetImportType: ('import' | 'require' | 'dynamicImport')[];
};

export const getRelationList = ({ baseFilePath, targetImportType }: Option): RelationNode[] => {
  const sourceFile = project.addSourceFileAtPath(baseFilePath);

  const relationList: RelationNode[] = [];

  /**
   * NOTE: Find children by import statements.
   */
  if (targetImportType.includes('import')) {
    sourceFile
      .getImportDeclarations()
      .map((importDeclaration) => {
        return importDeclaration.getModuleSpecifierValue();
      })
      .forEach((importedChild) => {
        insertRelationNode(baseFilePath, importedChild, {
          relationList: relationList,
          importType: 'import',
        });
      });
  }

  /**
   * Note: Find children by export exportDeclaration
   */
  sourceFile
    .getExportDeclarations()
    .map((exportDeclaration) => {
      return exportDeclaration.getModuleSpecifierValue();
    })
    .forEach((importedChild) => {
      if (importedChild === undefined) {
        return;
      }
      insertRelationNode(baseFilePath, importedChild, {
        relationList: relationList,
        importType: 'import',
      });
    });

  /**
   * NOTE: Find children by dynamic import.
   */
  if (targetImportType.includes('dynamicImport')) {
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((callExpr) => {
      const expression = callExpr.getExpression();
      if (expression.getKind() === SyntaxKind.ImportKeyword) {
        const [requireArg] = callExpr.getArguments();
        if (requireArg?.getKind() === SyntaxKind.StringLiteral) {
          const importedChild = requireArg.getText().replace(/['"]/g, '');
          insertRelationNode(baseFilePath, importedChild, {
            relationList: relationList,
            importType: 'dynamicImport',
          });
        }
      }
    });
  }

  /**
   * NOTE: Find children by require.
   */
  if (targetImportType.includes('require')) {
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((callExpr) => {
      const expression = callExpr.getExpression();
      if (expression.getKind() === SyntaxKind.Identifier && expression.getText() === 'require') {
        const [requireArg] = callExpr.getArguments();
        if (requireArg?.getKind() === SyntaxKind.StringLiteral) {
          const requiredChild = requireArg.getText().replace(/['"]/g, '');
          insertRelationNode(baseFilePath, requiredChild, {
            relationList: relationList,
            importType: 'require',
          });
        }
      }
    });
  }

  return relationList;
};
