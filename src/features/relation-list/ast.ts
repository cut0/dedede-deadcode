import * as path from 'path';

import { Project, SyntaxKind } from 'ts-morph';

import { SUPPORT_EXTENSIONS } from '../../foundations/constants';
import { ImportType, RelationNode } from '../../foundations/types';
import { findFileWithExtension, hasExtension, isExternalPath, isSupportExtension, replaceAliasMap } from '../fs/utils';

const insertRelationNode = (
  baseFilePath: string,
  childRelativeFilePath: string,
  {
    relationList,
    importType,
  }: {
    relationList: RelationNode[];
    importType: ImportType;
  },
) => {
  if (isExternalPath(childRelativeFilePath)) {
    relationList.push({
      parentPath: baseFilePath,
      childPath: childRelativeFilePath,
      context: {
        importType: importType,
        targetType: 'external',
        isSupported: true,
      },
    });
    return;
  }
  if (hasExtension(childRelativeFilePath)) {
    relationList.push({
      parentPath: baseFilePath,
      childPath: path.join(path.dirname(baseFilePath), childRelativeFilePath),
      context: {
        importType: importType,
        targetType: 'file',
        isSupported: isSupportExtension(childRelativeFilePath, SUPPORT_EXTENSIONS),
      },
    });
    return;
  }
  findFileWithExtension(path.join(path.dirname(baseFilePath), childRelativeFilePath), SUPPORT_EXTENSIONS).forEach(
    (childPath) => {
      relationList.push({
        parentPath: baseFilePath,
        childPath,
        context: {
          importType: importType,
          targetType: 'file',
          isSupported: true,
        },
      });
    },
  );
};

const project = new Project();

type Option = {
  baseFilePath: string;
  targetImportType: ('import' | 'require' | 'dynamicImport')[];
  aliasResolver: Record<string, string>;
};

export const getRelationList = ({ baseFilePath, targetImportType, aliasResolver }: Option): RelationNode[] => {
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
      const childRelativeFilePath = replaceAliasMap(importedChild, aliasResolver);
      insertRelationNode(baseFilePath, childRelativeFilePath, {
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
          const childRelativeFilePath = replaceAliasMap(importedChild, aliasResolver);
          insertRelationNode(baseFilePath, childRelativeFilePath, {
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
          const childRelativeFilePath = replaceAliasMap(requiredChild, aliasResolver);
          insertRelationNode(baseFilePath, childRelativeFilePath, {
            relationList: relationList,
            importType: 'require',
          });
        }
      }
    });
  }

  return relationList;
};
