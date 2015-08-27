angular.module('App')
     .factory('Channels', function($rootScope, RESTService, ChannelMessageHandler){
        var item = {};
        item.connect = function() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/channels/v1/get_token', '')
                .success(function (data) {
                    if (!checkResponseErrors(data)) {
                        console.log("I got the token", data.data);
                        var socket = new SocketHandler(JSON.parse(data.data));
                        socket.onMessage(function (data) {
                            ChannelMessageHandler.handle(data);
                        });
                    } else {
                        console.log('Channels get token Get Error: ', data);
                    }
                })
                .error(function (data) {
                    console.log('Channels Get Error: ', data);
                });
        }
        return item;
     });

angular.module('App').factory('ChannelMessageHandler', function($rootScope, Chatter, Notifications){
    var self = {};
    self.handle = function(message){
        console.log("Recieving new Channel Message", message);
        if (message.type === 'notification'){
            Notifications.add(message.data);
        }
        else if(message.type === 'update'){
            var data = message.data;
            if (data.type === "CHATTER"){
                if (data.data.type == "LIKE"){
                    Chatter.updateLikes(data);
                }
                if (data.data.type === "NEWCHATTER"){
                    Chatter.updateNewChatter(data.data.chatter);
                }
            }
            else if(data.type === "CHECKIN"){
                $rootScope.$broadcast('checkin:new', data.data);
            }
        }
    }
    return self;
});

var SocketHandler = function(tokenID) {
    this.messageCallback = function () {
    };

    this.onMessage = function (callback) {
        var theCallback = function (message) {
            callback(JSON.parse(message.data));
        }

        if (this.channelSocket == undefined) {
            this.messageCallback = theCallback;
        } else {
            this.channelSocket.onmessage = theCallback;
        }
    }

    var context = this;
    this.socketCreationCallback = function (channelID) {
        var fn = window["goog.appengine.Channel"];
        var channel = new goog.appengine.Channel(channelID);
        context.channelId = channelID;
        var socket = channel.open();
        socket.onerror = function () {
            console.log("Channel error");
        };
        socket.onclose = function () {
            console.log("Channel closed, reopening");
            //We reopen the channel
            context.messageCallback = context.channelSocket.onmessage;
            context.channelSocket = undefined;
            $.getJSON("chats/channel", context.socketCreationCallback);
        };
        context.channelSocket = socket;
        context.channelSocket.onmessage = context.messageCallback;
    };

    this.socketCreationCallback(tokenID);

}