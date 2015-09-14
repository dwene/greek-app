angular.module("App").directive('externalHref', function(){
  return {
    restrict: 'A',
    priority: 1001, // it needs to run after the attributes are interpolated
    link: function(scope, element, attr) {
      attr.$observe('externalHref', function(value) {
        var cordovaOpener = "window.open(\"" + value + "\", \"_system\");";
        attr.$set('onclick', cordovaOpener);
      });
    }
  }
});