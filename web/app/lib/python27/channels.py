from apiconfig import *
from google.appengine.api import channel

channels = endpoints.api(name='channels', version='v1',
                         allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                         audiences=[ANDROID_AUDIENCE])

@channels.api_class(resource_name='channels')
class ChannelsApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='get_token',
                      http_method='POST', name='get_token')
    def get_token(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        user_token = str(uuid.uuid4()) + request_user.user_name
        channel_token = channel.create_channel(user_token)
        request_user.channel_tokens.insert(0, user_token)
        request_user.channel_tokens = request_user.channel_tokens[0:7]
        request_user.put()
        return OutgoingMessage(error='', data=json_dump(channel_token))
