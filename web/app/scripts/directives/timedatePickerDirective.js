App.directive('timePicker', function($compile) {
    return {
        scope: {
            ngModel: '='
        },
        restrict: 'E',
        replace: 'true',
        template: '<div class="date"></div>',
        link: function(scope, element, attrs) {

            var this_name = attrs.name;
            var this_id = attrs.id;

            element.append('<md-input-container>' + '<label for="time_picker">Select Time</label>' + '<input type="text" name="time_picker" class="picker" id="' + this_id + 'time" name="' + this_name + 'time" ng-model="ngModel"/>' + '</md-input-container>' + '<script type="text/javascript">' + '$("#' + this_id + 'time").datetimepicker({' + 'pickDate: false,' + 'icons: {' + 'time: "fa fa-clock-o",' + 'date: "fa fa-calendar",' + 'up: "fa fa-arrow-up",' + 'down: "fa fa-arrow-down"' + "}});" + '$("#' + this_id + 'time").focusout(function(){' + '$(this).trigger("change");' + '});' + '</script>');
            $compile(element.contents())(scope);
        }
    };
});

App.directive('datePicker', function($compile) {
    return {
        scope: {
            ngModel: '='
        },
        restrict: 'E',
        replace: 'true',
        template: '<div class="date"></div>',
        link: function(scope, element, attrs) {

            var this_name = attrs.name;
            var this_id = attrs.id;
            var this_future = attrs.id;
            element.append('<md-input-container>' + '<label for="date_picker">Select Date</label>' + '<input type="text" name="date_picker" class="picker" id="' + this_id + 'date" name="' + this_name + '" ng-model="ngModel"/>' + '</md-input-container>' + '<script type="text/javascript">' + '$("#' + this_id + 'date").datetimepicker({' + 'pickTime: false,' +
                //+ 'minDate: moment(),'
                 'icons: {time: "fa fa-clock-o", date: "fa fa-calendar", up: "fa fa-arrow-up", down: "fa fa-arrow-down"' + '}});' + '$("#' + this_id + 'date").focusout(function(){' + '$(this).trigger("change");' + '});' + '</script>'
            );
            $compile(element.contents())(scope);
        }
    };
});
