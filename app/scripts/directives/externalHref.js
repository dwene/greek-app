angular.module('App').directive('externalHref', function($compile){
  return {
    restrict: 'A',
    priority: 1001, // it needs to run after the attributes are interpolated
    link: function(scope, element, attr) {
      attr.$observe('externalHref', function(value) {
        attr.$set('href', value);
        attr.$set('target', '_blank');
      });
    }
  }

});


  