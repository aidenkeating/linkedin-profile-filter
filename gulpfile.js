const { src, dest, parallel, series } = require('gulp');
const babel = require('gulp-babel');
const zip = require('gulp-zip');
const package = require('./package.json');
const tape = require('gulp-tape')
const webpack = require('webpack-stream');
const minifyCSS = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');

function html() {
  return src('assets/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist/'));
}

function css() {
  return src('assets/*.css')
    .pipe(minifyCSS())
    .pipe(dest('dist/'));
}

function cmd() {
  return src('cmd/*.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(dest('dist/'));
}

function buildSrc() {
  return src('src/*.js')
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(dest('test/'));
}

function test() {
  return buildSrc()
    .pipe(src('test/*.js'))
    .pipe(tape({
      bail: true
    }));
}

function dist() {
  return src('dist/*')
    .pipe(zip(`linkedin-profile-filter-${package.version}.zip`))
    .pipe(dest('./'));
}

const buildCmd = parallel(html, css, cmd);
const testCmd = series(buildSrc, test);

exports.test = testCmd;
exports.dist = series(test, buildCmd, dist);
exports.build = buildCmd;
exports.default = buildCmd;
