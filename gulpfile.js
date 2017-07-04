const gulp			= require('gulp');
const browserSync	= require('browser-sync').create();
const babel			= require('gulp-babel');
const jshint		= require('gulp-jshint');
const sass			= require('gulp-sass');
const del			= require('del');
const builder		= require('systemjs-builder');
const concat		= require('gulp-concat');
const uglify		= require('gulp-uglify');
const processhtml	= require('gulp-processhtml');
const print			= require('gulp-print');
const chalk			= require('chalk');

const es6_glob		= 'src/js-es6/**/*.js';		// Glob to match es6 JavaScript files
const dev_es5_dest	= 'src/js';					// Where to output transpiled JavaScript during development
const pro_es5_dest	= 'dist/js';				// Where to put JavaScript during build

const app_entry_js	= 'js/main.js';				// Entry point to the applicaton on dev
const app_out_js	= 'dist/js/main.js';		// Output file for bundled app on production

const sass_glob		= 'src/sass/**/*.scss';		// Glot matcing Sass source files
const dev_css_dest	= 'src/css';				// Where to output transpiled Sass

function timenow() {
	let d = new Date();
	return String(d.getHours()) + ':' + String(d.getMinutes()) + ':' + String(d.getSeconds());
}

gulp.task('default',['develop']);
//gulp.task('default',['build:serve']);

function dev_sass_transpile_all() {
	return new Promise( (resolve,reject) => {
		gulp.src(sass_glob)
			.pipe(sass().on('error', err => { sass.logError(err); reject(); }))
//				.on('error',reject)
			.pipe(gulp.dest(dev_css_dest))
				.on('end',resolve)
				.on('error',reject);
	});
}

function dev_es6_transpile_all() {
	return new Promise( (resolve,reject) => {
		gulp.src([es6_glob,'!src/js-es6/systemjs.config.js'])
		.pipe(jshint({esversion: 6}))
		.pipe(jshint.reporter('default',{ verbose: true }))
		.pipe(babel({presets: ['es2015']}))
			.on('error',reject)
		.pipe(gulp.dest(dev_es5_dest))
			.on('end',resolve)
			.on('error',reject);
	});
}

function transpile() {
	return Promise.all([
		dev_es6_transpile_all(),
		dev_sass_transpile_all()
	]);
}

gulp.task('transpile',transpile);


gulp.task('serve', ['transpile'], done => {
	browserSync.init({
		server: {
			baseDir: 'src',
			routes: {
				'/node_modules':'node_modules'
			}
		}
	},done);
});

// Default action: for development
gulp.task('develop',['serve'],function() {

	gulp.watch(es6_glob,function(event) {
		if ( event.type==='deleted' ) {
			// Delete file
		} else if ( event.type==='added' || event.type==='changed' || event.type==='renamed' ) {
			gulp.src(event.path)
				.pipe(print(filename=>{console.log(`[${chalk.grey(timenow())}] Transpiling es2015 ${filename}`);}))
				.pipe(babel({presets: ['es2015']}))
				.on('error', err => { console.log(err.message); })
				.pipe(gulp.dest(dev_es5_dest));
		}
	});

	gulp.watch(sass_glob,function(event) {
		if ( event.type==='deleted' ) {
			// Delete file
		} else if ( event.type==='added' || event.type==='changed' || event.type==='renamed' ) {
			gulp.src(event.path)
				.pipe(print(filename=>{console.log(`[${chalk.grey(timenow())}] Transpiling SASS ${filename}`);}))
				.pipe(sass().on('error', err => { sass.logError(err); }))
//					.on('error', err => { console.log(err.message); })
				.pipe(gulp.dest(dev_css_dest));
		}
	});

	gulp.watch('src/css/**/*.css',		browserSync.reload);
	gulp.watch('src/**/*.html',			browserSync.reload);
	gulp.watch(dev_es5_dest+'/**/*.js',	browserSync.reload);
});



// ---------------------------- BUILD -------------------------------------
function jsbundle() {
	const jsBuilder = new builder('src','src/js-es6/systemjs.config.js');
	transpile().then( () => jsBuilder.buildStatic(app_entry_js, app_out_js, {
        minify: true,
        mangle: true
    }));
}
gulp.task('jsbundle',jsbundle);

function clean_dist() {
	return del(['dist/'+'**','!dist']);
}
gulp.task('clean:dist',clean_dist);

function copy_css() {
	return new Promise ( (resolve,reject) => {
		gulp.src('src/**/*.css')
			.pipe(gulp.dest('dist'))
			.on('end',resolve)
			.on('error', reject);
		});
}
gulp.task('copy:css',copy_css);

function copy_html() {
	return new Promise ( (resolve,reject) => {
		gulp.src('src/**/*.html')
			.pipe(processhtml())
			.pipe(gulp.dest('dist'))
				.on('end',resolve)
				.on('error',reject);
		});
}
gulp.task('copy:html',copy_html);


function build() {
	return Promise.all([clean_dist(),transpile()])
		.then( ignore => Promise.all(
			[
				jsbundle(),
				copy_css(),
				copy_html()
			])
	);
}
gulp.task('build',build);

function build_serve(done) {
	build()
		.then( ignore => {
			browserSync.init({
				server: {
					baseDir: 'dist',
					routes: {
						'/node_modules':'node_modules'
					}
				}
			},done);
	});
}

gulp.task('build:serve', build_serve);
gulp.task('build:serve:watch', ['build:serve'], function() {
	gulp.watch(['src/**','!src/js/**','!src/css/**'],function(event) {
		build().then( ignorePromiseArray => {
			browserSync.reload();
		}, console.log );
	})
		.on('error',console.log);
	// gulp.watch('dist/**',browserSync.reload)
	// 	.on('error',console.log);
});