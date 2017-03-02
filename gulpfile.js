var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var merge = require('merge-stream');
var babel = require('gulp-babel');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

gulp.task('sass', function() {
    var scssStream = gulp.src('sass/theme.scss')
        .pipe(sass())
        .pipe(concat('style.css'))
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(gulp.dest('css'))
        .pipe(reload({ stream:true }));
    return scssStream;
});

gulp.task('js', function() {
    var rootStream = gulp.src('js/app.js');
    var dependenciesStream = gulp.src(['js/**/*.js', 'templates/**/*.js', '!templates/pages/lab/experiments/**/*.js', '!js/vendor/*.js', '!js/script.js', '!js/app.js']);
    var mergeStream = merge(rootStream, dependenciesStream)
        .pipe(babel({
            'presets': ['es2015']
        }))
        .pipe(concat('script.js'))
        .pipe(gulp.dest('js'))
        .pipe(reload({ stream:true }));
    return mergeStream;
});

gulp.task('serve', ['sass', 'js'], function() {
    browserSync.init({
        server: true
    });

    gulp.watch('sass/*.scss', ['sass']);
    gulp.watch('*.html').on('change', reload);
    gulp.watch('**/*.html').on('change', reload);
    // gulp.watch('**/*.js', ['js']).on('change', reload);
    gulp.watch('*.js', ['js']).on('change', reload);
    gulp.watch('js/**/*.js', ['js']).on('change', reload);
});
