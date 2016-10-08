var gulp   = require('gulp');
var babel  = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('run', function() {
  gulp.src(['./src/*.js'])
    .pipe(babel({presets: ['es2015']}))
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./'))
});

gulp.task('watch', function(){
  gulp.run('run');
  gulp.watch('./src/*.js', ['run']);
});
