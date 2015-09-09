App.filter('displayTime', function(){
    return function(time){
        return momentInTimezone(time).calendar();
    };
});