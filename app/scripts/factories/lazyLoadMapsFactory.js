App.service('GoogleMaps', function lazyLoadMaps($window, $q) {
  function loadScript() {
    // use global document since Angular's $document is weak <-- oooh, need some ice for that burn??!! :-P
    var s = document.createElement('script')
    s.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&sensor=false&callback=initMap'
    document.body.appendChild(s)
  }
  var deferred = $q.defer()

  $window.initMap = function () {
    deferred.resolve()
  }

  if ($window.attachEvent) {
    $window.attachEvent('onload', loadScript)
  } else {
    $window.addEventListener('load', loadScript, false)
  }

  return deferred.promise
});