#!/usr/bin/env node

const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const buildDir = execEnv.buildDir
const packageJsonPath = path.join(buildDir, 'package.json')
const projectDir = process.env.PROJECT_CWD

process.on('uncaughtException', err => {
  if (err.stdout?.length) {
    console.error(`stdout: ${err.stdout}\n`)
  }
  if (err.stderr?.length) {
    console.error(`stderr: ${err.stderr}\n`)
  }

  throw err
})

// Target version
const version = '4.9.0'

// Get URLs
const tarballUrl = child_process
  .execFileSync('npm', ['view', `curlconverter@${version}`, 'dist.tarball'])
  .toString()
  .trim()
const packageLockUrl = `https://raw.githubusercontent.com/curlconverter/curlconverter/v${version}/package-lock.json`

// Download files
const tarballPath = path.join(execEnv.tempDir, 'tarball.tgz')
const packageLockPath = path.join(buildDir, 'package-lock.json')
child_process.execFileSync('curl', ['-s', tarballUrl, '-o', tarballPath])
child_process.execFileSync('curl', [
  '-s',
  packageLockUrl,
  '-o',
  packageLockPath,
])

// Extract tarball
child_process.execFileSync(
  'tar',
  ['-xf', tarballPath, '--strip-components=1'],
  { cwd: buildDir },
)

// Remove all generators except json
child_process.execFileSync(
  'find',
  ['-not', '-name', 'json.ts', '-path', './src/generators/*', '-delete'],
  { cwd: buildDir },
)
fs.writeFileSync(
  path.join(buildDir, 'src/index.ts'),
  'export { toJsonString } from "./generators/json.js";',
)

// Patch packages
child_process.execFileSync(
  'patch',
  [
    '-p',
    '1',
    '-i',
    path.join(projectDir, 'build/package-generators/curlconverter.patch'),
  ],
  { cwd: buildDir },
)
const newPackageJson = child_process
  .execFileSync('jq', [
    'del(.bin) | del(.browser) | del(.dependencies."@curlconverter/tree-sitter") | del(.scripts.prepare)',
    packageJsonPath,
  ])
  .toString()
  .trim()
fs.writeFileSync(packageJsonPath, newPackageJson)
child_process.execFileSync('rm', [
  '-rf',
  path.join(buildDir, 'dist/src'),
  path.join(buildDir, 'tools'),
  path.join(buildDir, 'src/shell/Parser.ts'),
  path.join(buildDir, 'src/cli.ts'),
])

// Prepare package
child_process.execFileSync('npm', ['install'], {
  cwd: buildDir,
})
child_process.execFileSync('npm', ['run', 'compile'], { cwd: buildDir })

// Cleanup
child_process.execFileSync('rm', ['-rf', path.join(buildDir, 'node_modules')])
