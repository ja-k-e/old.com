var settings = {
  frames: {
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
    indicatorContainer: document.getElementById("indicator-container"),
    prismMenu: document.getElementById("prism-menu"),
    spinnerPrism: document.getElementById("progress-spinner-prism"),
    completeClassName: "loaded"
  },
  background: {
    element: document.getElementById("background")
  },
  sections: []
};

var start = 60,
    stop = 210,
    pad = 10,
    sections = 6;
var each = Math.floor((stop - start) / sections);

for (var i = 0; i < sections; i++) {
  var in_frame = start + each * i,
      out_frame = in_frame + each;
  settings.sections.push({
    el: document.getElementById("section-" + (i+1)),
    visible: false, in_frame: in_frame, out_frame: out_frame
  });
}

// initialize our site
var site = new Site(settings);
site.init();