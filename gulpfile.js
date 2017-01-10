var gulp = require('gulp');
var clientside = require('./gulp-clientside-merge.js');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pump = require('pump');

gulp.task('merge', function(){
    gulp.src([
        'src/errors.js',
        'src/capture-stack-client.js',
        'src/inherits-client.js',
        'src/errors/auth-error.js',
        'src/errors/dev-error.js',
        'src/errors/not-found-error.js',
        'src/errors/notify-user.js',
        'src/errors/service-error.js',
        'src/errors/user-error.js'
    ], { base:'src' })
        .pipe(clientside('errors.js', 'Errors'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['merge'], function(){
    pump([
        gulp.src(['dist/*.js', '!dist/*.min.js']),
        uglify({ mangle:{ except: ['AuthError', 'DevError', 'NotFoundError', 'NotifyUser', 'ServiceError', 'UserError'] } }),
        rename({ suffix:'.min' }),
        gulp.dest('./dist')
    ]);
});

gulp.task('default', ['merge', 'minify']);