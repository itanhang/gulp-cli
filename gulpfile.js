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

const chalk = require('chalk');

const PATH = { DEV: 'src', BUILD: 'dist' };

/**
 * HTML页面
 * sourcePath: {@dev} /views
 * outputPath: {@build} /
 */
gulp.task('html', () => {
  let _source = PATH.DEV + '/views/**/*.html';
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
 * sourcePath: {@dev} /static/css
 * outputPath: {@build} /static/css
 */
gulp.task('style', () => {
  let _source = PATH.DEV + '/static/css/*.less';
  let _output = PATH.BUILD + '/static/css';

  let plugins = [
    autoprefixer({ browsers: ['last 2 version', 'Firefox >= 15'] })
  ];
  return gulp.src(_source)
    .pipe(less().on('error', e => {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(cssmin({compatibility: 'ie8'}))
    .pipe(postcss(plugins))
    .pipe(gulp.dest(_output))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * JS 脚本
 * sourcePath: {@dev} /script/js
 * outputPath: {@build} /static/js
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
 * sourcePath: {@dev} /static/images
 * outputPath: {@build} /static/images
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
 * sourcePath: {@dev} /sprite
 * outputPath: css => {@build} /static/css/sprite
 *             image => {@build} /static/images
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

gulp.task('build', sequence(['sprite'], 'images', 'script', 'style', 'html'));

gulp.task('watch', () => {
  gulp.watch(PATH.DEV + '/views/**/*.html', ['html']);
  gulp.watch(PATH.DEV + '/static/css/*.less', ['style']);
  gulp.watch(PATH.DEV + '/static/js/**/*.js', ['script']);
  gulp.watch(PATH.DEV + '/static/images/**/*.{png,jpg,gif,svg}', ['images']);
  gulp.watch(PATH.DEV + '/sprite/*.{png,jpg}', ['sprite']);
});

gulp.task('default', ['build','watch'], () => {
  browserSync.init({
    server: PATH.BUILD
  });
});
