var site = new Site();
site.init();

function Site() {
  return {

    mode: undefined,

    images: {
      count: 240,
      path: "images/bg/", lo_path: "lo/", hi_path: "hi/", prefix: "image-", ext: ".jpg",
      loaded: {
        count: 0, val: false, partial: false
      },
      data: new Array()
    },

    progress: {
      loader: document.getElementById('loader'),
      indicator: document.getElementById('indicator'),
      scrolling: false,
      currentLocation: 0,
      percent: 0
    },

    background: {
      element: document.getElementById('background')
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

      var app = this;

      if (app.mode == "full") {
        for (var i = 1; i <= app.images.count; i++) {
          var path = [app.images.path, app.images.lo_path, app.images.prefix, i, app.images.ext].join(""),
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
          console.log(app.images.loaded.count);
        }
      }
    },

    setImage: function(img) {
      var context = this.background.element.getContext('2d');
      // image, x, y, width, height
      context.drawImage(img, 0, 0, 1280, 720);
    },


    imagesLoadedHandler: function () {
      var app = this;

      app.progress.currentLocation = 0;

      var loadHiRes = debounce(function() {
        app.progress.scrolling = false;

        console.debug("Mousewheel Complete");
        var path = [app.images.path, app.images.hi_path, app.images.prefix, app.progress.currentLocation + 1, app.images.ext].join(""),
            img = new Image();

        img.src = path;
        img.onload = function() {
          console.debug("Hi Res Loaded");
          app.setImage(img);
        }

      }, 250);

      window.addEventListener('mousewheel', function(e) {

        e.preventDefault(); // No scroll

        // set scrolling state
        if (!app.progress.scrolling) app.progress.scrolling = true;

        // technique
        // https://elikirk.com/canvas-based-scroll-controlled-backgroud-video-use-parallax-style-web-design/
        // The following equation will return either a 1 for scroll down
        // or -1 for a scroll up
        var delta = Math.max(-1, Math.min(1, e.wheelDelta));
        // This code mostly keeps us from going too far in either direction
        if (delta == -1) app.progress.currentLocation += 1;
        if (delta == 1) app.progress.currentLocation -= 1;
        if (app.progress.currentLocation < 0) app.progress.currentLocation = 0;
        if (app.progress.currentLocation >= app.images.data.length) app.progress.currentLocation = app.images.data.length - 1;

        app.progress.percent = (app.progress.currentLocation / app.images.data.length);
        app.progress.indicator.style.bottom = ((1 - app.progress.percent) * 90) + 5 + "%";

        // See below for the details of this function
        app.setImage(app.images.data[app.progress.currentLocation]);

        // swap in hi res image
        loadHiRes();

      });

    }

  };
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