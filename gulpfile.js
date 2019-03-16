const gulp = require('gulp');
const gutil = require('gulp-util');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {merge} = require('event-stream');
const map = require('map-stream');
const {spawn} = require('child_process');
const $ = require('gulp-load-plugins')();
const uglify = require('gulp-uglify-es').default;

// Tasks
gulp.task('clean', () => {
  return pipe(
    './tmp',
    $.clean()
  );
});

gulp.task('build', (cb) => {
  $.runSequence('clean', 'chrome', cb);
});

gulp.task('default', ['build'], () => {
  gulp.watch([ './src/**/*', './package.json'], ['default']);
});

gulp.task('dist', ['build'], (cb) => {
  $.runSequence('chrome:zip', 'chrome:crx', cb);
});

// Chrome
gulp.task('chrome:template', () => {
  return buildTemplate({SUPPORT_FILE_ICONS: true, SUPPORT_GHE: true});
});

gulp.task('chrome',  () => {
  const dest = './tmp/chrome'; 
  return merge(
    pipe(
      './icons/**/*',
      `${dest}/img`
    ),
    pipe(
      [
        './src/**/*'
      ],
      dest
    ),  
    pipe(
      './src/manifest.json',
      $.replace('$VERSION', getVersion()),
      dest
    )
  );
});

gulp.task('chrome:zip', () => {
  return pipe(
    './tmp/chrome/**/*',
    $.zip('chrome.zip'),
    './dist'
  );
});

gulp.task('chrome:crx', () => {
  // This will package the crx using a private key.
  // For the convenience of people who want to build locally without having to
  // Manage their own Chrome key, this code will use the bundled test key if
  // A real key is not found in ~/.ssh.
  const real = path.join(os.homedir() + '.ssh/chrome.pem');
  const test = './src.pem';
  const privateKey = fs.existsSync(real) ? fs.readFileSync(real) : fs.readFileSync(test);

  return pipe(
    './tmp/chrome',
    $.crxPack({
      privateKey: privateKey,
      filename: 'chrome.crx'
    }),
    './dist'
  );
});

// Helpers
function pipe(src, ...transforms) {
  const work = transforms.filter((t) => !!t).reduce((stream, transform) => {
    const isDest = typeof transform === 'string';
    return stream.pipe(isDest ? gulp.dest(transform) : transform).on('error', (err) => {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
  }, gulp.src(src));

  return work;
}

function html2js(template) {
  return map(escape);

  function escape(file, cb) {
    const path = $.util.replaceExtension(file.path, '.js');
    const content = file.contents.toString();
    /* eslint-disable quotes */
    const escaped = content
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r?\n/g, "\\n' +\n    '");
    /* eslint-enable */
    const body = template.replace('$$', escaped);

    file.path = path;
    file.contents = new Buffer(body);
    cb(null, file);
  }
}

function buildJs(overrides, ctx) {
  const src = [ 
    './src/background.js',
    './src/jquery.1.11.3.min.js',
    './src/myscript.js',
    './src/popup.js',
  ] 

  return pipe(
    src, 
    $.preprocess({context: ctx}),
    gutil.env.production && uglify(),
    './tmp'
  );
}
 

function getVersion() {
  delete require.cache[require.resolve('./package.json')];
  return require('./package.json').version;
}
