angular.module('App')
     .factory('Channels', function($rootScope, RESTService){
        var item = {};
        item.connect = function() {
            RESTService.post(ENDPOINTS_DOMAIN + '/_ah/api/channels/v1/get_token', '')
                .success(function (data) {
                    if (!checkResponseErrors(data)) {
                        console.log("I got the token", data.data);
                        var socket = new SocketHandler(JSON.parse(data.data));
                        socket.onMessage(function (data) {
                            console.log("I just got a new message!", data);
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

        //var socket = new SocketHandler();
        //socket.onMessage(function(data){
        // console.log("I just got a new message!", data);
        //});
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