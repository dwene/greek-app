App.filter('nameSearch', function() {
    return function(objects, search, max) {
        if (!search || !objects) {
            return objects;
        }
        retList = [];
        if (objects) {
            for (var oPos = 0; oPos < objects.length; oPos++) {
                var object = objects[oPos];
                var check = false;
                var name = object.first_name + ' ' + object.last_name;
                if (name.toString().toLowerCase().indexOf(search.toLowerCase()) > -1) {
                    retList.push(object);
                }
                if (max) {
                    if (retList.length >= max) {
                        console.log('Im returning early');
                        return retList;
                    }
                }
            }
        }
        return retList;
    };
});