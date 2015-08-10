//credit: http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
App.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        var map = {
            13: false,
            16: false
        }
        element.bind("keydown", function(event) {
            if (event.keyCode in map) {
                map[event.keyCode] = true;
                if (map[13] && map[16]) {
                    //do nothing
                }
                if (map[13] && !map[16]) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter, {
                            'event': event
                        });
                    });
                    event.preventDefault();
                    console.log(map)
                }
            }
        });
        element.bind("keyup", function(event) {
            if (event.keyCode in map) {
                map[event.keyCode] = true;
                console.log(map)
                if (map[16]) {
                    map = {
                        13: false,
                        16: false
                    }
                }
            }
        });
    }
});
