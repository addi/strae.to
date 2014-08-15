var gulp        = require('gulp');
var stylus      = require('gulp-stylus');
var autoprefix  = require('gulp-autoprefixer');
var minifycss   = require('gulp-minify-css');
var source      = require('vinyl-source-stream');
var uglify      = require('gulp-uglify');
var livereaload = require('gulp-livereload');
var browserify  = require('browserify');
var watchify    = require('watchify');
var server      = require('tiny-lr')();
var notify      = require('gulp-notify');
var minimist    = require('minimist');
var nib         = require('nib');
var gulpif      = require('gulp-if');
var streamify   = require('gulp-streamify');

var dev = !!minimist(process.argv.slice(2)).d;

var handleErrors = function() {
	var args = Array.prototype.slice.call(arguments);
	console.log(args);
	notify.onError({
		title: 'Compile Error',
		message: '<%= error.message %>',
	}).apply(this, args);
	this.emit('end');
};

gulp.task('styles', function() {
    return gulp.src('./source/main.styl')
        .pipe(stylus({use: [nib()]}))
        .pipe(autoprefix('last 2 versions'))
        .pipe(minifycss())
        .pipe(gulp.dest('./'))
        .pipe(livereaload(server))
        .pipe(notify({message: 'Styles task complete'}));
});


gulp.task('scripts', function() {

    var w = watchify(browserify({
        entries: ['./source/app.jsx'],
        transform: [
					['reactify', {'es6': true}]
				],
        debug: false,
        extensions: ['.jsx', '.js'],
        cache: {},
        packageCache: {},
        fullPaths: true,
    }));

    var bundle = function() {
        return w.bundle()
            .on('error', handleErrors)
            .pipe(source('bundle.js'))
            .pipe(gulpif(!dev, streamify(uglify({
                mangle: { except: ['require', 'export', '$super'] }
            }))))
            .pipe(gulp.dest('./'))
            .pipe(livereaload(server))
            .pipe(notify({ message: 'Scripts task completed' }));
    };

    w.on('update', bundle);
    w.on('time', function (time) {
        console.log('[gulp] Watchify took: ' + time/1000  + 's');
    });

    return bundle();

});

gulp.task('watch', function() {
    server.listen(35729, function(err) {if (err) return console.log(err); });

    gulp.watch('./source/**/*.styl', ['styles']);
    // Watchify handles updating browserify bundle

});

gulp.task('default', ['styles', 'scripts', 'watch']);
