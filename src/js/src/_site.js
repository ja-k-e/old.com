// site class
function Site(params) {

  var app = {

    mode: undefined,
    looping: undefined,

    images: {
      count: params.images.count,
      lo_path: params.images.lo_path,
      hi_path: params.images.hi_path,
      prefix: params.images.prefix,
      ext: params.images.ext,
      loaded: {
        count: 0, val: false, partial: false
      },
      data: new Array()
    },

    progress: {
      loader: params.progress.loader,
      loaderPrism: params.progress.loaderPrism,
      loaderMessage: params.progress.loaderMessage,
      completeClassName: params.progress.completeClassName,
      indicator: params.progress.indicator,
      indicatorContainer: params.progress.indicatorContainer,
      scrolling: false,
      direction: "down",
      currentFrame: 1,
      percent: 0
    },

    background: {
      element: params.background.element
    },

    sections: params.sections,


    init: function() {
      app.mode = app.detectMode();
      app.preloadImages();
      app.loadNav();
    },

    detectMode: function() {
      return "full";
    },

    loadNav: function() {
      // navigation
      for (var i = 0; i < app.sections.length; i++) {
        (function() {
          var comp = app.sections[i],
              frame = comp.in_frame + ((comp.out_frame - comp.in_frame) / 2),
              dash = document.createElement("span");
          dash.addEventListener("click", function() {
            app.goToFrame(frame + 2);
          }, false);
          dash.style.top = comp.in_frame / app.images.count * 100 + "%";
          dash.style.bottom = 100 - comp.out_frame / app.images.count * 100 + "%";
          app.progress.indicatorContainer.appendChild(dash);
        }())
      }
    },


    loader: function() {
      var app = this,
          decimal = Math.round(app.images.loaded.count / app.images.count * 100);
      var transformDeg = -360 * (decimal / 100) + 45;
      app.progress.loaderPrism.style.webkitTransform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderPrism.style.transform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderMessage.innerHTML = decimal + "%";
    },


    goToFrame: function(which) {
      var distance = which - app.progress.currentFrame,
          move;
      if (distance > 0) {
        console.log("> 0",distance);
        move = function() {
          setTimeout(function() {
            if(app.progress.currentFrame < which) {
              console.log(app.progress.currentFrame);
              app.progressHandler(1);
              app.progress.currentFrame++;
              move();
            } else {
              clearTimeout(move);
            }
          }, 30);
        }
      } else {
        console.log("<= 0",distance);
        move = function() {
          setTimeout(function() {
            if(app.progress.currentFrame > which) {
              app.progressHandler(-1);
              app.progress.currentFrame--;
              move();
            } else {
              clearTimeout(move);
            }
          }, 30);
        }
      }
      move();
    },


    preloadImages: function() {

      if (app.mode == "full") {
        for (var i = 1; i <= app.images.count; i++) {
          var path = [app.images.lo_path, app.images.prefix, i, app.images.ext].join(""),
              img = new Image();
          img.src = path;
          img.onload = imageLoad;
          img.onerror = imageLoadError;
          app.images.data.push(img);
        }
      }

      function imageLoadError() {
        app.images.loaded.partial = true;
      }

      function imageLoad() {
        app.images.loaded.count++;
        app.loader();
        if (app.images.loaded.count == app.images.count) {
          app.imagesLoadedHandler();
          app.progress.loader.className += app.progress.completeClassName;
          document.body.className += " loaded";
          console.debug("Lo Res Images Loaded", app.images.loaded.count);
          if (app.images.loaded.partial) console.warn("Not All Images Loaded Successfully");
        }
      }
    },


    setImage: function(img) {
      var context = app.background.element.getContext("2d");
      // image, x, y, width, height
      context.drawImage(img, 0, 0, 1280, 720);
    },



    loopState: function() {
      var i = 0, inc = 1,//0.25,
          distance = 4, direction = 1,
          time = 200;
          images = 0;

      console.log(app.progress.currentFrame);

      app.looping = function() {
        if (app.progress.currentFrame > 60 && app.progress.currentFrame < 203) {
          app.loopTimeout = setTimeout(function() {
            var frame = app.progress.currentFrame;
            // if going up
            if (direction == 1) {
              // if we havent exceeded limit
              if ((i+inc) <= distance) { i += inc; }
              // we have exceeded limit
              else { direction = -1; i -= inc; }
            // going down
            } else {
              // if we havent dipped beneath limit
              if ((i-inc) > distance * -1) { i -= inc; }
              // we have dipped beneath limit
              else { direction = 1; i += inc; }
            }
            // get the image
            var path = [app.images.hi_path, app.images.prefix, Math.round(frame + i), app.images.ext].join(""),
                img = new Image();
                img.src = path;

            // set the image
            app.setImage(img);

            // call it again
            app.looping();
          }, time);
        }

      }
      app.looping();
    },



    loadHiRes: debounce(function() {
        app.progress.scrolling = false;

        console.debug("Mousewheel Complete");

        app.loopState();

        var path = [app.images.hi_path, app.images.prefix, Math.round(app.progress.currentFrame), app.images.ext].join(""),
            img = new Image();

        img.src = path;
        img.onload = function() {
          console.debug("Hi Res Loaded");
          app.setImage(img);
        }

      }, 500),



    progressHandler: function(delta) {
      // technique from:
      // https://elikirk.com/canvas-based-scroll-controlled-backgroud-video-use-parallax-style-web-design/

      // animation rate
      var inc = 0.25,
          direction = "";

      clearTimeout(app.loopTimeout);

      if (delta <= -1) { direction = "up"; app.progress.currentFrame -= inc ; }
      if (delta >= 1) { direction = "down"; app.progress.currentFrame += inc; }
      if (app.progress.currentFrame < 1) app.progress.currentFrame = 1;
      if (app.progress.currentFrame > app.images.data.length) app.progress.currentFrame = app.images.data.length;

      if (direction != app.progress.direction) {
        document.body.className = document.body.className.replace(" " + app.progress.direction, "");
        document.body.className += " " + direction;
        app.progress.direction = direction;
      }

      var ratio = (app.progress.currentFrame - 1) / (app.images.data.length - 1);
      app.progress.percent = Math.round(ratio * 1000) / 1000;
      app.progress.indicator.style.bottom = ((1 - app.progress.percent) * 100) + "%";

      // scene control
      app.sceneController();

      // See below for the details of this function
      app.setImage(app.images.data[Math.round(app.progress.currentFrame) - 1]);

      // swap in hi res image when stopped
      app.loadHiRes();

      // console.debug("Current Frame:", app.progress.currentFrame);
    },



    scrollHandler: function(e) {

      e.preventDefault(); // No scroll

      // set scrolling state
      if (!app.progress.scrolling) app.progress.scrolling = true;


      // set progress
      // var delta = Math.max(-1, Math.min(1, e.wheelDelta));
      var delta = e.deltaY;
      app.progressHandler(delta);

    },


    imagesLoadedHandler: function() {

      app.progress.currentFrame = 1;

      window.addEventListener("wheel", app.scrollHandler);

    },

    sceneController: function() {
      var frame = app.progress.currentFrame;

      for(var i = 0; i < app.sections.length; i++) {
        var section = app.sections[i];
        if (frame >= section.in_frame && frame < section.out_frame && !section.visible) {
          section.el.className += " active";
          section.visible = true;
        } else if ((frame < section.in_frame || frame >= section.out_frame) && section.visible) {
          section.el.className = section.el.className.replace(" active", "");
          section.visible = false;
        }
      }
    }

  };

  return app;
}



/*
 * utilities
 */

/*
 * Debounce, courtesy of David Walsh
 * http://davidwalsh.name/javascript-debounce-function
 */

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

/*
 * usage
 */

/*
  var myEfficientFn = debounce(function() {
    // All the taxing stuff you do
  }, 250);

  window.addEventListener("resize", myEfficientFn);
 */

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};