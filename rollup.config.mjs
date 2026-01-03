import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
  input: "src/plugin.ts",
  output: {
    file: "com.komodo.stack-monitor.sdPlugin/bin/plugin.js",
    format: "cjs",
    sourcemap: true,
    inlineDynamicImports: true
  },
  plugins: [
    resolve({
      browser: false,
      preferBuiltins: true,
      exportConditions: ["node"]
    }),
    commonjs({
      ignoreDynamicRequires: true
    }),
    json(),
    typescript({
      tsconfig: "./tsconfig.json"
    })
  ],
  external: [
    "fs",
    "path",
    "os",
    "crypto",
    "http",
    "https",
    "net",
    "tls",
    "stream",
    "util",
    "events",
    "buffer",
    "url",
    "zlib",
    "child_process"
  ]
};
