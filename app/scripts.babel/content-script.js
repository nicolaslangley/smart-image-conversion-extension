function asyncLoop(iterations, func, callback) {
  var index = 0;
  var done = false;
  var loop = {
    next: function () {
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

    iteration: function () {
      return index - 1;
    },

    break: function () {
      done = true;
      callback();
    }
  };
  loop.next();
  return loop;
}

function convertFunction(imgInput, typeOutput, callback) {
  var convert = new Interface(chrome.runtime.getURL('image_magick/scripts/convert-worker.js'));
  convert.on_stdout = function (txt) {
    console.log(txt);
  };
  convert.on_stderr = function (txt) {
    console.log(txt);
  };
  convert.addUrl('../config/magic.xml', '/usr/local/etc/ImageMagick/', true);
  convert.addUrl('../config/coder.xml', '/usr/local/etc/ImageMagick/');
  convert.addUrl('../config/policy.xml', '/usr/local/etc/ImageMagick/');
  convert.addUrl('../config/english.xml', '/usr/local/etc/ImageMagick/');
  convert.addUrl('../config/locale.xml', '/usr/local/etc/ImageMagick/');
  convert.addUrl('../config/delegates.xml', '/usr/local/etc/ImageMagick/');
  var url = imgInput.src;
  console.log('Running convertFunction() with: ' + url);
  convert.addUrl(url, '/');
  var splitFilename = url.substring(url.lastIndexOf('/') + 1).split('.');
  var filename = splitFilename[0]; // TODO: verify that there are two elements
  var typeInput = splitFilename[1];
  if (typeInput === 'jpg') {
    console.error('Ignoring image ' + filename + '.' + typeInput + 'with file extension .jpg - use .jpeg instead');
    callback();
    return;
  }
  convert.allDone().then(function () {
    convert.run('/' + filename + '.' + typeInput, '/' + filename + '.' + typeOutput).then(function () {
      console.log('Performing command: convert' + ' /' + filename + '.' + typeInput + ' /' + filename + '.' + typeOutput);
      convert.getFile(filename + '.' + typeOutput).then(function (imgData) {
        var imgOutput = document.createElement('img');
        imgOutput.id = 'received';
        imgOutput.src = 'data:image/' + typeOutput + ';base64,' + window.btoa(imgData);
        var parentNode = imgInput.parentNode;
        parentNode.removeChild(imgInput);
        parentNode.appendChild(imgOutput);
        chrome.runtime.sendMessage({
          from:    'content',
          subject: 'incrementBadge'
        });
        callback();
      });
    });
  });
}

function convertImages() {
  var allImages = Array.prototype.slice.call(document.getElementsByTagName('img'));
  console.log('Page contains ' + allImages.length + ' images');
  asyncLoop(allImages.length, function (loop) { // TODO: create multiple workers at once for speed increase?
    var image = allImages[loop.iteration()];
    convertFunction(image, typeOutput, function () {
      loop.next();
    });
  }, function () {
    console.log('All images processed');
  });
}

var typeOutput = '';
chrome.storage.sync.get({
  outputFormat: 'jpeg', // This is the default
}, function(items) {
  typeOutput = items.outputFormat; // Possible values are gif, png, tiff, jpeg, bmp
  console.log('Converting to ' + typeOutput);
  convertImages();
});


