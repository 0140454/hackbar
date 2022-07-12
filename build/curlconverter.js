#!/usr/bin/env node

const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const buildDir = execEnv.buildDir
const packageJsonPath = path.join(buildDir, 'package.json')
const projectDir = process.env.PROJECT_CWD

// Get tarball URL
const tarballUrl = child_process
  .execFileSync('npm', ['view', 'curlconverter', 'dist.tarball'])
  .toString()
  .trim()

// Download tarball
const tarballPath = path.join(execEnv.tempDir, 'tarball.tgz')
child_process.execFileSync('curl', ['-s', tarballUrl, '-o', tarballPath])

// Extract tarball
child_process.execFileSync(
  'tar',
  ['-xf', tarballPath, '--strip-components=1'],
  { cwd: buildDir },
)

// Patch packages
child_process.execFileSync(
  'patch',
  ['-p', '1', '-i', path.join(projectDir, 'build/curlconverter.patch')],
  { cwd: buildDir },
)
const newPackageJson = child_process
  .execFileSync('jq', [
    'del(.bin) | del(.browser) | del(.dependencies."tree-sitter")',
    packageJsonPath,
  ])
  .toString()
  .trim()
fs.writeFileSync(packageJsonPath, newPackageJson)
fs.writeFileSync(
  path.join(buildDir, 'tree-sitter-bash.wasm?url.ts'),
  'export default ""',
)
child_process.execFileSync('rm', [
  '-rf',
  path.join(buildDir, 'dist/src'),
  path.join(buildDir, 'tools'),
  path.join(buildDir, 'src/bash-parser.ts'),
  path.join(buildDir, 'src/cli.ts'),
])

// Prepare package
child_process.execFileSync('yarn', ['set', 'version', 'berry'], {
  cwd: buildDir,
})
child_process.execFileSync(
  'yarn',
  ['config', 'set', 'nodeLinker', 'node-modules'],
  { cwd: buildDir },
)
child_process.execFileSync('yarn', ['install'], {
  cwd: buildDir,
})
child_process.execFileSync('yarn', ['run', 'compile'], { cwd: buildDir })

// Cleanup
child_process.execFileSync('rm', ['-rf', path.join(buildDir, 'node_modules')])
child_process.execFileSync('find', [
  path.join(buildDir, 'dist'),
  '-name',
  'tree-sitter-bash.wasm?url.*',
  '-exec',
  'rm',
  '-rf',
  '{}',
  ';',
])
