var site = new Site({
  images: {
    count: 240,
    lo_path: "images/bg/lo/",
    hi_path: "images/bg/hi/",
    prefix: "image-",
    ext: ".jpg"
  },
  progress: {
    loader: document.getElementById("loader"),
    loaderPrism: document.querySelector("#loader .prism"),
    loaderMessage: document.querySelector("#loader .message"),
    indicator: document.getElementById("indicator"),
    completeClassName: "loaded"
  },
  background: {
    element: document.getElementById("background")
  },
  components: [
    {
      el: document.getElementById("test"),
      visible: false,
      activeClass: "active",
      in_frame: 60,
      out_frame: 200,
      in_method: function() {
        this.el.className += " " + this.activeClass;
        this.visible = true;
      },
      out_method: function() {
        this.el.className = this.el.className.replace(this.activeClass, "");
        this.visible = false;
      },
      const: function(frame) {

      }

    }
  ]
});

// initialize our site
site.init();

// site class
function Site(params) {

  var app = {

    mode: undefined,

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
      scrolling: false,
      currentFrame: 1,
      percent: 0
    },

    background: {
      element: params.background.element
    },

    init: function() {
      this.mode = this.detectMode();
      this.preloadImages();
    },

    detectMode: function() {
      return "full";
    },


    loader: function() {
      var app = this,
          decimal = Math.round(app.images.loaded.count / app.images.count * 100);
      var transformDeg = -360 * (decimal / 100) + 45;
      app.progress.loaderPrism.style.webkitTransform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderPrism.style.transform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderMessage.innerHTML = decimal + "%";
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
          document.body.className += "loaded";
          console.debug("Lo Res Images Loaded", app.images.loaded.count);
          if (app.images.loaded.partial) console.warn("Not All Images Loaded Successfully");
        }
      }
    },


    setImage: function(img) {
      var context = this.background.element.getContext("2d");
      // image, x, y, width, height
      context.drawImage(img, 0, 0, 1280, 720);
    },



    loadHiRes: debounce(function() {
        app.progress.scrolling = false;

        console.debug("Mousewheel Complete");
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
      var inc = 0.5;

      if (delta <= -1) app.progress.currentFrame -= inc;
      if (delta >= 1) app.progress.currentFrame += inc;
      if (app.progress.currentFrame < 1) app.progress.currentFrame = 1;
      if (app.progress.currentFrame > app.images.data.length) app.progress.currentFrame = app.images.data.length;

      var ratio = (app.progress.currentFrame - 1) / (app.images.data.length - 1);
      app.progress.percent = Math.round(ratio * 1000) / 1000;
      app.progress.indicator.style.bottom = ((1 - app.progress.percent) * 90) + 5 + "%";

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

      // scene control
      app.sceneController();

      // See below for the details of this function
      app.setImage(app.images.data[Math.round(app.progress.currentFrame) - 1]);

      // swap in hi res image when stopped
      app.loadHiRes();

    },


    imagesLoadedHandler: function() {

      app.progress.currentFrame = 0;

      window.addEventListener("wheel", app.scrollHandler);

    },


    components: params.components,

    sceneController: function() {
      var frame = app.progress.currentFrame;

      for(var i = 0; i < app.components.length; i++) {
        var component = app.components[i];
        if (frame >= component.in_frame && frame < component.out_frame && !component.visible) {
          component.in_method();
        } else if ((frame < component.in_frame || frame >= component.out_frame) && component.visible) {
          component.out_method();
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