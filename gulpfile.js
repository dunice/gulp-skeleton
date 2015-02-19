var del          = require('del');
var mkdirp       = require('mkdirp');
var gulp         = require('gulp');
var bower        = require('gulp-bower');
var compass      = require('gulp-compass');
var sass         = require('gulp-ruby-sass');
var notify       = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer');
var imagemin     = require('gulp-imagemin');
var cache        = require('gulp-cache');
var rename       = require('gulp-rename');
var jshint       = require('gulp-jshint');
var uglify       = require('gulp-uglify');

var config = {
    scriptPath : './src/js',
    imagePath  : './src/images',
    sassPath   : './src/sass',
    bowerDir   : './bower_components',
    webFolder  : '../web/assets'
}

var scriptDir = config.webFolder + '/js';

function clean(folder, cb) {
    if(!folder) {
        folder = [
            config.webFolder + '/js',
            config.webFolder + '/css',
            config.webFolder + '/fonts',
            config.webFolder + '/images',
        ];
    }

    del(folder, {
        force : true
    }, cb);
}

function libs(data) {
    return gulp.src(data.files)
        .pipe(gulp.dest(data.path))
        .pipe(rename({
            suffix : '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(data.path));
}

gulp.task('clean', function(cb) {
    clean(null, cb);
});

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir));
});

gulp.task('images', function() {
    return gulp.src(config.imagePath + '/**/*')
        .pipe(cache(imagemin({
            optimizationLevel : 5,
            progressive : true,
            interlaced : true
        })))
        .pipe(gulp.dest(config.webFolder + '/images'))
});

gulp.task('icons', function() {
    var fontsDir = config.webFolder + '/fonts';

    mkdirp(fontsDir);

    return gulp.src([
            config.bowerDir + '/fontawesome/fonts/**.*',
            config.bowerDir + '/bootstrap-sass/assets/fonts/bootstrap/**.*',
        ])
        .pipe(gulp.dest(fontsDir));
});

gulp.task('sass', function() {
    clean([
        config.webFolder + '/css'
    ]);

    return sass(config.sassPath, {
            style: 'compressed',
            loadPath: [
                config.sassPath,
                config.bowerDir + '/bootstrap-sass/assets/stylesheets',
                config.bowerDir + '/fontawesome/scss',
            ]
        })
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(config.webFolder + '/css'));
});

gulp.task('scripts', function() {
    gulp.start('bootstrap', 'jquery');

    return gulp.src([
            config.scriptPath + '/**/*.js'
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        // .pipe(concat('main.js'))
        .pipe(gulp.dest(scriptDir))
        .pipe(rename({
            suffix : '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(scriptDir));
});

gulp.task('bootstrap', function() {
    return libs({
        files : [
            config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap.js',
        ],
        path : scriptDir + '/libs/bootstrap',
    });
});

gulp.task('jquery', function() {
    return libs({
        files : [
            config.bowerDir + '/jquery/dist/jquery.js',
        ],
        path : scriptDir + '/libs/jquery',
    });
});

gulp.task('default', ['clean'], function() {
    gulp.start('bower', 'icons', 'sass', 'images', 'scripts');
});

gulp.task('watch', function() {
    gulp.watch(config.sassPath + '/**/*.scss', ['sass']);
    gulp.watch(config.scriptPath + '/**/*.js', ['scripts']);
    gulp.watch(config.imagePath + '/**/*', ['images']);
});
