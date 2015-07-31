App.directive('onFinishRender', ['$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                if (scope.$last === true) {
                    console.log('I found the last element');
                    scope.$evalAsync(attr.onFinishRender);
                }
            }
        };
    }
]);
