App.filter('multipleSearch', function() {
    return function(objects, search) {
        var searchValues = search;
        if (!search || !objects) {
            return objects;
        }
        retList = [];
        var searchArray = search.split(" ");
        for (var oPos = 0; oPos < objects.length; oPos++) {
            var object = objects[oPos];
            for (var sPos = 0; sPos < searchArray.length; sPos++) {
                var check = false;
                var searchItem = searchArray[sPos];
                for (var item in object) {
                    if (object[item] && object[item].toString().toLowerCase().indexOf(searchItem.toLowerCase()) > -1) {
                        check = true;
                        break;
                    }
                }
                if (!check) {
                    break;
                }
                if (sPos == searchArray.length - 1 && check) {
                    retList.push(object);
                }
            }
        }
        return retList;
    };
});