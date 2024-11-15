import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import { visualizer } from "rollup-plugin-visualizer"

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "index.ts", // Path to your worker file
  output: {
    file: "dist/index.cjs",
    format: "cjs"
  },
  plugins: [
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production")
    }),
    json(),
    typescript(),
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    terser(),
    visualizer()
  ]
}

export default config
