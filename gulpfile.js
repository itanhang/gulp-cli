const gulp = require('gulp');

const less = require('gulp-less'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cssmin = require('gulp-clean-css');

const imagemin = require('gulp-imagemin'),
  spritesmith = require('gulp.spritesmith');

const babel = require('gulp-babel');
const fileinclude = require('gulp-file-include');

const buffer = require('vinyl-buffer');
const merge = require('merge-stream');
const sequence = require('gulp-sequence');
const browserSync = require('browser-sync').create(),
  reload = browserSync.reload;

const PATH = { DEV: 'src', BUILD: 'dist' };

/**
 * HTML页面
 * source: src/pages
 * output: dist/
 */
gulp.task('html', () => {
  let _source = PATH.DEV + '/pages/**/*.html';
  let _output = PATH.BUILD;

  return gulp.src(_source)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true
    }))
    .on('error', e => {
      console.error(e.message);
      this.emit('end');
    })
    .pipe(gulp.dest(_output))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * CSS 网站样式
 * source: src/static/css
 * output: dist/static/css
 */
gulp.task('style', () => {
  let _source_less = PATH.DEV + '/static/css/*.less';
  let _source_css = PATH.DEV + '/static/css/*.css';
  let _output = PATH.BUILD + '/static/css';

  let plugins = [
    autoprefixer({ browsers: ['last 2 version', 'Firefox >= 15'] })
  ];

  let lessStream = gulp.src(_source_less)
    .pipe(less().on('error', e => {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(cssmin({compatibility: 'ie8'}))
    .pipe(postcss(plugins))
    .pipe(gulp.dest(_output))
    .pipe(browserSync.reload({ stream: true }));
  let cssStream = gulp.src(_source_css)
    .pipe(gulp.dest(_output))
    .pipe(browserSync.reload({ stream: true }));
  
  return merge(lessStream, cssStream);
});

/**
 * JS 脚本
 * source: src/script/js
 * output: dist/static/js
 */
gulp.task('script', () => {
  let _source = PATH.DEV + '/static/js/**/*.js';
  let _output = PATH.BUILD + '/static/js';
  return gulp.src(_source)
    .pipe(babel({
      presets: ['env']
    }))
    .on('error', e => {
      console.error(e.message);
      this.emit('end');
    })
    .pipe(gulp.dest(_output))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * images 图片
 * source: src/static/images
 * output: dist/static/images
 */
gulp.task('images', () => {
  let _source = PATH.DEV + '/static/images/**/*.{png,jpg,gif,svg}';
  let _output = PATH.BUILD + '/static/images';
  return gulp.src(_source)
    .pipe(imagemin())
    .pipe(gulp.dest(_output))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * 合成雪碧图
 * source: src/sprite
 * output: css => src/static/css/sprite
 *         image => dist/static/images
 */
gulp.task('sprite', () => {
  let _source = PATH.DEV + '/sprite/*.{png,jpg}';
  let _output = PATH.BUILD + '/static/images';

  let spriteData = gulp.src(_source).pipe(spritesmith({
    imgName: '../images/sprite.png',
    cssName: 'style.less'
  }));

  let cssStream = spriteData.css
    .pipe(gulp.dest(PATH.DEV + '/static/css/sprite'));
  let imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(_output));

  return merge(imgStream, cssStream);
});

/**
 * fonts 字体
 * source: src/static/fonts
 * output: dist/static/fonts
 */
gulp.task('fonts', () => {
  let _source = PATH.DEV + '/static/fonts/**/*';
  let _output = PATH.BUILD + '/static/fonts';
  return gulp.src(_source)
    .pipe(gulp.dest(_output))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build', sequence(['sprite'], 'images', 'script', 'style', 'html', 'fonts'));

gulp.task('watch', () => {
  gulp.watch(PATH.DEV + '/include/**/*.html', ['html']);
  gulp.watch(PATH.DEV + '/pages/**/*.html', ['html']);
  gulp.watch(PATH.DEV + '/static/css/*.less', ['style']);
  gulp.watch(PATH.DEV + '/static/js/**/*.js', ['script']);
  gulp.watch(PATH.DEV + '/static/images/**/*.{png,jpg,gif,svg}', ['images']);
  gulp.watch(PATH.DEV + '/sprite/*.{png,jpg}', ['sprite']);
  gulp.watch(PATH.DEV + '/static/fonts/**/*', ['fonts']);
});

gulp.task('default', ['build','watch'], () => {
  browserSync.init({
    server: PATH.BUILD
  });
});
