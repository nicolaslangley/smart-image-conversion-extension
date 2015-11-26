'use strict';

function determineOutputType(os, compression, highColor) {
  console.log(os + ' ' + compression + ' ' + highColor);
  if (compression == 'lossy') {
    return 'jpeg';
  } else {
    if (highColor == 'yescolorhigh') {
      return 'tiff';
    } else if (os == 'windows') {
      return 'bmp';
    } else {
      return 'png';
    }
  }
}

// Saves options to chrome.storage
function save_options() {
  var format = $('#formatOptions input:radio:checked').val();
  var compression = $('#compressionOptions input:radio:checked').val();
  var os = $('#operatingSystemOptions input:radio:checked').val();
  var colorSetting = $('#colorSpaceOptions input:radio:checked').val();
  var format = determineOutputType(os, compression, colorSetting);
  console.log("Saving compression to " + compression);
  console.log("Saving to operating system " + os);
  console.log("Saving to color range " + colorSetting);
  console.log("Saving to format " + format);
  chrome.storage.sync.set({
    outputFormat: format,
    compressionType: compression,
    operatingSystem: os,
    colorRange: colorSetting
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved. Converting to ' + format;
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  console.log("Restoring options...");
  chrome.storage.sync.get({
    outputFormat: 'jpeg',
    compressionType: 'lossless',
    operatingSystem: 'linux',
    colorRange: 'nocolorhigh'
  }, function (items) {
    console.log("Restoring to format " + items.outputFormat);
    console.log("Restoring compression to " + items.compressionType);
    console.log("Restoring to operating system " + items.operatingSystem);
    console.log("Restoring to color range " + items.colorRange);
    $('#' + items.outputFormat).closest('.btn').button('toggle');
    $('#' + items.compressionType).closest('.btn').button('toggle');
    $('#' + items.operatingSystem).closest('.btn').button('toggle');
    $('#' + items.colorRange).closest('.btn').button('toggle');
  });
}

$(document).on('DOMContentLoaded', restore_options);
$("#save").on('click', function () {
  var $btn = $(this).button('Saving...')
  save_options()
  $btn.button('reset')
})

