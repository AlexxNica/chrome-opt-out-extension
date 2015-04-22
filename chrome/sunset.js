// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview This file contains the deprecation mechanism for this
 * extension.
 */


/**
 * A singleton class responsible for showing the deprecation notifications
 * and uninstalling this extension.
 */
var Sunset = {};


/**
 * Starting date of the deprecation phase.
 *
 * @type {Date}
 * @private
 */
Sunset.start_ = new Date();  // TBD


/**
 * Offsets of the notifications in days from the starting date.
 *
 * @type {Array<Number>}
 * @private
 */
Sunset.timeline_offsets_ = [
  7,
  14,
  28,
  29
];


/**
 * The minimum offset in days between two subsequent notifications.
 *
 * @type {Number}
 * @private
 */
Sunset.minimum_offset_ = 7;


/**
 * Shows a notification if enough time has passed since the previous one
 * was not shown.
 * @private
 */
Sunset.maybeShowNotification_ = function() {
  chrome.storage.sync.get(null, function(data) {
    // Read the index of the notification to be shown and the date when
    // the previous notification was shown.
    var index = parseInt(data.index, 10);
    var last_date = new Date(data.date);

    // Reset the index if the stored data are invalid or not present.
    if (isNaN(index) || index < 0 ||
        index >= Sunset.timeline_offsets_.length || !last_date.getTime()) {
      index = 0;
    }

    // Trigger notification if we have reached the date suggested
    // by the timeline and if enough time has passed since the previous
    // one was shown. These checks are not required for the first notification.
    var today = new Date();
    
    var timeline_threshold = Sunset.start_;
    timeline_threshold.setDate(
        timeline_threshold.getDate() + Sunset.timeline_offsets_[index]);

    var offset_threshold = last_date;
    offset_threshold.setDate(
        offset_threshold.getDate() + Sunset.minimum_offset_);

    if (!index || (today >= timeline_threshold && today >= offset_threshold))
      Sunset.showNotification_(index);
  });
};


/**
 * Shows a notification.
 * @private
 */
Sunset.showNotification_ = function(index) {
  // There is no 4th notification. Instead, we just uninstall the extension.
  if (index >= Sunset.timeline_offsets_.length - 1)
    chrome.management.uninstallSelf();

  // Show the notification.
  chrome.notifications.create(
    index.toString(),
    {
      "type": "basic",
      "iconUrl": "icon128.png",
      "title": "TBD",
      "message": "TBD"
    }
  );

  // Save the state.
  chrome.storage.sync.set({
    "index": index + 1,
    "date": new Date().toString()
  });
}


/**
 * Triggers a loop that tests if conditions were met to show the message.
 */
Sunset.run = function() {
  chrome.alarms.onAlarm.addListener(Sunset.maybeShowNotification_);
  chrome.alarms.create(null, {
      "delayInMinutes": 1,        // In a minute.
      "periodInMinutes": 12 * 60  // Twice per day.
  });
}

