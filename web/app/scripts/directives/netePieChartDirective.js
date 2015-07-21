App.directive('netePieChart', function() {
    return {
        scope: {
            ngModel: '=',
            realData: '='
        },
        restrict: 'E',
        replace: 'true',
        template: '<div> </div>',
        link: function(scope, element, attrs) {
            scope.$watch('ngModel', function() {
                if (scope.ngModel) {
                    scope.realData = {};
                    var objectList = [];
                    for (i = 0; i < scope.ngModel.length; i++) {
                        objectList.push({
                            c: [{
                                v: scope.ngModel[i].name
                            }, {
                                v: scope.ngModel[i].count
                            }, ]
                        });
                    }

                    scope.realData.data = {
                        "cols": [{
                            id: "t",
                            label: "Choice",
                            type: "string"
                        }, {
                            id: "s",
                            label: "Count",
                            type: "number"
                        }],
                        "rows": objectList
                    };

                    // $routeParams.chartType == BarChart or PieChart or ColumnChart...
                    scope.realData.type = 'PieChart';
                    scope.realData.options = {
                        'title': ''
                    };
                }
            });
        }
    };
});
