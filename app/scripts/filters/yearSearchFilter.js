App.filter('yearSearch', function() {
    return function(objects, search) {
        if (!search) {
            return objects;
        }
        retList = [];
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                if (object.grad_year) {
                    if (object.grad_year.toString().toLowerCase() == search.toString().toLowerCase()) {
                        retList.push(object);
                    }
                } else if (search.toString().toLowerCase() == 'unknown') {
                    retList.push(object);
                }
            }
        }
        return retList;
    };
});