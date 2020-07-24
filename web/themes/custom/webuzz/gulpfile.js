'use strict';

let gulp = require('gulp');
let sass = require('gulp-sass');
let minify = require('gulp-minify');
let cleanCSS = require('gulp-clean-css');
let rename = require("gulp-rename");

sass.compiler = require('node-sass');

gulp.task('minify-js', function() {
  return gulp.src(['./assets/js/*.js', './assets/js/*/*.js'])
    .pipe(minify({noSource:true}))
    .pipe(gulp.dest('./assets/minified/js'));
});

gulp.task('sass', function () {
  return gulp.src('./assets/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('minify-css', function() {
  return gulp.src(['./assets/css/*.css', './assets/css/*/*.css'])
    .pipe(cleanCSS({
      compatibility: 'ie8',
    }))
    .pipe(rename(function (path) {
      path.extname = '-min.css';
    }))
    .pipe(gulp.dest('./assets/minified/css'));
});

gulp.task('watch', function() {
  gulp.watch('./assets/js/*.js', gulp.series('minify-js'));
  gulp.watch('./assets/sass/**/*.scss', gulp.series('sass'));
  gulp.watch('./assets/css/*.css', gulp.series('minify-css'));
});
