import { visualizer } from "rollup-plugin-visualizer";
import resolve from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';


export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
    // put it the last one
    visualizer(),
  ],
};
