import { test, expect } from 'vitest';

import {
  hasExtension,
  isContainDir,
  isExternalPath,
  isMatchExtension,
  isMatchFileName,
  isMatchPattern,
  isSupportExtension,
} from './utils';

test.each([
  [
    {
      filePath: 'path/to/file',
      files: ['file'],
    },
    true,
  ],
  [
    {
      filePath: 'path/to/file',
      files: ['file2'],
    },
    false,
  ],
  [
    {
      filePath: 'path/to/file',
      files: ['to'],
    },
    false,
  ],
])(isMatchFileName.name, ({ filePath, files }, expected) => {
  expect(isMatchFileName(filePath, files)).toBe(expected);
});

test.each([
  [
    {
      filePath: 'path/to/file',
      dirs: ['file'],
    },
    false,
  ],
  [
    {
      filePath: 'path/to/file',
      dirs: ['to'],
    },
    true,
  ],
  [
    {
      filePath: 'path/to/file',
      dirs: ['path'],
    },
    true,
  ],
])(isContainDir.name, ({ filePath, dirs }, expected) => {
  expect(isContainDir(filePath, dirs)).toBe(expected);
});

test.each([
  [
    {
      filePath: 'path/to/file',
      patterns: ['path/**/file'],
    },
    true,
  ],
  [
    {
      filePath: 'path/to/file',
      patterns: ['/path/**/filea'],
    },
    false,
  ],
  [
    {
      filePath: 'path/to/file',
      patterns: ['path/**/*'],
    },
    true,
  ],
])(isMatchPattern.name, ({ filePath, patterns }, expected) => {
  expect(isMatchPattern(filePath, patterns)).toBe(expected);
});

test.each([
  [
    {
      filePath: 'path/to/file',
      extensions: ['ts'],
    },
    false,
  ],
  [
    {
      filePath: 'path/to/file.ts',
      extensions: ['ts'],
    },
    true,
  ],
  [
    {
      filePath: 'path/to/file.ts',
      extensions: ['js', 'jsx'],
    },
    false,
  ],
])(isMatchExtension.name, ({ filePath, extensions }, expected) => {
  expect(isMatchExtension(filePath, extensions)).toBe(expected);
});

test.each([
  ['@path', true],
  ['@path/to', true],
  ['@path-hoge/to', true],
  ['@path/to-fuga-piyo', true],
  ['@path-hoge/to-fuga-piyo', true],
  ['path', true],
  ['path/to', true],
  ['path-hoge/to', true],
  ['path/to-fuga-piyo', true],
  ['path-hoge/to-fuga-piyo', true],
  ['./path', false],
  ['./path/to', false],
  ['./path-hoge/to', false],
  ['./path/to-fuga-piyo', false],
  ['./path-hoge/to-fuga-piyo', false],
  ['../path', false],
  ['../path/to', false],
  ['../path-hoge/to', false],
  ['../path/to-fuga-piyo', false],
  ['../path-hoge/to-fuga-piyo', false],
  ['.../path', false],
  ['.../path/to', false],
  ['.../path-hoge/to', false],
  ['.../path/to-fuga-piyo', false],
  ['.../path-hoge/to-fuga-piyo', false],
  ['@/path', false],
  ['@/path/to', false],
  ['@/path-hoge/to', false],
  ['@/path/to-fuga-piyo', false],
  ['@/path-hoge/to-fuga-piyo', false],
])(isExternalPath.name, (path, expected) => {
  expect(isExternalPath(path)).toBe(expected);
});

test.each([
  ['path.tsx', true],
  ['path', false],
  ['path/to', false],
  ['path/to.tsx', true],
])(hasExtension.name, (path, expected) => {
  expect(hasExtension(path)).toBe(expected);
});

test.each([
  [{ filePath: 'path.tsx', extensions: [] }, false],
  [{ filePath: 'path.tsx', extensions: ['tsx'] }, true],
  [{ filePath: 'path.tsx', extensions: ['ts'] }, false],
])(isSupportExtension.name, ({ filePath, extensions }, expected) => {
  expect(isSupportExtension(filePath, extensions)).toBe(expected);
});
