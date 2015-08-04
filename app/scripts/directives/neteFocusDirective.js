App.directive('neteFocus', [
  '$timeout', function($timeout) {
    return function(scope, element, attrs) {
      scope.$watch(attrs.neteFocus, function(value) {
        return $timeout((function() {
          if (value === true) {
            element.focus();
            scope[attrs.neteFocus] = false;
          }
        }), 10);
      });
    };
  }
]);