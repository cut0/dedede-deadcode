export type ImportType = 'import' | 'require' | 'dynamicImport';

export type RelationNode = {
  parentPath: string;
  childPath: string;
  context: {
    importType: ImportType;
    targetType: 'file' | 'external';
    isSupported: boolean;
  };
};
