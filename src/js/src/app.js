var site = new Site({
  images: {
    count: 240,
    lo_path: "images/bg/lo/",
    hi_path: "images/bg/hi/",
    prefix: "image-",
    ext: ".jpg"
  },
  progress: {
    loader: document.getElementById('loader'),
    indicator: document.getElementById('indicator')
  },
  background: {
    element: document.getElementById('background')
  }
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
      indicator: params.progress.indicator,
      scrolling: false,
      currentFrame: 1,
      percent: 0
    },

    background: {
      element: params.background.element
    },

    init: function () {
      this.mode = this.detectMode();
      this.preloadImages();
    },

    detectMode: function() {
      return "full";
    },


    loader: function() {
      var app = this,
          decimal = Math.round(app.images.loaded.count / app.images.count * 100);
      app.progress.loader.innerHTML = decimal + "%";
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
          console.debug("Lo Res Images Loaded", app.images.loaded.count);
          if (app.images.loaded.partial) console.warn("Not All Images Loaded Successfully");
        }
      }
    },

    setImage: function(img) {
      var context = this.background.element.getContext('2d');
      // image, x, y, width, height
      context.drawImage(img, 0, 0, 1280, 720);
    },



    loadHiRes: debounce(function() {
        app.progress.scrolling = false;

        console.debug("Mousewheel Complete");
        var path = [app.images.hi_path, app.images.prefix, app.progress.currentFrame, app.images.ext].join(""),
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

      if (delta == -1) app.progress.currentFrame += 1;
      if (delta == 1) app.progress.currentFrame -= 1;
      if (app.progress.currentFrame <= 0) app.progress.currentFrame = 1;
      if (app.progress.currentFrame > app.images.data.length) app.progress.currentFrame = app.images.data.length;

      var ratio = (app.progress.currentFrame - 1) / (app.images.data.length - 1);
      app.progress.percent = Math.round(ratio * 1000) / 1000;
      app.progress.indicator.style.bottom = ((1 - app.progress.percent) * 90) + 5 + "%";

      console.debug("Current Frame:", app.progress.currentFrame);
    },



    scrollHandler: function(e) {

      e.preventDefault(); // No scroll

      // set scrolling state
      if (!app.progress.scrolling) app.progress.scrolling = true;


      // set progress
      var delta = Math.max(-1, Math.min(1, e.wheelDelta));
      app.progressHandler(delta);

      // scene control
      app.sceneController();

      // See below for the details of this function
      app.setImage(app.images.data[app.progress.currentFrame - 1]);

      // swap in hi res image when stopped
      app.loadHiRes();

    },


    imagesLoadedHandler: function () {

      app.progress.currentFrame = 0;

      window.addEventListener('mousewheel', app.scrollHandler);

    },


    components: {
      test: {
        el: document.getElementById('test'),
        in: {
          frame: 60,
          method: function () {

          }
        },
        out: {
          frame: 200,
          method: function () {

          }
        },
        const: function(frame) {

        },
        visible: false,

      }
    },

    sceneController: function () {
      var frame = app.progress.currentFrame;

      if (frame >= app.components.test.in.frame && frame < app.components.test.out.frame && !app.components.test.visible) {
        console.log(app.components.test.el.className);
        app.components.test.el.className = "component visible";
        app.components.test.visible = true;
      } else if ((frame < app.components.test.in.frame || frame >= app.components.test.out.frame) && app.components.test.visible) {
        app.components.test.el.className = "component";
        app.components.test.visible = false;

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

  window.addEventListener('resize', myEfficientFn);
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