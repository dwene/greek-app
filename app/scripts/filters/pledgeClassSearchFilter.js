App.filter('pledgeClassSearch', function() {
    return function(objects, search) {
        if (!search) {
            return objects;
        }
        retList = [];
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                if (object.pledge_class_year == search.year && object.pledge_class_semester == search.semester) {
                    retList.push(object);
                } else if (search.toString().toLowerCase() == 'unknown') {
                    retList.push(object);
                }
            }
        }
        return retList;
    };
});