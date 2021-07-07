// rollup.config.js
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";
// import babel from 'rollup-plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs";

// directory where a completed build of the extension should go
const outputDir = "_build";
// format which javascript files should be in in the extension
const outputJSFormat = "cjs";
// output zip file name for chrome
const outputZip = "li-profile-filter.zip";
// directory where root files are stored
const cmdDir = "cmd";
// root files to build for the extension
const jsFiles = [
  "background.js",
  "li-profile-page.js",
  "li-recruiter-profile-page.js",
  "li-recruiter-search-page.js",
  "li-recruiter-pipeline-page.js",
  "options.js",
  "content.js",
];
// directory where additional files that should be copied are stored
const extrasDir = "assets";
const extraFiles = [
  "options.html",
  "pure-min.css",
  "icon16.png",
  "icon48.png",
  "icon128.png",
];
// declare actions to perform
const buildActions = [];
// handle javascript files
buildActions.push(
  ...jsFiles.map((cmdFile) => ({
    input: `${cmdDir}/${cmdFile}`,
    output: {
      file: `${outputDir}/dist/${cmdFile}`,
      format: outputJSFormat,
    },
    plugins: [json(), commonjs(), nodeResolve()],
  }))
);
// handle asset files
buildActions[0].plugins.push(
  copy({
    targets: extraFiles.map((extraFile) => ({
      src: `${extrasDir}/${extraFile}`,
      dest: `${outputDir}/dist`,
    })),
  })
);
// handle manifest file
buildActions[0].plugins.push(
  copy({
    targets: [{ src: "manifest.json", dest: outputDir }],
  })
);

// export build actions
export default buildActions;
