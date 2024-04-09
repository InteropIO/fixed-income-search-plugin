const typescript = require("rollup-plugin-typescript2");
const terser = require("@rollup/plugin-terser");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const pkg = require("./package.json");
const del = require("rollup-plugin-delete");

module.exports = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      name: "searchPlugin",
      format: "umd",
      sourcemap: true,
    },
    {
      file: "./dist/searchPlugin.umd.min.js",
      name: "searchPlugin.min",
      format: "umd",
      plugins: [terser()],
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
  ],
  external: [
    //...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],

  plugins: [
    del({ targets: "dist/*" }),
    typescript({
      typescript: require("typescript"),
    }),
    // Allow json resolution
    json(),
    // // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // // Allow node_modules resolution, so you can use 'external' to control
    // // which external modules to include in the bundle
    // // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      mainFields: ["module", "main", "browser"],
    }),
  ],
};
