var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('run', function() {
  gulp.src('./src/*.js')
  .pipe(babel({presets: ['es2015']}))
  .pipe(gulp.dest('./'))
});