#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.api import images, files
from ndbdatastore import *
from google.appengine.api import mail
from google.appengine.api import urlfetch
import json
import braintree
import logging
import datetime
import jinja2
import webapp2
import base64, re
DOMAIN = 'https://app.netegreek.com'
HTML_EMAIL_1 = """
<div bgcolor="#d4d4d4"><div style="font-size:1px;display:none!important"></div><table width="100%" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td bgcolor="#d4d4d4" style="padding-top:10px"><table width="650" border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td width="650"><table width="650" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td width="650" bgcolor="#003663" valign="top" padding="" style=""><a href="https://app.netegreek.com" target="_blank"><img src="https://app.netegreek.com/images/NeteGreekLogoSmallWhite.png" width="149" height="40" style="margin-top:20px;margin-left:20px;height:40px;width:149px;" border="0"></a></td></tr><tr width="650"><td bgcolor="#003663" padding="10" style="padding:10px;"></td></tr><tr><table width="650" border="0" cellspacing="0" cellpadding="0"><tr><td width="50" bgcolor="#003663" halign="left"></td><td width="550" bgcolor="#003663" halign="center"><table width="550" bgcolor="#FFFFFF" border="0" halign="center"><tr><td width="550" border="0" style="border:none;"><div style="margin-top:20px;margin-bottom:20px;margin-left: 10px;margin-right:10px;">"""
HTML_EMAIL_2 = """
</div></td></tr></table></td><td width="50" bgcolor="#003663"></td></tr></table></tr><tr><td width="650" height="50" bgcolor="#003663"></td></tr></tbody></table><table width="650" cellpadding="0" cellspacing="0" border="0" bgcolor="#d4d4d4" align="center"><tbody><tr><td><table align="center" style="width:100%;max-width:650px;text-align:left;padding-top:15px"><tbody><tr><td colspan="2" style="text-align:center;width:100%"><p style="color:#818181;font-size:12px;padding-top:10px;line-height:25px;font-family:arial;font-color:white;text-align:center"> If you believe you are receiving this email in error please email <a href="mailto:support@netegreek.com" style="">support@netegreek.com</a></p><p style="color:#818181;font-color:white;font-size:12px;padding-top:10px;line-height:25px;font-family:arial;text-align:center"> NeteGreek, LLC. </p></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div>"""


def send_mandrill_email(from_email, to_email, subject, body, html):
    to_send = dict()
    email_out = [{'email': to_email, 'type': 'to'}]
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = dict()
    message["text"] = body
    message["html"] = html
    message["subject"] = subject
    message["from_email"] = from_email
    message["from_name"] = 'NeteGreek'
    message["to"] = email_out
    to_send["message"] = message
    json_data = json.dumps(to_send)
    result = urlfetch.fetch(url='https://mandrillapp.com/api/1.0/messages/send.json',
                            payload=json_data,
                            method=urlfetch.POST,
                            headers={'Content-Type': 'application/json'})
    return


def send_email(from_email, to_email, subject, body):
    footer = 'If you believe you are receiving this email in error, please email support@netegreek.com'
    html_title = """<h1 style="text-align: center;font-family:sans-serif;color:#000">""" + subject.replace('\n', '<br/>') + """</h1>"""
    html_body = """<p style="text-align: left;font-family:sans-serif;color: #000">""" + body.replace('\n', '<br/>') + """</p>"""
    full_body = body + '\n\n' + footer
    html_full = HTML_EMAIL_1 + html_title + html_body + HTML_EMAIL_2
    try:
        mail.send_mail(from_email, to_email, subject, full_body, html=html_full)
    except:
        send_mandrill_email(from_email, to_email, subject, full_body, html_full)


def get_user(user_name, token):
    user = User.query(User.user_name == user_name).get()
    if not user:
        return None
    dt = (datetime.datetime.now() - user.timestamp)
    if user.current_token == token and dt.days < 3:
        return user
    else:
        return None


def check_birthdays():
    today = datetime.date.today()
    year = 0
    while year < 100:
        b_day_users = User.query(User.dob == datetime.date(today.year - year, today.month, today.day)).fetch()
        futures = []
        for user in b_day_users:
            notify = Notification()
            notify.content = 'Happy Birthday from NeteGreek!'
            notify.sender_name = 'NeteGreek Team'
            notify.title = 'Happy Birthday!'
            notify.timestamp = datetime.datetime.now()
            notify.put()
            user.new_notifications.append(notify.key)
            futures.append(user.put_async())
            email = CronEmail()
            email.type = 'birthday'
            email.content = 'Happy Birthday from NeteGreek!'
            email.title = 'Happy Birthday!'
            email.pending = True
            email.email = user.email
            futures.append(email.put_async())
        for future in futures:
            future.get_result()
        year += 1
    return


def check_subscriptions():
    organizations = Organization.query().fetch()
    for organization in organizations:
        if organization.subscribed:
            if organization.cancel_subscription:
                if organization.cancel_subscription >= datetime.date.today():
                    organization.subscribed = False
                users = User.query(User.organization == organization.key).fetch()
                for user in users:
                    email = CronEmail()
                    email.title = 'Subscription Canceled'
                    email.content = """
                    This is a notice that you are no longer a premium member with NeteGreek.

                    If you would like to renew your premium membership with us please signup again at app.netegreek.com.

                    -NeteGreek Team
                    """
                    email.email = user.email
                    email.pending = True
                    email.type = 'cancellation_notice'
                    email.put()
            elif organization.subscription_id:
                subscription = braintree.Subscription.find(organization.subscription_id)
                if subscription.days_past_due == 2 and not subscription.canceled and organization.subscribed:
                    users = User.query(User.organization == organization.key).fetch()
                    for user in users:
                        email = CronEmail()
                        email.title = 'Payments Missed'
                        email.content = """
                        This is a notice that your organization is now 2+ days late on payment.\n\n

                        Please check to see if you have been billed for this month and contact us at support@netegreek.com
                        if you believe you are receiving this in error. If not, please ensure that you have enough funds
                        in the card's account to process this or change the card given on the subscription page.
                        We will try to draw funds again tomorrow.\n\n

                        Thanks!\n\n

                        -NeteGreek Team
                        """
                        email.email = user.email
                        email.pending = True
                        email.type = 'late_payment_notice'
                        email.put()
                elif subscription.days_past_due >= 3 and not subscription.canceled and organization.subscribed:
                    retry_result = braintree.Subscription.retry_charge(
                        organization.subscription_id
                    )
                    if not retry_result.is_success:
                        braintree.Subscription.cancel(organization.subscription_id)
                        organization.subscription_id = None
                        organization.cancel_subscription = datetime.date.today() + datetime.timedelta(days=2)
                        users = User.query(User.organization == organization.key).fetch()
                        for user in users:
                            email = CronEmail()
                            email.title = 'Payments Missed'
                            email.content = """
                            This is a notice that your organization is now 4+ days late on payment.\n\n

                            We have canceled your subscription and your premium access will be removed within 2 days
                            unless your organization re-subscribes.\n\n

                            -NeteGreek Team
                            """
                            email.email = user.email
                            email.pending = True
                            email.type = 'late_payment_notice2'
                            email.put()
                    elif subscription.days_past_due >= 4 and not subscription.canceled and organization.subscribed:
                        braintree.Subscription.cancel(organization.subscription_id)
                        organization.subscription_id = None
                        organization.cancel_subscription = datetime.date.today() + datetime.timedelta(days=2)
                        users = User.query(User.organization == organization.key).fetch()
                        for user in users:
                            email = CronEmail()
                            email.title = 'Payments Missed'
                            email.content = """
                            This is a notice that your organization is now 4+ days late on payment.\n\n

                            We have canceled your subscription and your premium access will be removed within 2 days
                            unless your organization re-subscribes.\n\n

                            -NeteGreek Team
                            """
                            email.email = user.email
                            email.pending = True
                            email.type = 'late_payment_notice2'
                            email.put()
        organization.put()
    return


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class MainHandler(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('index.html')
        template_values = {}
        self.response.write(template.render(template_values))


class ProfilePictureHandler(webapp2.RequestHandler):
    def get(self):
        upload_url = blobstore.create_upload_url('/upload')
        self.response.out.write('<html><body>')
        self.response.out.write('<form action="%s" method="POST" enctype="multipart/form-data">' % upload_url)
        self.response.out.write("""Upload File: <input type="file" name="file"><br> <input type="submit"
            name="submit" value="Submit"> </form></body></html>""")


class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        user_name = self.request.get('user_name')
        token = self.request.get('token')
        upload_type = self.request.get('type')
        # logging.error('This is my type:' + upload_type)
        user = get_user(user_name, token)
        if not user:
            self.redirect(DOMAIN + '/#/login')
        if upload_type == 'prof_pic':
            upload_files = self.get_uploads('file') # 'file' is file upload field in the form
            crop_data = json.loads(self.request.get('crop_data'))
            blob_info = upload_files[0]
            blob_key = blob_info.key()
            if blob_key:
                blob_info = blobstore.get(blob_key)

                if blob_info:
                    img = images.Image(blob_key=blob_key)
                    img.crop(left_x=float(crop_data['x'])/float(crop_data['bx']),
                             right_x=float(crop_data['x2'])/float(crop_data['bx']),
                             top_y=float(crop_data['y'])/float(crop_data['by']),
                             bottom_y=float(crop_data['y2'])/float(crop_data['by']))
                    img.resize(width=300, height=300)
                    img.im_feeling_lucky()
                    thumbnail = img.execute_transforms(output_encoding=images.PNG)
                    file_name = files.blobstore.create(mime_type='image/png')
                    with files.open(file_name, 'a') as f:
                        f.write(thumbnail)
                    files.finalize(file_name)
                    blobstore.delete(blob_key)
                    if user.prof_pic:
                        blobstore.delete(user.prof_pic)
                    user.prof_pic = files.blobstore.get_blob_key(file_name)
                    user.put()
                    self.redirect(DOMAIN + '/#/app/accountinfo')
                    return
        elif upload_type == 'organization':
            if not user.perms == "council":
                self.redirect(DOMAIN + '/#/app')
            upload_files = self.get_uploads('file') # 'file' is file upload field in the form
            crop_data = json.loads(self.request.get('crop_data'))
            blob_info = upload_files[0]
            blob_key = blob_info.key()
            if blob_key:
                blob_info = blobstore.get(blob_key)

                if blob_info:
                    img = images.Image(blob_key=blob_key)
                    img.crop(left_x=float(crop_data['x'])/float(crop_data['bx']),
                             right_x=float(crop_data['x2'])/float(crop_data['bx']),
                             top_y=float(crop_data['y'])/float(crop_data['by']),
                             bottom_y=float(crop_data['y2'])/float(crop_data['by']))
                    img.resize(width=400, height=300)
                    thumbnail = img.execute_transforms(output_encoding=images.PNG)
                    file_name = files.blobstore.create(mime_type='image/png')
                    with files.open(file_name, 'a') as f:
                        f.write(thumbnail)
                    files.finalize(file_name)
                    blobstore.delete(blob_key)
                    organization = user.organization.get()
                    if organization and organization.image:
                        blobstore.delete(organization.image)
                    organization.image = files.blobstore.get_blob_key(file_name)
                    organization.put()
                    self.redirect(DOMAIN + '/#/app/admin')
                    return
        self.redirect(DOMAIN + '/#/app')
        return


class MorningTasks(webapp2.RequestHandler):
    def get(self):
        if 'X-Appengine-Cron' not in self.request.headers:
            return
        check_birthdays()
        check_subscriptions()
        old_cron_email_tasks = CronEmail.query(CronEmail.timestamp > datetime.datetime.now() +
                                               datetime.timedelta(days=20)).fetch(keys_only=True)
        for key in old_cron_email_tasks:
            key.delete()


class SendEmails(webapp2.RequestHandler):
    def get(self):
        if 'X-Appengine-Cron' not in self.request.headers:
            return
        emails = CronEmail.query(CronEmail.pending == True).fetch()
        futures = []
        for email in emails:
            send_email(from_email='NeteGreek <support@netegreek.com>', to_email=email.email,
                       subject=email.title, body=email.content)

            # mail.send_mail(sender="support@netegreek.com", to=str(email.email),
            #                subject=str(email.title), body=str(email.content))
            email.pending = False
            futures.append(email.put_async())
        for future in futures:
            future.get_result()


class SendDailyNotificationsEmails(webapp2.RequestHandler):
    def get(self):
        users = User.query(User.email_prefs == 'daily').fetch()
        for user in users:
            notification_keys = user.notifications + user.new_notifications + user.hidden_notifications
            now = datetime.datetime.now()
            notifications = Notification.query(ndb.AND(Notification.timestamp > now + datetime.timedelta(days=-1),
                                                       Notification.key.IN(notification_keys))).fetch()
            to_send = dict()
            email_out = [{'email': user.email, 'type': 'to'}]
            to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
            message = dict()
            message["subject"] = 'Daily Notifications Update: ' + datetime.date.today().strftime('%A %B %m %Y')
            message["from_email"] = 'support@netegreek.com'
            message["from_name"] = 'NeteGreek'
            message["to"] = email_out
            out_string = "<html><head></head><body> <h1> Notifications for "
            out_string += datetime.date.today().strftime('%A %B %m %Y') + "<hr></h1>"
            for notification in notifications:
                out_string += "<h3>" + notification.title + "</h3>"
                out_string += "<p>" + notification.content.replace('\n', '<br />') + "</p>"
                out_string += "<p><em>From: " + notification.sender_name + "</em></p><hr/>"
            out_string += "</body></html>"
            message["html"] = out_string
            to_send["message"] = message
            json_data = json.dumps(to_send)
            if len(notifications) > 0:
                result = urlfetch.fetch(url='https://mandrillapp.com/api/1.0/messages/send.json',
                                        payload=json_data,
                                        method=urlfetch.POST,
                                        headers={'Content-Type': 'application/json'})
        return
    # message["html"] = """
            # <p>Dear Albert:</p>
            #
            # <p>Your example.com account has been approved.  You can now visit
            # http://www.example.com/ and sign in using your Google Account to
            # access new features.</p>
            #
            # <p>Please let us know if you have any questions.</p>
            #
            # <p>The example.com Team</p>
            # <img src ="http://thumbs.dreamstime.com/x/emoticon-smiley-face-6800093.jpg" height="150">
            # </body></html>
            #  """


class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, resource):
        resource = str(urllib.unquote(resource))
        blob_info = blobstore.BlobInfo.get(resource)
        self.send_blob(blob_info)
    
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/upload', UploadHandler),
    ('/sendemails', SendEmails),
    ('/dailynotifications', SendDailyNotificationsEmails),
    ('/morningtasks', MorningTasks)

], debug=True)
