import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import virtual from '@rollup/plugin-virtual'
import {
  NormalizedOutputOptions,
  OutputBundle,
  OutputChunk,
  PluginContext,
  rollup,
} from 'rollup'

const VIRTUAL_PREFIX = '\0virtual:'

const resolve = (bundle: OutputBundle) => ({
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

    const importers = Object.values(bundle).filter(
      c => c.type === 'chunk' && c.imports.includes(chunk.fileName),
    )
    if (importers.length <= 1) {
      delete bundle[id]
    }

    return {
      code: chunk.code,
      map: chunk.map,
    }
  },
})

export default function (names: Array<string>) {
  return {
    async generateBundle(
      this: PluginContext,
      options: NormalizedOutputOptions,
      bundle: OutputBundle,
    ) {
      const entries = Object.values(bundle).filter(
        c => c.type === 'chunk' && names.includes(c.name),
      ) as Array<OutputChunk>

      for (const entry of entries) {
        const virtualName = entry.fileName

        const build = await rollup({
          input: virtualName,
          plugins: [
            virtual({
              [virtualName]: entry.code,
            }),
            resolve(bundle),
            commonjs(),
          ],
        })
        const outputs = (
          await build.generate({
            name: entry.name,
            format: 'iife',
            extend: true,
          })
        ).output

        if (outputs.length != 1) {
          throw new Error(
            `One chunk expected, but ${outputs.length} chunks received.`,
          )
        }

        entry.code = outputs[0].code
        entry.imports = []
        entry.importedBindings = {}
      }
    },
  }
}
