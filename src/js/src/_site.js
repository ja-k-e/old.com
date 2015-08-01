// site class
function Site(params) {

  var app = {

    // initialization
    init: function() {
      app.mode = app.detectMode();
      addClass(document.body, app.mode);
      app.preloadImages();
      app.prismMenuSetup();
      if (app.mode == "full") app.loadNavigation();
    },


    // detect full animation or static mode
    detectMode: function() {
      var mobileOrTablet = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))mobileOrTablet = true})(navigator.userAgent||navigator.vendor||window.opera);
      if (mobileOrTablet) {
        return "scroll";
      } else {
        return "full";
      }
    },


    // load the progress navigation
    loadNavigation: function() {
      // first span
      navItem(1);
      // remaining navigation
      for (var i = 0; i < app.sections.length; i++) {
        (function() {
          var comp = app.sections[i];
          navItem(comp.in_frame + (comp.out_frame - comp.in_frame) / 2);
        }())
      }
      // last span
      navItem(app.frames.count - 1);

      // navigation
      function navItem(to_frame) {
        var navItem = document.createElement("span");
        navItem.id = "nav-item-" + to_frame;
        navItem.setAttribute("data-frame",to_frame);
        navItem.addEventListener("click", function() {
          app.goToFrame(to_frame);
        }, false);
        navItem.style.top = Math.round(to_frame / app.frames.count * 10000) / 100 + "%";
        app.progress.navItems.push(navItem);
        app.progress.indicatorContainer.appendChild(navItem);
      }

    },


    // progress loader
    animateProgressLoader: function() {
      var app = this,
          decimal = Math.round(app.frames.loaded.count / app.frames.count * 100);
      var transformDeg = -360 * (decimal / 100) + 45;
      app.progress.loaderPrism.style.webkitTransform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderPrism.style.transform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderMessage.innerHTML = decimal + "%";
    },


    // setup prism menu
    prismMenuSetup: function() {
      app.progress.spinnerPrism.addEventListener("click", function() {
        toggleClass(app.progress.prismMenu, "open");
      });
    },


    // spin prism menu on progress
    spinPrism: function() {
      var amount = -360 * ((app.progress.currentFrame - 1) / (app.frames.count - 1)) + 45;
      var transform = "rotateX("+amount+"deg) rotateY("+amount+"deg)";
      app.progress.spinnerPrism.style.webkitTransform = transform;
      app.progress.spinnerPrism.style.transform = transform;
    },


    // jump to a specific frame
    goToFrame: function(which) {
      var distance = which - app.progress.currentFrame,
          move;
      if (!app.goingToFrame) {
        app.goingToFrame = true;
        if (distance > 0) {
          move = function() {
            setTimeout(function() {
              if(app.progress.currentFrame < which) {
                app.progressHandler(1);
                app.progress.currentFrame++;
                move();
              } else {
                app.goingToFrame = false;
                app.sceneController();
                clearTimeout(move);
              }
            }, 30);
          }
        } else {
          move = function() {
            setTimeout(function() {
              if(app.progress.currentFrame > which) {
                app.progressHandler(-1);
                app.progress.currentFrame--;
                move();
              } else {
                app.goingToFrame = false;
                app.sceneController();
                clearTimeout(move);
              }
            }, 30);
          }
        }
        move();
      }
    },


    // preload lo res images for animation
    preloadImages: function() {

      if (app.mode == "full") {
        for (var i = 1; i <= app.frames.count; i++) {
          var path = [app.frames.lo_path, app.frames.prefix, i, app.frames.ext].join(""),
              img = new Image();
          img.src = path;
          img.onload = imageLoad;
          img.onerror = imageLoadError;
          app.frames.data.push(img);
        }
      }

      function imageLoadError() {
        app.frames.loaded.partial = true;
      }

      function imageLoad() {
        app.frames.loaded.count++;
        app.animateProgressLoader();
        if (app.frames.loaded.count == app.frames.count) {
          app.imagesLoadedHandler();
          addClass(app.progress.loader, app.progress.completeClassName);
          addClass(document.body, "loaded");
          console.debug("Lo Res Images Loaded", app.frames.loaded.count);
          if (app.frames.loaded.partial) console.warn("Not All Images Loaded Successfully");
        }
      }
    },


    // sets an image to the canvas
    setImage: function(img) {
      var context = app.background.element.getContext("2d");
      // image, x, y, width, height
      context.drawImage(img, 0, 0, 1280, 720);
    },


    // loops through images when wheel movement stops
    loopState: function() {
      var i = 0, inc = 1,//0.25,
          distance = 4, direction = 1,
          time = 200;
          images = 0;

      app.looping = function() {
        if (app.progress.currentFrame > 60 && app.progress.currentFrame < 203) {
          app.loopTimeout = setTimeout(function() {
            var frame = app.progress.currentFrame;
            console.log(frame);
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
            var path = [app.frames.hi_path, app.frames.prefix, Math.round(frame + i), app.frames.ext].join(""),
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


    // loads a high resolution image when wheel movement stops
    loadHiRes: debounce(function() {
        app.progress.scrolling = false;

        // console.debug("Wheel Complete");

        app.loopState();

        var path = [app.frames.hi_path, app.frames.prefix, Math.round(app.progress.currentFrame), app.frames.ext].join(""),
            img = new Image();

        img.src = path;
        img.onload = function() {
          console.debug("Hi Res Loaded");
          app.setImage(img);
        }

      }, 500),


    // records direction and state on wheel movement, moves progress indicator
    progressHandler: function(delta) {

      // animation rate
      var inc = app.frames.inc,
          direction = "";

      // clear static loop
      clearTimeout(app.loopTimeout);

      // handle current frame
      if (delta <= -1) { direction = "up"; app.progress.currentFrame -= inc ; }
      if (delta >= 1) { direction = "down"; app.progress.currentFrame += inc; }
      if (app.progress.currentFrame < 1) app.progress.currentFrame = 1;
      if (app.progress.currentFrame > app.frames.data.length) app.progress.currentFrame = app.frames.data.length;

      // handle direction
      if (direction != app.progress.direction) {
        replaceClass(document.body, app.progress.direction, direction);
        app.progress.direction = direction;
      }

      // handle progress
      var ratio = (app.progress.currentFrame - 1) / (app.frames.data.length - 1);
      app.progress.percent = Math.round(ratio * 1000) / 1000;
      app.progress.indicator.style.bottom = (Math.round((1 - ratio) * 10000) / 100) + "%";


      // spin the prism
      app.spinPrism();

      // scene control
      app.sceneController();

      // maybe a random image
      var dice = Math.random(),
          frame = (dice < 0.01) ? (Math.random() * app.frames.count) : app.progress.currentFrame;

      // set the image
      app.setImage(app.frames.data[Math.ceil(frame) - 1]);

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

      for(var i = 0; i < app.progress.navItems.length; i++) {
        var item = app.progress.navItems[i],
            itemFrame = parseInt(item.getAttribute("data-frame"));
        if (app.progress.direction == "down" && frame >= itemFrame) {
          if (!hasClass(item, "active")) addClass(item,"active");
        } else if (app.progress.direction == "up" && frame < itemFrame) {
          removeClass(item, "active");
        }
      }

      for(var i = 0; i < app.sections.length; i++) {
        var section = app.sections[i];
        if (frame >= section.in_frame && frame < section.out_frame && !section.visible) {
          if(!app.goingToFrame) {
            addClass(section.el, "active");
            section.visible = true;
          }
        } else if ((frame < section.in_frame || frame >= section.out_frame) && section.visible) {
          removeClass(section.el, "active");
          section.visible = false;
        }
      }
    },


    //
    // initial data
    //

    mode: undefined,
    looping: undefined,
    goingToFrame: false,

    frames: {
      inc: (/firefox/.test(navigator.userAgent.toLowerCase())) ? 1 : 0.5,
      count: params.frames.count,
      lo_path: params.frames.lo_path,
      hi_path: params.frames.hi_path,
      prefix: params.frames.prefix,
      ext: params.frames.ext,
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
      prismMenu: params.progress.prismMenu,
      spinnerPrism: params.progress.spinnerPrism,
      navItems: [],
      scrolling: false,
      direction: "down",
      currentFrame: 1,
      percent: 0
    },

    background: {
      element: params.background.element
    },

    sections: params.sections

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


// DOM class manipulation methods
// http://toddmotto.com/creating-jquery-style-functions-in-javascript-hasclass-addclass-removeclass-toggleclass/

// has class
function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}

// add class if not exists
function addClass(elem, className) {
  if (!hasClass(elem, className)) elem.className += ' ' + className;
}

// remove class
function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
      newClass = newClass.replace(' ' + className + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  }
}

// toggle class
function toggleClass(elem, className) {
  var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ' ) + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
      newClass = newClass.replace( ' ' + className + ' ' , ' ' );
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  } else {
    elem.className += ' ' + className;
  }
}

// my own replace class method
function replaceClass(elem, existing_class, new_class) {
  removeClass(elem, existing_class);
  addClass(elem, new_class);
}