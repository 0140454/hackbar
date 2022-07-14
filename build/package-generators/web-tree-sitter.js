#!/usr/bin/env node

const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const repo = path.join(execEnv.tempDir, 'tree-sitter')
const web_dir = 'lib/binding_web'
const projectDir = process.env.PROJECT_CWD

// Get version
let version = undefined
try {
  const info = child_process
    .execFileSync('yarn', ['info', '--json', '-R', 'web-tree-sitter'], {
      cwd: projectDir,
    })
    .toString()
    .trim()
  version = JSON.parse(info)['children']['Version']
} catch (err) {
  version = child_process
    .execFileSync('npm', ['view', 'web-tree-sitter', 'dist-tags.latest'])
    .toString()
    .trim()
}

if (!version) {
  throw new Error('Failed to get version')
}

// Clone the repository
child_process.execFileSync('git', [
  'clone',
  '--depth',
  '1',
  '--branch',
  `v${version}`,
  'https://github.com/tree-sitter/tree-sitter.git',
  repo,
])

// Get current EUID
const uid = child_process.execFileSync('id', ['-u']).toString().trim()

// Build JS with bundled WASM
//
// Ref: https://github.com/tree-sitter/tree-sitter/blob/master/script/build-wasm#L82-L103
const emscriptenVersion = fs
  .readFileSync(path.join(repo, 'cli/emscripten-version'))
  .toString()
  .trim()
child_process.execFileSync(
  'docker',
  [
    'run',
    '--rm',
    '-v',
    `${repo}:/src:Z`,
    '-u',
    uid,
    `emscripten/emsdk:${emscriptenVersion}`,
    'emcc',
    '-s',
    'WASM=1',
    '-s',
    'TOTAL_MEMORY=33554432',
    '-s',
    'ALLOW_MEMORY_GROWTH=1',
    '-s',
    'MAIN_MODULE=2',
    '-s',
    'NO_FILESYSTEM=1',
    '-s',
    'NODEJS_CATCH_EXIT=0',
    '-s',
    'NODEJS_CATCH_REJECTION=0',
    '-s',
    `EXPORTED_FUNCTIONS=@${web_dir}/exports.json`,
    '-s',
    'SINGLE_FILE',
    '-O3',
    '-std=c99',
    '-D',
    'fprintf(...)=',
    '-D',
    'NDEBUG=',
    '-I',
    'lib/src',
    '-I',
    'lib/include',
    '--js-library',
    `${web_dir}/imports.js`,
    '--pre-js',
    `${web_dir}/prefix.js`,
    '--post-js',
    `${web_dir}/binding.js`,
    '--post-js',
    `${web_dir}/suffix.js`,
    'lib/src/lib.c',
    `${web_dir}/binding.c`,
    '-o',
    `${web_dir}/tree-sitter.js`,
  ],
  {
    cwd: repo,
  },
)

// Prepare package
for (const fileName of [
  'package.json',
  'tree-sitter-web.d.ts',
  'tree-sitter.js',
]) {
  fs.copyFileSync(
    path.join(repo, web_dir, fileName),
    path.join(execEnv.buildDir, fileName),
  )
}
