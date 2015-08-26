from apiconfig import *
from protorpc import remote
import datetime
import logging
from pushfactory import PushFactory, LiveUpdate


admin_api = endpoints.api(name='admin', version='v1',
                          allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                          audiences=[ANDROID_AUDIENCE])


@admin_api.api_class(resource_name='admin')
class AdminApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='features_info', http_method='POST')
    def get_chatter(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        features = Feature.query(Feature.organization == request_user.organization).fetch()
        logging.error(len(features))
        feats = []
        for feature in features:
            if feature.expires < datetime.datetime.now():
                feats.append({'name': feature.name, 'expired': True, 'key': feature.key})
            else:
                feat = feature.to_dict()
                feat['expired'] = False
                feats.append(feat)
        return OutgoingMessage(error='', data=json_dump(feats))