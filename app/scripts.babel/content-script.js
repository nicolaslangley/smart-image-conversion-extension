'use strict';

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
  if (typeInput != "gif" && typeInput != "png" && typeInput != "bmp" && typeInput != "tiff" && typeInput != "jpeg") {
    console.error('Ignoring image ' + filename + '.' + typeInput + ' unsupported file extension detected!');
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

function convertImages(typeOutput) {
  var allImages = Array.prototype.slice.call(document.getElementsByTagName('img'));
  var toConvert = allImages.length;
  if (toConvert == 0) {
    $("#loadModal").modal('hide');
    console.log('No images to process');
    return;
  }
  var convertCount = 0;
  console.log('Page contains ' + allImages.length + ' images');
  allImages.forEach(function (element, index, array) {
    convertFunction(element, typeOutput, function () {
      convertCount++;
      if (convertCount == toConvert) {
        $("#loadModal").modal('hide');
        console.log('All images processed');
      }
    });
  });
}

$(document.body).prepend('<div id="loadModal" class="modal fade">' +
  '<div class="modal-dialog">' +
  '<div class="modal-content">' +
  '<div class="modal-header">' +
  '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
  '<h4 class="modal-title">Converting images...</h4>' +
  '</div><div class="modal-body">' +
  '<div class="progress">' +
  '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%;">' +
  '<span class="sr-only"/></div></div>' +
  '</div></div></div></div>');

chrome.storage.sync.get({
  outputFormat: 'jpeg',
  showModal: 'yesdispprog'
}, function(items) {
  if (items.showModal == 'yesdispprog') {
    $("#loadModal").modal('show');
  }
  chrome.runtime.sendMessage({
    from:    'content',
    subject: 'resetBadge'
  });
  console.log('Converting to ' + items.outputFormat);
  console.log('Showing loading modal' + items.showModal)
  convertImages(items.outputFormat);
});


