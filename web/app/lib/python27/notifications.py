from apiconfig import *
from apns import APNs, Frame, Payload
from google.appengine.api import channel
from google.appengine.api import taskqueue

notifications_api = endpoints.api(name='notifications', version='v1',
                                  allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                                  audiences=[ANDROID_AUDIENCE])


@notifications_api.api_class(resource_name='chatter')
class NotificationsApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='get',
                      http_method='POST', name='notifications.get')
    def get_notifications(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        notification_count = 30
        if request_user.new_notifications:
            new_notification_future = Notification.query(Notification.key.IN(
                request_user.new_notifications)).order(-Notification.timestamp).fetch_async(30)
        if request_user.new_notifications:
            if len(request_user.new_notifications) >= 30:
                notification_count = 0
            else:
                notification_count = 30 - len(request_user.new_notifications)
        if request_user.notifications and notification_count > 0:
            notifications_future = Notification.query(Notification.key.IN(
                request_user.notifications)).order(-Notification.timestamp).fetch_async(notification_count)
        out_notifications = list()
        if request_user.new_notifications:
            new_notifications = new_notification_future.get_result()
            for notify in new_notifications:
                note = notify.to_dict()
                note["new"] = True
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        if request_user.notifications and notification_count > 0:
            notifications = notifications_future.get_result()
            for notify in notifications:
                note = notify.to_dict()
                note["new"] = False
                note["key"] = notify.key.urlsafe()
                out_notifications.append(note)
        return OutgoingMessage(error='', data=json_dump(out_notifications))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='read',
                      http_method='POST', name='notifications.read')
    def read_notification(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        for key in request_user.new_notifications:
            request_user.new_notifications.remove(key)
            request_user.notifications.insert(0, key)
        request_user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='update',
                      http_method='POST', name='notifications.update')
    def update_notifications(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.new_notifications:
            new_notifications = Notification.query(Notification.key.IN(
                request_user.new_notifications)).order(-Notification.timestamp).fetch(15)
            out = list()
            for notify in new_notifications:
                add = notify.to_dict()
                add["new"] = True
                add["key"] = notify.key.urlsafe()
                out.append(add)
            return OutgoingMessage(error='', data=json_dump(out))
        return OutgoingMessage(error='', data=json_dump(list()))







class Notifications:

    def __init__(self):
        return

    # @staticmethod
    # def send_notification_to_users(notification, users, data):
    #     future_list = list()
    #     for user in users:
    #         user.new_notifications.insert(0, notification.key)
    #         future_list.append(user.put_async())
    #         if user.iphone_tokens or user.channel_tokens:
    #             future_list.append(PushTask(pending=True,
    #                                         content=notification.content,
    #                                         json=json_dump(data),
    #                                         ios_tokens=user.iphone_tokens,
    #                                         channel_tokens=user.channel_tokens,
    #                                         user=user.key))
    #     for item in future_list:
    #         item.get_result()
    #     taskqueue.add(url='/tasks/sendpushnotifications')
    #     return

    @staticmethod
    # def send_ios_notifications(pushes):
    #     apns = APNs(use_sandbox=True, cert_file='certs/cert.pem', key_file='certs/key.pem')
    #     for push in pushes:
    #         payload = Payload(alert=push.content, sound="default", badge=1)
    #         for token in push.ios_tokens:
    #             apns.gateway_server.send_notification(token, payload)
    #     return

    @staticmethod
    def send_android_notifications(notifications):
        return

    @staticmethod
    def send_channel_notifications(pushes):
        for push in pushes:
            for token in push.tokens:
                to_send = json.loads(push.data)
                to_send["content"] = push.content
                channel.send_message(token, json_dump(push.data))
        return

    @staticmethod
    def send_channel_notification(push):
        for token in push.tokens:
            channel.send_message(token, push.message)
        return
