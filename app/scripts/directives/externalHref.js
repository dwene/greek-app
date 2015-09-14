angular.module('App').directive('externalHref', function($compile){
  // return{
  //   restrict: 'A',
  //   controller: function($scope) {

  //      // all the code
  //   },

  //   priority: 1001, // we are the first
  //   compile: function(el, attrs){

  //     el.attr('ng-href', attrs.externalHref);
  //     el.attr('target', '_blank');
  //     el.removeAttr('external-href'); // must remove to prevent infinite compile loop

  //     var fn =  $compile(el); // compiling again

  //     return function(scope){
  //       fn(scope); //
  //     }
  //   }
  // }
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


  