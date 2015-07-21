//credit: http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
App.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keyup", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter, {
                        'event': event
                    });
                });
                event.preventDefault();
            }
        });
    };
});
