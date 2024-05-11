# DEDEDE DEADCODE

"DEDEDE DEADCODE" is a tool to detect dead code.

## How To Use

[report.ts](./examples/report.ts) in [Example Dir](./examples/) is a simple example.

```ts
import { dedede } from '../src';

const run = async () => {
  dedede({
    entryPoint: './src/main.tsx',
    targetDir: './src',
    targetImportType: ['import', 'require', 'dynamicImport'],
  }).then(({ usedFiles, unusedFiles }) => {
    console.log('usedFiles:', usedFiles);
    console.log('unusedFiles:', unusedFiles);
  });
};
```

In [Example Dir](./examples/) outputs the following.

```shell
Start Analyze!!
EntryPoint: /path/to/examples/src/main.tsx
TargetDir: /path/to/examples/src

usedFiles: [
  '/path/to/examples/src/main.tsx',
  '/path/to/examples/src/App.tsx',
  '/path/to/examples/src/assets/react.svg',
  '/path/to/examples/src/App.css',
  '/path/to/examples/src/features/used/index.ts',
  '/path/to/examples/src/features/used/Parent.tsx',
  '/path/to/examples/src/features/used/Children.tsx',
  '/path/to/examples/src/foundations/index.ts',
  '/path/to/examples/src/foundations/Used.tsx',
  '/path/to/examples/src/foundations/Unused.tsx',
  '/path/to/examples/src/index.css'
]
unusedFiles: [
  '/path/to/examples/src/features/unused/Children.tsx',
  '/path/to/examples/src/features/unused/Parent.tsx',
  '/path/to/examples/src/features/unused/index.ts',
  '/path/to/examples/src/react-env.d.ts'
]
generate report done!
```

※ In the above, `/path/to/examples/src/foundations/Unused.tsx` is marked as used because `/path/to/examples/src/foundations/index.ts` is exported by \* mark. It will be fixed next versions.

## Document

### dedede function

Asynchronous function that returns files that are used and not used.

#### Args

| Name               | Type                                           | Description                                                                                                  |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `entryPoint`       | `string`                                       | The file from which the scan originates.Search for imported files starting from this file.                   |
| `targetDir`        | `string`                                       | The target directory, to be matched against the results of the search starting from the `entryPoint`         |
| `targetImportType` | `('import' \| 'require' \| 'dynamicImport')[]` | Module reference format. Each corresponds to `import` , `require` , `import()`                               |
| `ignoreFiles`      | `string[]?`                                    | Ignore File Names.                                                                                           |
| `ignoreDirNames`   | `string[]?`                                    | Ignore Dirctory Names.                                                                                       |
| `ignorePatterns`   | `string[]?`                                    | Ignore Patterns.                                                                                             |
| `aliasResolver`    | `Record<string,string>`                        | Alias Resolver. If `{ "@" : ".", "~" : ".." }`, then it would be `~/@/path` will be replaced as `.././path`. |

#### Return Values

| Name          | Type       | Description                                 |
| ------------- | ---------- | ------------------------------------------- |
| `usedFiles`   | `string[]` | Returns the referenced file in `targetDir`  |
| `unusedFiles` | `string[]` | Returns files not referenced in `targetDir` |
