"use strict";

// include gulp
var gulp = require("gulp");

// include plugins
var plugins = require("gulp-load-plugins")({
  pattern: ["gulp-*", "gulp.*", "run-sequence", "imagemin-pngquant"],
  replaceString: /\bgulp[\-.]/
});

// default destination
var dest = "dist/";

// connect server
gulp.task("connect", function() {
  plugins.connect.server({ root: dest, port: 4000, livereload: true });
});

// html
gulp.task("html", function() {
  gulp
    .src("src/html/*.html")
    .on("error", errorHandler)
    // destination
    .pipe(gulp.dest(dest))
    // reload connect server
    .pipe(plugins.connect.reload());
});

// scss
gulp.task("scss", function() {
  gulp
    .src(["src/scss/*.scss", "src/scss/**/*.scss"])

    // source mapping
    .pipe(plugins.sourcemaps.init())

    // sass
    .pipe(plugins.sass({ style: "compact" }))
    .on("error", errorHandler)
    // autoprefixer
    .pipe(plugins.autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))

    // source mapping
    .pipe(
      plugins.sourcemaps.write("maps", {
        includeContent: false,
        sourceRoot: "/src/scss"
      })
    )

    .pipe(gulp.dest(dest + "css"))

    // rename to min
    .pipe(plugins.rename({ suffix: ".min" }))
    // minify css
    .pipe(
      plugins.minifyCss({
        compatibility: "ie8"
      })
    )
    .on("error", errorHandler)
    .pipe(gulp.dest(dest + "css"))
    // reload connect server
    .pipe(plugins.connect.reload());
});

// javascript
gulp.task("js", function() {
  // ordered javascript
  var jsFiles = ["src/js/src/*.js", "src/js/src/**/*.js"];

  gulp
    .src(jsFiles)

    // source mapping
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))

    // concat files
    .pipe(plugins.concat("script.js"))
    // destination
    .pipe(gulp.dest(dest + "js"))
    // being minify
    .pipe(plugins.rename({ suffix: ".min" }))
    // uglify
    .pipe(plugins.uglify())
    .on("error", errorHandler)

    // source mapping
    .pipe(plugins.sourcemaps.write("maps"))

    .pipe(gulp.dest(dest + "js"))

    // reload connect server
    .pipe(plugins.connect.reload());
});

// images
gulp.task("images", function() {
  return (
    gulp
      .src(["src/images/*"])
      .pipe(
        plugins.imagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [plugins.imageminPngquant()]
        })
      )
      .pipe(gulp.dest("dist/images"))

      // reload connect server
      .pipe(plugins.connect.reload())
  );
});

// watch tasks
gulp.task("watch", function() {
  gulp.watch(["src/html/*.html"], ["html"]);
  gulp.watch(["src/scss/*.scss", "src/scss/**/*.scss"], ["scss"]);
  gulp.watch(["src/js/*.js", "src/js/src/*.js", "src/js/src/**/*.js"], ["js"]);
  gulp.watch(["src/images/*"], ["images"]);
});

// initialize tasks
gulp.task("initialize", function() {
  plugins.runSequence("html", "scss", "js", "images");
});

// default task
gulp.task("default", ["initialize", "connect", "watch"]);

// Handle the error
function errorHandler(error) {
  console.log(error.toString());
  this.emit("end");
}
