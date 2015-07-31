App.directive('loadDirective', function() {
    return {
        scope: {
            ngModel: '='
        },
        restrict: 'EA',
        replace: 'true',
        transclude: 'true',
        templateUrl: 'views/templates/loadingTemplate.html',
    };
});
