// site class
function Site(params) {

  var app = {

    skrollr: undefined,

    // initialization
    init: function() {
      app.mode = app.modeDetect();
      addClass(document.getElementsByTagName('html')[0], app.mode);
      app.prismMenuSetup();
      // scroll window
      if (app.mode == "full") {
        app.imagePreloader();
        app.sectionsLoad(app.frames.total_steps);
        app.navigationLoad();
        app.navigationArrowKeys();
        // set the app skrollr
        app.skrollr = skrollr.init({
          beforerender: app.skrollrGo,
          smoothScrolling: true
        });
      } else if (app.mode == "static") {
        app.sectionsLoad(5000, true);
        // set the app skrollr
        app.skrollr = skrollr.init({
          beforerender: app.skrollrGo,
          smoothScrolling: true
        });
      }
      app.scrollToLocation(0);
    },


    // slowly increases/decreases background opacity on progress
    backgroundOpacity: function() {
      var opacity = (app.progress.percent + 0.2) * 0.5 + 0.5;
      app.background.element.style.opacity = opacity;
    },


    gotToPrevSection: function() {
      app.scrollToLocation(app.frames.positions[Math.max(app.frames.currentPosition - 1, 0)] - 1);
    },

    gotToNextSection: function() {
      app.scrollToLocation(Math.min(
        app.frames.positions[Math.min(app.frames.currentPosition + 1, app.frames.positions.length - 1)] + 200,
        app.frames.positions[app.frames.positions.length - 1]
      ));
    },


    // loads a high resolution image when wheel movement stops
    imageLoadHiRes: debounce(function() {
      app.progress.scrolling = false;

      // console.debug("Wheel Complete");
      app.imageLooper();

      var path = [app.frames.hi_path, app.frames.prefix, Math.max(Math.ceil(app.progress.currentFrame), 1), app.frames.ext].join(""),
          img = new Image();
      img.src = path;
      img.onload = function() {
        console.debug("Hi Res Loaded");
        app.imageSet(img);
      }
    }, 500),


    // loops through images once wheel movement stops and hi res is loaded
    imageLooper: function() {
      var i = 0, inc = 1,
          distance = 4, direction = 1,
          time = 200;
          images = 0;

      app.looping = function() {
        if (app.progress.currentFrame >= app.sections[0].in_frame && app.progress.currentFrame < app.sections[app.sections.length - 1].out_frame) {
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
            var path = [app.frames.hi_path, app.frames.prefix, Math.round(frame + i), app.frames.ext].join(""),
                img = new Image();
                img.src = path;

            // set the image
            app.imageSet(img);

            // call it again
            app.looping();
          }, time);
        }
      }

      app.looping();
    },


    // preload lo res images for animation
    imagePreloader: function() {

      for (var i = 1; i <= app.frames.count; i++) {
        var path = [app.frames.lo_path, app.frames.prefix, i, app.frames.ext].join(""),
            img = new Image();
        img.src = path;
        img.onload = imageLoad;
        img.onerror = imageLoadError;
        app.frames.data.push(img);
      }

      function imageLoadError() {
        app.frames.loaded.partial = true;
      }

      function imageLoad() {
        app.frames.loaded.count++;
        app.imagePreloaderAnimate();
        if (app.frames.loaded.count == app.frames.count) {
          app.imagesLoadedHandler();
          addClass(app.progress.loader, app.progress.completeClassName);
          addClass(document.getElementsByTagName('html')[0], app.progress.completeClassName);
          console.debug("Lo Res Images Loaded", app.frames.loaded.count);
          if (app.frames.loaded.partial) console.warn("Not All Images Loaded Successfully");
        }
      }
    },


    // image load progress indicator
    imagePreloaderAnimate: function() {
      var decimal = Math.round(app.frames.loaded.count / app.frames.count * 100);
      var transformDeg = -360 * (decimal / 100) + 45;
      app.progress.loaderPrism.style.webkitTransform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderPrism.style.transform = "rotateY(" + transformDeg + "deg) rotateX("+ transformDeg + "deg)";
      app.progress.loaderMessage.innerHTML = decimal + "%";
    },


    // sets an image to the canvas
    imageSet: function(img) {
      var context = app.background.element.getContext("2d");
      // image, x, y, width, height
      context.drawImage(img, 0, 0, 1280, 720);
    },


    // once all lo resolution images are loaded
    imagesLoadedHandler: function() {
      app.progress.currentFrame = 1;
    },



    // detect full animation or static mode
    modeDetect: function() {
      var mobileOrTablet = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))mobileOrTablet = true})(navigator.userAgent||navigator.vendor||window.opera);
      if (mobileOrTablet) {
        return "static";
      } else {
        return "full";
      }
    },



    // handling arrow keydown
    navigationArrowKeys: function() {
      var lastEvent;
      var heldKeys = {};

      window.onkeydown = function(event) {
        // dont allow holding
        if (lastEvent && lastEvent.keyCode == event.keyCode) return;
        lastEvent = event;
        switch (event.keyCode) {
          case 37:
          case 38:
          case 33:
            app.gotToPrevSection();
            break;
          case 39:
          case 40:
          case 34:
            app.gotToNextSection();
            break;
        }
        heldKeys[event.keyCode] = true;
      };

      window.onkeyup = function(event) {
        lastEvent = null;
        delete heldKeys[event.keyCode];
      };​
    },


    // load the progress navigation
    navigationLoad: function() {
      // first span
      navItem(0, app.frames.positions[0]);
      // remaining navigation
      for (var i = 0; i < app.sections.length; i++) {
        (function() {
          var comp = app.sections[i];
          navItem(comp.navItemTop, app.frames.positions[i + 1]);
        }())
      }
      // last span
      navItem(1, app.frames.positions[app.frames.positions.length - 1]);

      // navigation
      function navItem(to_perc, offset) {
        var navItem = document.createElement("span");
        navItem.id = "nav-item-" + Math.round(to_perc * app.frames.count);
        navItem.setAttribute("data-frame", Math.round(to_perc * app.frames.count));

        navItem.addEventListener("click", function() {
          app.scrollToLocation(offset);
        }, false);

        navItem.style.top = Math.round(to_perc * 10000) / 100 + "%";
        app.progress.navItems.push(navItem);
        app.progress.indicatorContainer.appendChild(navItem);
      }
    },


    // setup prism menu
    prismMenuSetup: function() {
      app.progress.spinnerPrism.addEventListener("click", function() {
        toggleClass(app.progress.prismMenu, "open");
      });
    },


    // spin prism menu on progress
    prismMenuSpin: function() {
      var amount = -360 * ((app.progress.currentFrame - 1) / (app.frames.count - 1));
      var transform = "rotateX("+amount+"deg) rotateY("+amount+"deg)";
      app.progress.spinnerPrism.style.webkitTransform = transform;
      app.progress.spinnerPrism.style.transform = transform;
    },


    // records direction and state on wheel movement, moves progress indicator
    progressHandler: function(delta) {

      // clear static loop if running
      clearTimeout(app.loopTimeout);

      // handle progress
      app.progress.indicator.style.bottom = (Math.round((1 - app.progress.percent) * 10000) / 100) + "%";


      // scene control
      app.sceneController();

      if(app.mode == "full") {
        // change the background opacity
        app.backgroundOpacity();
        // set the image
        var currentFrame = Math.ceil(app.progress.percent * app.frames.data.length);
        var img = app.frames.data[currentFrame - 1];
        if (img) app.imageSet(img);

        app.progress.currentFrame = currentFrame;

        // swap in hi res image when stopped
        app.imageLoadHiRes();
      }



      // console.debug("Current Frame:", app.progress.currentFrame);
    },


    // handle scene activity on progress
    sceneController: function() {
      var frame = app.progress.currentFrame;

      for(var i = 0; i < app.progress.navItems.length; i++) {
        var item = app.progress.navItems[i],
            itemFrame = parseInt(item.getAttribute("data-frame"));
        if (app.progress.direction == "down" && frame >= itemFrame - 2) {
          if (!hasClass(item, "active")) {
            addClass(item,"active");
            app.frames.currentPosition = i;
          }
        } else if (app.progress.direction == "up" && Math.floor(frame) < itemFrame - 1) {
          if (hasClass(item, "active")) {
            removeClass(item, "active");
            app.frames.currentPosition = i - 1;
          }
        }
      }
    },



    // scroll window to location using skrollr
    scrollToLocation: function(destination) {
      addClass(document.body, "scrolling");
      app.skrollr.animateTo(destination, {
        duration: 1000,
        easing: 'cubic',
        done: function() {
          removeClass(document.body, "scrolling");
        }
      });
    },



    // load all sections and their content
    sectionsLoad: function (total_steps, skip_buffers) {
      var in_perc = app.sections[0].in_perc,
          out_perc = app.sections[app.sections.length - 1].out_perc,
          total_frames = app.frames.count,
          total_items = 0;

      for(var s = 0; s < app.sections.length; s++) total_items += app.sections[s].content.length;

      var intro_length = (!skip_buffers) ? Math.round(in_perc * total_steps) : 0,
          outro_length = (!skip_buffers) ? Math.round((1 - out_perc) * total_steps) : 0,
          viewing_length = total_steps - outro_length - intro_length,
          item_length = Math.round(viewing_length / total_items),
          skrollr_step = Math.floor(item_length * 0.3),
          skrollr_hold = Math.floor(item_length * 0.3),
          skrollr_dur = item_length - skrollr_step - skrollr_hold,
          ongoing = intro_length;

      if (!skip_buffers) {
        // add first section
        var $section = document.createElement("section");
        // unique id for section
        $section.id = "section-0";
        app.frames.positions.push(0);
        $section.innerHTML = "<div data-0='opacity: 0;' data-" + intro_length + "='opacity: 0;'></div>";
        app.sectionsContainer.appendChild($section);
      }

      // for each section
      for(var s = 0; s < app.sections.length; s++) {
        var section = app.sections[s],
            $section = document.createElement("section");

        // unique id for section
        $section.id = "section-" + (s+1);

        // section html to append
        var section_html = "";

        // for each section content
        var hold = skrollr_hold * section.content.length,
            // when all in section begin fade out
            all_in = ongoing + (skrollr_step * (section.content.length + 1)) + hold,
            // when all in section are completely faded out
            all_stop = all_in + skrollr_dur;
        // for each content item in section
        for (var c = 0; c < section.content.length; c++) {

          // relative start
          var start = ongoing + skrollr_step,
              // relative completely faded in
              item_in = start + skrollr_dur;

          if(skip_buffers && s == 0) {
            var skrollr_data = ["",
              "data-" + all_in + "='opacity: 1; transform: translateX(0rem)'",
              "data-" + Math.round(all_in + (all_stop - all_in) * 0.2) + "='opacity: 0.8; transform: translateX(0.4rem)'",
              "data-" + all_stop + "='opacity: 0; transform: translateX(-1rem)'"
            ].join(" ");

          } else if (skip_buffers && s == app.sections.length - 1 ) {
            var skrollr_data = ["",
              "data-" + start + "='opacity: 0; transform: translateX(-1rem)'",
              "data-" + Math.round(start + (item_in - start) * 0.8) + "='opacity: 0.8; transform: translateX(0.4rem)'",
              "data-" + item_in + "='opacity: 1; transform: translateX(0rem)'",
              "data-" + all_in + "='opacity: 1; transform: translateX(0rem)'",
              "data-" + all_stop + "='opacity: 1; transform: translateX(0rem)'"
            ].join(" ");

          } else {
            var skrollr_data = ["",
              "data-" + start + "='opacity: 0; transform: translateX(-1rem)'",
              "data-" + Math.round(start + (item_in - start) * 0.8) + "='opacity: 0.8; transform: translateX(0.4rem)'",
              "data-" + item_in + "='opacity: 1; transform: translateX(0rem)'",
              "data-" + all_in + "='opacity: 1; transform: translateX(0rem)'",
              "data-" + Math.round(all_in + (all_stop - all_in) * 0.2) + "='opacity: 0.8; transform: translateX(0.4rem)'",
              "data-" + all_stop + "='opacity: 0; transform: translateX(-1rem)'"
            ].join(" ");
          }

          // if first item
          if (c == 0) {
            if (s != 0 ) $section.setAttribute("data-0", "@active: false;");
            $section.setAttribute("data-" + start, "@active: true;");
          }
          // if last item, set navItem top position for section
          if (c == section.content.length - 1) {
            $section.setAttribute("data-" + all_stop, "@active: false;");
            section.navItemTop =  item_in / total_steps;
            app.frames.positions.push(item_in);
          }

          // add content
          section.content[c] = section.content[c].replace("<div", ("<div" + skrollr_data));
          section_html += section.content[c];
          ongoing += skrollr_step;

        }
        // increase ongoing by section pad
        ongoing += (skrollr_step + skrollr_hold) * section.content.length;
        $section.innerHTML = section_html;
        app.sectionsContainer.appendChild($section);
      }

      if (!skip_buffers) {
        // add last section
        var $section = document.createElement("section");
        // unique id for section
        $section.id = "section-" + (app.sections.length + 1);
        var skrollr_data = ""+
          "<div data-" + (intro_length + viewing_length) + "='opacity: 0;' data-" + (intro_length + viewing_length + outro_length) + "='opacity: 0;'></div>";
        $section.innerHTML = skrollr_data;
        app.sectionsContainer.appendChild($section);
        app.frames.positions.push((intro_length + viewing_length + outro_length));
      }
    },


    // run skrollr
    skrollrGo: function(e) {
      // console.log(e);
      var progress = e.curTop / e.maxTop;
      app.progress.direction = (app.progress.percent > progress) ? "up" : "down";
      app.progress.percent = progress;
      app.progressHandler();
    },


    //
    // initial data
    //

    background: {
      element: params.background.element
    },

    frames: {
      count: params.frames.count,
      total_steps: params.frames.total_steps,
      lo_path: params.frames.lo_path,
      hi_path: params.frames.hi_path,
      prefix: params.frames.prefix,
      ext: params.frames.ext,
      loaded: {
        count: 0, val: false, partial: false
      },
      currentPosition: 0,
      positions: new Array(),
      data: new Array()
    },

    goingToFrame: false,
    looping: undefined,
    mode: undefined,

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

    sectionsContainer: params.sectionsContainer,
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