import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import virtual from '@rollup/plugin-virtual'
import {
  NormalizedOutputOptions,
  OutputBundle,
  OutputChunk,
  Plugin as RollupPlugin,
  rollup,
} from 'rollup'
import { Plugin } from 'vite'

const VIRTUAL_PREFIX = '\0virtual:'

const resolve = (bundle: OutputBundle): RollupPlugin => ({
  name: 'resolve',
  resolveId(source: string, importer: string | undefined) {
    if (importer === undefined) {
      return source
    }

    const importerPath = importer.startsWith(VIRTUAL_PREFIX)
      ? importer.slice(VIRTUAL_PREFIX.length)
      : importer
    const dir = path.dirname(importerPath)
    const resolved = path.join(dir, source)

    return resolved in bundle ? resolved : false
  },
  load(id: string) {
    const chunk = bundle[id] as OutputChunk
    if (!chunk) {
      return null
    }

    return {
      code: chunk.code,
      map: chunk.map,
    }
  },
})

const iifeify = async (chunk: OutputChunk, bundle: OutputBundle) => {
  const virtualName = chunk.fileName

  const build = await rollup({
    input: virtualName,
    plugins: [
      virtual({
        [virtualName]: chunk.code,
      }),
      resolve(bundle),
      commonjs(),
    ],
  })
  const outputs = (
    await build.generate({
      name: chunk.name,
      format: 'iife',
      extend: true,
    })
  ).output

  if (outputs.length != 1) {
    throw new Error(
      `One chunk expected, but ${outputs.length} chunks generated.`,
    )
  }

  return outputs[0]
}

export default function (names: Array<string>): Plugin {
  return {
    name: 'iife',
    async generateBundle(
      options: NormalizedOutputOptions,
      bundle: OutputBundle,
    ) {
      const removedImports = new Set<string>()
      const chunks = Object.values(bundle).filter(
        c => c.type === 'chunk' && names.includes(c.name),
      ) as Array<OutputChunk>

      for (const chunk of chunks) {
        const renderedChunk = await iifeify(chunk, bundle)

        chunk.imports.forEach(removedImports.add, removedImports)

        chunk.code = renderedChunk.code
        chunk.imports = []
        chunk.importedBindings = {}
      }

      for (const fileName of removedImports) {
        const importers = Object.values(bundle).filter(
          c => c.type === 'chunk' && c.imports.includes(fileName),
        )

        if (importers.length === 0) {
          delete bundle[fileName]
        }
      }
    },
  }
}
