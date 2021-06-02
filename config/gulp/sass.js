const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const discardComments = require("postcss-discard-comments");
const filter = require("gulp-filter");
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixerOptions = require("./browsers");
const dutil = require("./doc-util");
const pkg = require("../../package.json");

const task = "sass";

const IGNORE_STRING = "This file is ignored";

gulp.task("copy-vendor-sass", () => {
  dutil.logMessage("copy-vendor-sass", "Compiling vendor CSS");

  const normalizeCssFilter = filter("**/normalize.css", { restore: true });
  const stream = gulp
    .src([
      "./node_modules/normalize.css/normalize.css",
      "./node_modules/bourbon/app/assets/stylesheets/**/*.scss",
      "./node_modules/bourbon-neat/app/assets/stylesheets/**/*.scss"
    ])
    .pipe(normalizeCssFilter)
    .pipe(rename("_normalize.scss"))
    .pipe(normalizeCssFilter.restore)
    .on("error", error => {
      dutil.logError("copy-vendor-sass", error);
    })
    .pipe(gulp.dest("src/stylesheets/lib"));

  return stream;
});

gulp.task("copy-dist-sass", () => {
  dutil.logMessage("copy-dist-sass", "Copying all Sass to dist dir");

  const stream = gulp
    .src("src/stylesheets/**/*.scss")
    .pipe(gulp.dest("dist/scss"));

  return stream;
});

gulp.task(
  "sass",
  gulp.series("copy-vendor-sass", () => {
    dutil.logMessage(task, "Compiling Sass");
    const pluginsProcess = [
      discardComments(),
      autoprefixer(autoprefixerOptions)
    ];
    const pluginsMinify = [
      autoprefixer(autoprefixerOptions),
      csso({ forceMediaMerge: false })
    ];

    return gulp
      .src("src/stylesheets/uswds.scss")
      .pipe(sourcemaps.init({ largeFile: true }))
      .pipe(
        sass({
          outputStyle: "expanded"
        }).on("error", sass.logError)
      )
      .pipe(postcss(pluginsProcess))
      .pipe(replace(/\buswds @version\b/g, `uswds v${pkg.version}`))
      .pipe(gulp.dest("dist/css"))
      .pipe(postcss(pluginsMinify))
      .pipe(
        rename({
          suffix: ".min"
        })
      )
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest("dist/css"));
  })
);
