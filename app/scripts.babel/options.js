'use strict';

// Saves options to chrome.storage
function save_options() {
  var selected = $('#formatOptions input:radio:checked').val();
  console.log(selected);
  var format = selected;
  chrome.storage.sync.set({
    outputFormat: format,
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
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
  }, function (items) {
    console.log("Restoring to format " + items.outputFormat);
    $('#' + items.outputFormat).closest('.btn').button('toggle');
  });
}

$(document).on('DOMContentLoaded', restore_options);
$("#save").on('click', function () {
  var $btn = $(this).button('Saving...')
  save_options()
  $btn.button('reset')
})

