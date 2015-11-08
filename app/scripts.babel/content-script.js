
var allImages = Array.prototype.slice.call(document.getElementsByTagName("img"));
console.log(allImages.length);
var typeOutput = "jpeg"; // Possible values are gif, png, tiff, jpeg, bmp

var convert = new Interface(chrome.runtime.getURL('image_magick/scripts/convert-worker.js'));
convert.on_stdout = function(txt) { console.log(txt); };
convert.on_stderr = function(txt) { console.log(txt); };
convert.addUrl('../config/magic.xml',   '/usr/local/etc/ImageMagick/', true);
convert.addUrl('../config/coder.xml',   '/usr/local/etc/ImageMagick/');
convert.addUrl('../config/policy.xml',  '/usr/local/etc/ImageMagick/');
convert.addUrl('../config/english.xml', '/usr/local/etc/ImageMagick/');
convert.addUrl('../config/locale.xml',  '/usr/local/etc/ImageMagick/');
convert.addUrl('../config/delegates.xml',  '/usr/local/etc/ImageMagick/');

// TODO: this function skips images in replacement - may only do last image
allImages.forEach(function(imgInput, index) {
    var url = imgInput.src;
    convert.addUrl(url, '/');
    var splitFilename = url.substring(url.lastIndexOf('/')+1).split('.');
    var filename = splitFilename[0]; // TODO: verify that there are two elements  
    var typeInput = splitFilename[1];
    convert.allDone().then(function() {
        convert.run('/'+filename+"."+typeInput, '/'+filename+"."+typeOutput).then(function() {
            convert.getFile(filename+"."+typeOutput).then(function(imgData) {
                var imgOutput = document.createElement("img");
                imgOutput.id = "received";
                imgOutput.src = "data:image/"+typeOutput+";base64,"+window.btoa(imgData);
                var parentNode = imgInput.parentNode;
                parentNode.removeChild(imgInput);
                parentNode.appendChild(imgOutput);
            });
        });
    });
});

