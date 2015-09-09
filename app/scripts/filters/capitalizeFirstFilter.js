App.filter('capitalizeFirst', function() {
    return function(objects) {
        if (objects) {
            return objects[0].toUpperCase() + objects.slice(1);
        }
        return objects;
    };
});