App.filter('removePassedEvents', function() {
    return function(objects, removePref) {
        var retList = [];
        var now = new Date();
        if (!objects) {
            return objects;
        }
        for (var oPos = 0; oPos < objects.length; oPos++) {

            if (moment(objects[oPos].time_end).diff(momentUTCTime(undefined)) > 0 && removePref) {
                retList.push(objects[oPos]);
            } else if (moment(objects[oPos].time_end).diff(momentUTCTime(undefined)) < 0 && removePref === false) {
                retList.push(objects[oPos]);
            } else if (removePref === undefined) {
                retList.push(objects[oPos]);
            }
        }
        return retList;
    };
});