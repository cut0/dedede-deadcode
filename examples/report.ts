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

run()
  .then(() => console.log('generate report done!'))
  .catch(console.error);
