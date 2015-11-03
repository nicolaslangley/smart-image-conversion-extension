function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function convertImage(image, type) {
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    var newImage = new Image();
    newImage.src = canvas.toDataURL(type);
    return newImage;
}

function imagemagickSetup(convert) {
    convert.on_stdout = function(txt) { console.log(txt); };
    convert.on_stderr = function(txt) { console.log(txt); };
    convert.addUrl('../config/magic.xml',   '/usr/local/etc/ImageMagick/', true);
    convert.addUrl('../config/coder.xml',   '/usr/local/etc/ImageMagick/');
    convert.addUrl('../config/policy.xml',  '/usr/local/etc/ImageMagick/');
    convert.addUrl('../config/english.xml', '/usr/local/etc/ImageMagick/');
    convert.addUrl('../config/locale.xml',  '/usr/local/etc/ImageMagick/');
    convert.addUrl('../config/delegates.xml',  '/usr/local/etc/ImageMagick/');
    // URLs for demo images
    convert.addUrl('../demo/test.png', '/');
    convert.addUrl('../demo/test-expected-rotated.png', '/');
}

var loadScriptCallback = function() {
    var allImages = document.getElementsByTagName("img");
    console.log(allImages.length);
    //while (allImages.length > 0) { // allImages is 'live' i.e. destructive iteration
    //var newImage = convertImage(allImages[0], "image/jpeg");
    //allImages[0].parentNode.removeChild(allImages[0]);
    //allImages[0].parentNode.appendChild(newImage);
    //}

    var convert = new Interface(chrome.runtime.getURL('scripts/convert-worker.js'));
    imagemagickSetup(convert);
    convert.allDone().then(function() {
        convert.run('-rotate', '90', "-strip", '/test.png', '/test-actual-rotated-90.png').then(function() {
            convert.getFile('test-actual-rotated-90.png').then(function(real_contents) {
                convert.getFile('test-expected-rotated.png').then(function(expected_contents) {
                    console.log(real_contents === expected_contents);

                    var body = document.getElementsByTagName("body")[0];
                    body.appendChild(document.createTextNode("It " + (real_contents !== expected_contents ? "DIDN'T work!" : " worked!")));
                    var img_received = document.createElement("img");
                    img_received.id = "received";
                    img_received.src = "data:image/png;base64,"+window.btoa(real_contents);
                    var img_expected = document.createElement("img");
                    img_expected.src = "data:image/png;base64,"+window.btoa(expected_contents);
                    body.appendChild(img_received);
                    body.appendChild(img_expected);
                });
            });
        });
    });

};
loadScriptCallback();
//loadScript("../scripts/interface.js", loadScriptCallback);
