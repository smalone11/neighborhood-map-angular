'use strict';

// Pops up a window if there is an error with the Google maps <script>.
var googleError = function () {
  window.alert('Could Not Load Google Map!')
  return true;
}

// Data for the markers to be listed by name, LatLng, and zIndex.
var favoriteLocations = [
  {
    'title': 'Safeco Field',
    'lat': 47.5916418,
    'lng': -122.3354621,
    'zIndex': 1,
    'fourID': '4b155088f964a520beb023e3'
  },
  {
    'title': 'The Crumpet Shop',
    'lat': 47.6090057,
    'lng': -122.3403555,
    'zIndex': 2,
    'fourID': '441dff3bf964a52076311fe3'
  },
  {
    'title': 'Seattle Art Museum',
    'lat': 47.606646,
    'lng': -122.3395729,
    'zIndex': 3,
    'fourID': '42a63500f964a5200a251fe3'
  },
  {
    'title': 'Showbox SoDo',
    'lat': 47.5874092,
    'lng': -122.3344886,
    'zIndex': 4,
    'fourID': '472e59eaf964a520074c1fe3'
  },
  {
    'title': 'GameWorks',
    'lat': 47.611404,
    'lng': -122.3354338,
    'zIndex': 5,
    'fourID': '40b7d280f964a5208d001fe3'
  }
];

var map, info;
var markers = [];

// Creates custom Google Maps map.
var initMap = function () {
  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map'), {
    scrollwheel: false,
    zoom: 14
  });

  info = new google.maps.InfoWindow();

  setMarkers(map, favoriteLocations);
}

// Adds markers to the map.
var setMarkers = function (map, favList) {
  for (var i = 0; i < favList.length; i++) {
    favList[i].zIndex = i;

    var fav = favList[i];

    var marker = new google.maps.Marker({
      position: {lat: fav.lat, lng: fav.lng},
      map: map,
      title: fav.title,
      zIndex: i
    });

    addMarkerEvents(map, marker, fav);

    markers.push(marker);
  }
  map.setCenter({lat: 47.6010942, lng: -122.3359881});
}

// Adds animation and info to a marker.
var addMarkerEvents = function (map, marker, fav) {
  marker.addListener('click', function () {
    map.setCenter(marker.getPosition());
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1400);
    addFoursquare(fav);
    info.open(map, this);
  });
}

// Adds Foursquare info in Info Window for the specific marker.
var addFoursquare = function (fav) {
  var fourURL = 'https://api.foursquare.com/v2/venues/' + fav.fourID + '?client_id=N3WPKKSJCPDE0LEJZAAXODSVDDZ2T4TXXZBGZCOKB4G34PTQ&client_secret=0ZF3AFUJF2TZTHBBK3MGVGD1M53PJ153JYNMQJT3AQZ14ZVS&v=20130815';

  $.getJSON(fourURL, function (data) {
    var key = data.response.venue;
    var hours;

    if (key.name !== 'Safeco Field' && key.name !== 'Showbox SoDo') {
      hours = key.hours.status;
    }else {
      hours = 'None listed';
    }

    var contents ='<div><h3>' + key.name + '</h3>' +
    '<p>' + key.location.formattedAddress + '</p>' +
    '<p><h6>Hours: </h6>' + hours + '</p>' +
    '<p><h6>Rating: </h6>' + key.rating + '/10</p>' +
    '<a href="' + key.canonicalUrl + '" target="_blank"><img src="images/foursquare-logomark.png" alt="Foursquare Link"></img></a></div>';

    info.setContent(contents);
  })
    .fail(function () {
      info.setContent('Could Not Access Foursquare!');
    });

}

// Sets the map on all markers in the array.
function setMapOnAll (map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers () {
  setMapOnAll(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers () {
  clearMarkers();
  markers = [];
}

// Triggers animation and info window for marker.
function triggerMarkerEvents (map, mark) {
  google.maps.event.trigger(mark, 'click');
}

var ViewModel = function () {
  var self = this;

  self.favList = ko.observableArray([]);
  self.userInput = ko.observable('');

  // Populate observable array from favoriteLocations.
  favoriteLocations.forEach(function (favInfo) {
    self.favList.push(favInfo);
  })

  // Triggers animation and info window for marker when name of marker is clicked on
  self.markerEvents = function (mark) {
    triggerMarkerEvents(map, markers[mark.zIndex]);
  }

  // Filters list and markers based on user input in the search bar.
  self.userInput.subscribe(function (loc) {

    // Runs code if the search bar is not blank.
    if (loc !== '') {
      var locLength = loc.length;

      // Clears observable array.
      self.favList.removeAll();

      // Runs through each object in favorites to compare to user input.
      favoriteLocations.forEach(function (favInfo) {
        var favTitle = favInfo.title;

        // Runs through each letter in the location name.
        for (var i = 0; i < favTitle.length; i++) {
          var fav = '';

          // Adds on additional letters to match the user input string length.
          for (var j = 0; j < locLength; j++) {
            fav = fav + favTitle[i+j];
          }

          // Runs if the location name's string matches the user input's string.
          if (fav.toLowerCase() == loc.toLowerCase()) {
            // Adds location name to array and exits the loop for said location name.
            self.favList.push(favInfo);
            return
          }
        }
      })

      // Clears markers from google maps and adds the new arrays.
      deleteMarkers();
      setMarkers(map, self.favList());

    }else {
      // Clears observable array and then populates it with all of favorites' objects.
      self.favList.removeAll();

      favoriteLocations.forEach(function (favInfo) {
        self.favList.push(favInfo);
      })

      // Clears markers from google maps and adds the new arrays.
      deleteMarkers();
      setMarkers(map, self.favList());
    }
  })
}

ko.applyBindings( new ViewModel() );
