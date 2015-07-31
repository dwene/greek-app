App.directive('search', function() {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            change: '&?'
        },
        templateUrl: 'views/templates/searchdirective.html',
        controller: function($scope, $element, $attrs) {
            $scope.callFunction = function() {
                $scope.change();
            };
        }
    };
});
