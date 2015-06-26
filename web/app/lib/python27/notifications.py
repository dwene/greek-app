from apiconfig import *
from apns import APNs, Frame, Payload
from google.appengine.api import channel
from google.appengine.api import taskqueue

class Notifications:

    def __init__(self):
        return

    @staticmethod
    def add_notification_to_users(notification, users, data):
        future_list = list()
        for user in users:
            user.new_notifications.insert(0, notification.key)
            future_list.append(user.put_async())
            if user.iphone_tokens or user.channel_tokens:
                future_list.append(PushTask(pending=True,
                                            content=notification.content,
                                            json=json_dump(data),
                                            ios_tokens=user.iphone_tokens,
                                            channel_tokens=user.channel_tokens,
                                            user=user.key))
        for item in future_list:
            item.get_result()
        taskqueue.add(url='/tasks/sendpushnotifications')
        return

    @staticmethod
    def send_ios_notifications(pushes):
        apns = APNs(use_sandbox=True, cert_file='certs/cert.pem', key_file='certs/key.pem')
        for push in pushes:
            payload = Payload(alert=push.content, sound="default", badge=1)
            for token in push.ios_tokens:
                apns.gateway_server.send_notification(token, payload)
        return

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
