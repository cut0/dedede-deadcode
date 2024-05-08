import * as path from 'path';

import { build } from 'esbuild';

export const run = async () => {
  await build({
    entryPoints: [path.resolve(__dirname, './index.ts')],
    bundle: true,
    outfile: path.join(__dirname, '../dist/index.js'),
    minify: true,
    sourcemap: false,
    platform: 'node',
    treeShaking: true,
  });
};

run()
  .then(() => {
    console.log('Build Completed!!');
  })
  .catch(() => process.exit(1));
