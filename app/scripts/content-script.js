"use strict";

var all_images = Array.prototype.slice.call(document.getElementsByTagName("img"));
console.log(all_images.length);
var type_output = "jpeg"; // Possible values are gif, png, tiff, jpeg, bmp

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

all_images.forEach(function (img_input, index) {
    var url = img_input.src;
    convert.addUrl(url, '/');
    var split_filename = url.substring(url.lastIndexOf('/') + 1).split('.');
    var filename = split_filename[0]; // TODO: verify that there are two elements 
    var type_input = split_filename[1];
    convert.allDone().then(function () {
        convert.run('/' + filename + "." + type_input, '/' + filename + "." + type_output).then(function () {
            convert.getFile(filename + "." + type_output).then(function (img_data) {
                var img_output = document.createElement("img");
                img_output.id = "received";
                img_output.src = "data:image/" + type_output + ";base64," + window.btoa(img_data);
                var parent_node = img_input.parentNode;
                parent_node.removeChild(img_input);
                parent_node.appendChild(img_output);
            });
        });
    });
});
//# sourceMappingURL=content-script.js.map
