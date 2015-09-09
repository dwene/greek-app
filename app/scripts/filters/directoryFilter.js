App.filter('directoryFilter', function() {
    return function(objects, perms) {
        var retList = [];
        if (objects) {
            for (i = 0; i < objects.length; i++) {
                if (objects[i].user_name && objects[i].perms == perms) {
                    retList.push(objects[i]);
                }
            }
        }
        return retList;
    };
});