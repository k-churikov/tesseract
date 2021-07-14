const gulp = require('gulp');
const PATHS = require('./PATHS.config.json');
const env = process.env.NODE_ENV;
const fs = require('fs')
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();
const stringHash = require('string-hash')('foo');

// Use to pipe how $gp.namePlugin
const $gp = require("gulp-load-plugins")();
$gp.sass.compiler = require('node-sass');

// watch for dist and reload browser
gulp.task('server', () => {
  browserSync.init({
    server: PATHS.root,
    open: false
  });

  browserSync.watch(PATHS.root + '/**/*.*', browserSync.reload);
});

// сlean
gulp.task('clean', () => {
  // return del([`${PATHS.root}/**`, `!${PATHS.root}`]);
  return del(PATHS.root);
});

// images
gulp.task('images', () => {
  return gulp.src([PATHS.images.src, `!${PATHS.images.icons}`])
    .pipe($gp.if(env === "production", $gp.imagemin({ 
      optimizationLevel: 3, 
      progressive: true, 
      interlaced: true 
    })))
    .pipe(gulp.dest(PATHS.images.dest))
});

// fonts
gulp.task('fonts', () => {
  return gulp.src(PATHS.fonts.src)
    .pipe(gulp.dest(PATHS.fonts.dest))
});

// png sprite
gulp.task('sprite', () => {
  const spriteData = gulp.src(PATHS.sprite.src)
    .pipe($gp.if(env === "production", $gp.imagemin({ 
      optimizationLevel: 3, 
      progressive: true, 
      interlaced: true 
    })))
    .pipe($gp.spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.scss',
      cssFormat: 'css',
      padding: 50,
      imgPath: PATHS.sprite.imgLocation
  }))

  // spriteData.img.pipe(gulp.dest(PATHS.sprite.dest))
  spriteData.css.pipe(gulp.dest(PATHS.sprite.distFile))

  return spriteData.pipe(gulp.dest(PATHS.sprite.dest))
});

// svg sprite
gulp.task("svg", done => {
  return gulp
    .src(PATHS.svg.src)
    .pipe(
      $gp.svgmin({
        js2svg: {
          pretty: true
        },
        plugins: [

        ]
      })
    )
    .pipe(
      $gp.cheerio({
        run($) {
          $("[fill], [stroke], [style], [width], [height]")
            .removeAttr("fill")
            .removeAttr("stroke")
            .removeAttr("style");
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe($gp.replace("&gt;", ">"))
    .pipe(
      $gp.svgSprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg"
          }
        }
      })
    )
    .pipe(gulp.dest(PATHS.svg.dest));
});

// pug
gulp.task('pug', () => {
  // const locals = require('./content.json')

  return gulp.src(PATHS.templates.pages)
    .pipe($gp.plumber())
    .pipe(
      $gp.pug({
        pretty: true,
        // locals: JSON.parse(fs.readFileSync('./content.json', 'utf-8'))
        // locals: locals
      })
    )
    .pipe(gulp.dest(PATHS.root));
});

// style hash
gulp.task('style-hash', () => {
  return gulp.src(PATHS.templates.html)
    .pipe($gp.plumber())
    .pipe($gp.if(env === "production", $gp.htmlReplace({
      'css': `/styles/main-${stringHash}.min.css`
    })))
    .pipe(gulp.dest(PATHS.templates.dest));
});

// styles
gulp.task('styles', () => {
  return gulp.src(PATHS.styles.main)
    .pipe($gp.sourcemaps.init())
    .pipe($gp.plumber())
    .pipe($gp.sassGlob())
    .pipe($gp.sass().on('error', $gp.sass.logError))
    .pipe($gp.autoprefixer({ cascade: false }))
    .pipe(
      $gp.cssUnit({
        type: 'px-to-rem',
        rootSize: 16,
        ignorePATHS: 'data:image/',
      })
    )
    // .pipe($gp.postcss(require("./postcss.config")))
    .pipe($gp.if(env === "production", $gp.rename(`main-${stringHash}.min.css`)))
    .pipe($gp.if(env === "production", $gp.cssnano()))
    .pipe($gp.if(env === "development", $gp.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.styles.dest));
});

// gulp.task('css', () => {
//   return gulp.src(PATHS.styles.pxtorem)
//     .pipe($gp.pxtorem({
//         rootValue: 16,
//         propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
//         selectorBlackList: [],
//         replace: true,
//         mediaQuery: false,
//     }, { map: true }))
//     .pipe(gulp.dest(PATHS.styles.dest));
// });

// includ inline svg
gulp.task('inline-svg', () => {
  return gulp.src(PATHS.svg.src)
    .pipe($gp.sassvg({
      outputFolder: PATHS.svg.distFile,
      optimizeSvg: true 
    }));
});

// scripts
gulp.task('scripts', () => {
  return gulp.src(PATHS.scripts.src)
    .pipe($gp.plumber())
    .pipe(webpackStream({...require('./webpack.config'), mode: env}, webpack))
    .pipe(gulp.dest(PATHS.scripts.dest));
});

// File where the favicon markups are stored
let FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generateFavicon', (done) => {
	$gp.realFavicon.generateFavicon({...require('./favicon.config')}, () => {
		done();
	});
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('injectFaviconMarkups', () => {
	return gulp.src([PATHS.templates.dest + '/*.html'])
		.pipe($gp.realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest(PATHS.root));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('checkForFaviconUpdate', (done) => {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	$gp.realFavicon.checkForUpdates(currentVersion, (err) => {
		if (err) {
			throw err;
		}
	});
});

// Dev favicon
gulp.task('dev-favicon', () => {
	return gulp.src(PATHS.favicon.dev)
		.pipe(gulp.dest(PATHS.root));
});

// watch
gulp.task('watch', () => {
  gulp.watch(PATHS.styles.src, gulp.series('styles'));
  gulp.watch(PATHS.templates.src, gulp.series('pug'));
  gulp.watch(PATHS.scripts.src, gulp.series('scripts'));
  gulp.watch([PATHS.images.src, `!${PATHS.images.icons}`], gulp.series('images'));
  gulp.watch(PATHS.sprite.src, gulp.series('sprite'));
  gulp.watch(PATHS.svg.src, gulp.series('svg', 'inline-svg'));
  gulp.watch(PATHS.fonts.src, gulp.series('fonts'));
});

// GULP:DEV
gulp.task('default', 
  gulp.series(
    'clean',
    'sprite',
    'svg',
    gulp.parallel(
      gulp.series('inline-svg', 'styles'),
      gulp.series('pug', 'scripts'),
      'dev-favicon', 
      'images', 
      'fonts'
    ),
    gulp.parallel('watch', 'server')
  )
);

// GULP:BUILD
gulp.task('build', 
  gulp.series(
    'clean',
    'generateFavicon',
    'sprite',
    'svg',
    gulp.parallel(
      gulp.series('inline-svg', 'styles'), 
      gulp.series('pug', 'style-hash', 'injectFaviconMarkups', 'scripts'), 
      'images', 
      'fonts'
    ),
    gulp.parallel('server')
  )
);