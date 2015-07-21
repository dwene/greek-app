App.directive('neteTag', ['$compile',
    function($compile) {
        return {
            restrict: 'E',
            templateUrl: 'views/templates/tags/nete-tag.html',
            link: function(scope, element, attrs) {
                $compile(element.contents())(scope);
            }
        };
    }
]);

App.directive('netetagCheck', ['$compile',
    function($compile) {
        return {
            restrict: 'E',
            templateUrl: 'views/templates/tags/nete-tag-check.html',
            link: function(scope, element, attrs) {
                $compile(element.contents())(scope);
            }
        };
    }
]);

App.directive('netetagDelete', ['$compile',
    function($compile) {
        return {
            restrict: 'E',
            templateUrl: 'views/templates/tags/nete-tag-delete.html',
            link: function(scope, element, attrs) {
                $compile(element.contents())(scope);
            }
        };
    }
]);

App.directive('netememberCheck', ['$compile',
    function($compile) {
        return {
            restrict: 'E',
            scope: {
                ngModel: "="
            },
            templateUrl: 'views/templates/tags/nete-member-check.html',
            link: function(scope, element, attrs) {
                //            $compile(element.contents())(scope)
            }
        };
    }
]);

App.directive('neteMember', ['$compile',
    function($compile) {
        return {
            restrict: 'E',
            scope: {
                ngModel: "="
            },
            templateUrl: 'views/templates/tags/nete-member.html',
            // link: function(scope, element, attrs){
            //            $compile(element.contents())(scope)
            // }
        };
    }
]);

App.directive('netetagAll', ['$compile',
    function($compile) {
        return {
            restrict: 'E',
            templateUrl: 'views/templates/tags/nete-tag-all.html',
            link: function(scope, element, attrs) {
                $compile(element.contents())(scope);
            }
        };
    }
]);
