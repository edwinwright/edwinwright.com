// load gulp
var gulp            = require('gulp');

// load plugins
var plugins         = require('gulp-load-plugins')();
var runSequence     = require('run-sequence');
var source          = require('vinyl-source-stream');
var buffer          = require('vinyl-buffer');
var del             = require('del');
var argv            = require('yargs').argv;
var lazypipe        = require('lazypipe');
var browserify      = require('browserify');
var browserSync     = require('browser-sync');
var reload          = browserSync.reload;


// load config file
//var cfg             = require('./build.config.js')();

// set 
var params = {
  dist: argv.dist
}

var basePaths = {
  src: 'src/',
  dest: 'build/',
  bower: 'vendor/'
};

var paths = {
  styles: {
    src: basePaths.src + 'assets/scss/',
    dest: basePaths.dest + 'assets/css/'
  },
  scripts: {
    src: basePaths.src + 'assets/scripts/',
    dest: basePaths.dest + 'assets/js/'
  },
  images: {
    src: basePaths.src + 'imgs/',
    dest: basePaths.dest + 'imgs/'
  },
  data: {
    src: basePaths.src + 'data/',
    dest: basePaths.dest + 'data/'
  },
  vendor: {
    dest: basePaths.dest + 'vendor/'
  }
};

var srcFiles = {
  html: basePaths.src + '**/*.html',
  styles: paths.styles.src + '**/*.scss',
  scripts: paths.scripts.src + '**/*.js',
  images: paths.images.src + '**/*',
  data: paths.data.src + '**/*'
};

var vendorFiles = {
  styles: [
    basePaths.bower + 'normalize.css/normalize.css'
  ],
  scripts: [
    basePaths.bower + 'fastclick/lib/fastclick.js',
    basePaths.bower + 'lodash/lodash.js*',
    basePaths.bower + 'angular/angular.js*',
    basePaths.bower + 'angular-route/angular-route.js*',
    basePaths.bower + 'angular-sanitize/angular-sanitize.js*',
    basePaths.bower + 'angular-animate/angular-animate.js*',
    basePaths.bower + 'gmaps-markerclusterer-plus/src/markerclusterer.js',
    basePaths.bower + 'gmaps-infobox/index.js',
    basePaths.bower + 'd3/d3.js',
    basePaths.bower + 'gsap/src/uncompressed/TweenLite.js',
    basePaths.bower + 'gsap/src/uncompressed/TimelineLite.js',
    basePaths.bower + 'gsap/src/uncompressed/plugins/CSSPlugin.js',
    basePaths.bower + 'gsap/src/uncompressed/easing/EasePack.js'
  ]
};


/********************************************************************
 Setup the tasks
 --------------------------------------------------------------------*/

// clean the build folder
gulp.task('clean', function(cb) {
  del(basePaths.dest, cb);
});


// html tasks
gulp.task('html', function() {
  return gulp.src(srcFiles.html)
    .pipe(gulp.dest(basePaths.dest));
});


// css tasks
gulp.task('styles', function() {
  var sourcemaps = require('gulp-sourcemaps'),
      sass = require('gulp-sass'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      csswring = require('csswring');

  var processors = [
    autoprefixer({
      browsers: ['last 2 versions', 'Explorer >= 9'],
      cascade: false
      }),
    csswring
  ];

  return gulp.src('./src/assets/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    // .pipe(sourcemaps.write('.'))
    // .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./src/assets/css/'));
});


// js tasks
gulp.task('scripts', ['jsValidate'], function() {
  var browserify = require('browserify')({
        entries: './src/assets/scripts/app.js',
        debug: true
      }),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer'),
      sourcemaps = require('gulp-sourcemaps');

  return browserify.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
//        .pipe(uglify())
//        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./src/assets/js/'));
});

gulp.task('jsValidate', function() {
  return gulp.src(srcFiles.scripts)
    .pipe(plugins.jsvalidate());
});




// image tasks
gulp.task('modernizr', function() {

  var modernizr = require("modernizr");

  var config = {
    "classPrefix": "",
    "options": [
      "addTest",
      "atRule",
      "domPrefixes",
      "hasEvent",
      "html5shiv",
      "html5printshiv",
      "load",
      "mq",
      "prefixed",
      "prefixes",
      "prefixedCSS",
      "setClasses",
      "testAllProps",
      "testProp",
      "testStyles"
    ],
    "feature-detects": [
      "css/flexbox",
      "css/flexboxlegacy",
      "css/flexboxtweener",
      "css/flexwrap"
    ]
  };


  var fs = require("fs");
  modernizr.build(config, function (result) {
    fs.writeFile('./src/assets/js/modernizr.js', result, function (err) {
      if (err) throw err;
      console.log('It\'s saved!');
    });
  });

});


// image tasks
gulp.task('images', function() {
  return gulp.src(srcFiles.images)
    .pipe(gulp.dest(paths.images.dest))
});


// data tasks
gulp.task('data', function() {
  return gulp.src(srcFiles.data)
    .pipe(gulp.dest(paths.data.dest))
});


// TODO: Need to work this into a dist build
// Will need to update html files to take renamed js file
gulp.task('jsMinify', function() {
  return gulp.src(srcFiles.scripts)
    .pipe(plugins.plumber())
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.dest));
});


// vendor tasks
gulp.task('vendor', ['copyVendorCSS', 'copyVendorJS'])
gulp.task('copyVendorCSS', function() {
  return gulp.src(vendorFiles.styles)
    .pipe(gulp.dest(paths.styles.dest))
});
gulp.task('copyVendorJS', function() {
  return gulp.src(vendorFiles.scripts)
    .pipe(gulp.dest(paths.scripts.dest));
});


// server tasks
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: basePaths.dest
    }
  });

  gulp.watch(srcFiles.html, ['html', reload]);
  gulp.watch(srcFiles.scripts, ['scripts', reload]);
  gulp.watch(srcFiles.styles, ['styles', reload]);
  gulp.watch(srcFiles.images, ['images', reload]);
  gulp.watch(srcFiles.data, ['data', reload]);

});


/********************************************************************
 Default task

 Runs the serve task
 --------------------------------------------------------------------*/
gulp.task('default', ['serve']);


/********************************************************************
 Serve task

 Serves the app to the browser and watches for file changes

 $ gulp serve

 $ gulp serve --dist
 --------------------------------------------------------------------*/
gulp.task('serve', function(cb) {
  runSequence(
    'clean',
    'build',
    'browserSync',
    cb);
});


/********************************************************************
 Build task

 Builds and serves the app to the browser for development

 $ gulp build
 --------------------------------------------------------------------*/
gulp.task('build', [
  'html',
  'scripts',
  // 'scripts2',
  'styles',
  'images',
  'data',
  'vendor'
]);
