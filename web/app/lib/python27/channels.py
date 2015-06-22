from apiconfig import *
import webapp2
from google.appengine.api import channel


class Connected(webapp2.RequestHandler):
    def post(self):
        logging.error(self.request)
        return

class Disconnected(webapp2.RequestHandler):
    def post(self):
        logging.error(self.request)
        return

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
        token = channel.create_channel(str(uuid.uuid4()))
        request_user.channel_tokens.append(token)
        return OutgoingMessage(error='', data=json_dump(token))
