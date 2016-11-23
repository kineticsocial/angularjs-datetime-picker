'use strict';
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var rename = require('gulp-rename');

gulp.task('build', function() {
  return gulp.src(['angularjs-datetime-picker.js'])
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('angularjs-datetime-picker-v0.2.0.min.js'))
    .pipe(gulp.dest('.'));
});
