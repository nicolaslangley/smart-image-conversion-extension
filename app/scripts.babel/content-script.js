var convert = null; // Global ImageMagick convert object

function setupImageMagick() {
  convert = new Interface(chrome.runtime.getURL("image_magick/scripts/convert-worker.js"));
  convert.on_stdout = function(txt) {
    console.log(txt);
  };
  convert.on_stderr = function(txt) {
    console.log(txt);
  };
  convert.addUrl("../config/magic.xml",   "/usr/local/etc/ImageMagick/", true);
  convert.addUrl("../config/coder.xml",   "/usr/local/etc/ImageMagick/");
  convert.addUrl("../config/policy.xml",  "/usr/local/etc/ImageMagick/");
  convert.addUrl("../config/english.xml", "/usr/local/etc/ImageMagick/");
  convert.addUrl("../config/locale.xml",  "/usr/local/etc/ImageMagick/");
  convert.addUrl("../config/delegates.xml",  "/usr/local/etc/ImageMagick/");
}

function asyncLoop(iterations, func, callback) {
  var index = 0;
  var done = false;
  var loop = {
    next: function() {
      if (done) {
        return;
      }

      if (index < iterations) {
        index++;
        func(loop);

      } else {
        done = true;
        callback();
      }
    },

    iteration: function() {
      return index - 1;
    },

    break: function() {
      done = true;
      callback();
    }
  };
  loop.next();
  return loop;
}

function convertFunction(imgInput, callback) {
  var url = imgInput.src;
  console.log("Running convertFunction() with: "+url);
  convert.addUrl(url, '/');
  var splitFilename = url.substring(url.lastIndexOf('/')+1).split('.');
  var filename = splitFilename[0]; // TODO: verify that there are two elements
  var typeInput = splitFilename[1];
  if(typeInput == "jpg") {
      callback();
      return;
  }
  convert.allDone().then(function() {
    convert.run('/'+filename+"."+typeInput, '/'+filename+"."+typeOutput).then(function() {
      console.log("Performing command: convert"+' /'+filename+"."+typeInput+' /'+filename+"."+typeOutput)
      convert.getFile(filename+"."+typeOutput).then(function(imgData) {
        var imgOutput = document.createElement("img");
        imgOutput.id = "received";
        imgOutput.src = "data:image/"+typeOutput+";base64,"+window.btoa(imgData);
        var parentNode = imgInput.parentNode;
        parentNode.removeChild(imgInput);
        parentNode.appendChild(imgOutput);
        callback();
      });
    });
  });
}

var allImages = Array.prototype.slice.call(document.getElementsByTagName("img"));
console.log("Page contains "+allImages.length+" images");
var typeOutput = "jpeg"; // Possible values are gif, png, tiff, jpeg, bmp
setupImageMagick();
asyncLoop(allImages.length, function(loop) {
  var image = allImages[loop.iteration()];
  convertFunction(image, function() {
    console.log("Iteration: "+loop.iteration());
    loop.next();
  })}, function(){console.log("Cycle ended")});
