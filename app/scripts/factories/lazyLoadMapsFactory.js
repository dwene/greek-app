App.service('GoogleMaps', function lazyLoadMaps($window, $q) {
  var deferred = $q.defer()
  console.log('Im starting the map load');
  $window.initMap = function () {
    console.log('finished loading maps');
    deferred.resolve();
  }

  function loadScript() {
    console.log('Im calling load script');
    // use global document since Angular's $document is weak <-- oooh, need some ice for that burn??!! :-P
    var s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&sensor=false&callback=initMap';
    document.body.appendChild(s);
  }

  loadScript();

  return deferred.promise;
});