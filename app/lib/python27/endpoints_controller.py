# -*- coding: utf-8 -*-
import sys
import os
if os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'python27')) not in sys.path:
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'python27')))
from endpoint_apis.chatter import chatter_api
from endpoint_apis.links import links
from endpoint_apis.polls import polls
from endpoint_apis.events import events
from endpoint_apis.auth import auth
from endpoint_apis.admin import admin_api
from channels import channels
from notifications import notifications_api
from apiconfig import *

api = endpoints.api(name='netegreek', version='v1',
                    allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                    audiences=[ANDROID_AUDIENCE])

@api.api_class(resource_name='full_api')
class RESTApi(remote.Service):

    @endpoints.method(IncomingMessage, OutgoingMessage, path='organization/info',
                      http_method='POST', name='auth.organization_info')
    def organization_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization = request_user.organization.get()
        out = dict(name=organization.name, school=organization.school)
        out["subscribed"] = organization.subscribed
        out["color"] = organization.color
        out["link_groups"] = organization.link_groups
        try:
            out["image"] = get_image_url(organization.image)
        except:
            out["image"] = ''
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/check_login',
                      http_method='POST', name='user.check_login')
    def check_login(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/report_error',
                      http_method='POST', name='user.report_error')
    def report_error(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        message = json.loads(request.data)
        email = 'support@netegreek.com'
        content = 'User: '+request_user.first_name+' '+request_user.last_name + ' | ' + request_user.user_name + ' \n'
        content += '\nEmail: ' + request_user.email
        content += '\n\nMessage: ' + message
        title = 'Message from ' + request_user.user_name
        send_email('NeteGreek <support@netegreek.com>', email, title, content, False)
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/check_username',
                      http_method='POST', name='user.check_username')
    def check_username(self, request):
        if username_available(json.loads(request.data)):
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=USERNAME_TAKEN, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/get_user_directory_info',
                      http_method='POST', name='user.get_user_directory_info')
    def get_user_directory_info(self, request):

        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        user_dict = request_user.to_dict()
        if user_dict["dob"]:
            user_dict["dob"] = request_user.dob.strftime("%m/%d/%Y")
        if not user_dict["user_name"]:
            user_dict["has_registered"] = True
        else:
            user_dict["has_registered"] = False
        try:
            user_dict["prof_pic"] = get_image_url(request_user.prof_pic)
        except:
            del user_dict["prof_pic"]
        return OutgoingMessage(error='', data=json_dump(user_dict))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/manage_perms',
                      http_method='POST', name='user.manage_perms')
    def manage_perms(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)

        @ndb.tasklet
        def calendars_and_user(user_key, organization):
            calendars_fetch = Calendar.query(Calendar.organization == organization).fetch_async()
            user_fetch = user_key.get_async()
            usr, cal = yield user_fetch, calendars_fetch
            raise ndb.Return((cal, usr))

        calendars, user = calendars_and_user(ndb.Key(urlsafe=request_object["key"]), request_user.organization)
        if not user:
            return OutgoingMessage(error=INVALID_USERNAME, data='')
        if request_object["perms"] not in ["leadership", "council", "member"]:
            return OutgoingMessage(error=INVALID_FORMAT, data='')
        user.perms = request_object["perms"]
        calendar_list = ["council", "leadership", "everyone", "public"]
        if user.perms is "council":
            None
        elif user.perms is "leadership":
            calendar_list = calendar_list[1:3]
        elif user.perms is "member":
            calendar_list = calendar_list[2:3]
        elif user.perms is "alumni":
            calendar_list = [calendar_list[3]]
        futures = list()
        for cal in calendars:
            if cal.name in calendar_list and user.key not in cal.users:
                cal.users.append(user.key)
            elif cal.name not in calendar_list and user.key in cal.users:
                cal.users.remove(user.key)
            futures.append(cal.put_async())
        user.put()
        for future in futures:
            future.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/users_emails',
                      http_method='POST', name='user.manage_users_emails')
    def manage_users_emails(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        user = ndb.Key(urlsafe=request_object["key"]).get()
        if not user:
            return OutgoingMessage(error=INVALID_USERNAME, data='')
        user.email = request_object["email"]
        user.put()
        return OutgoingMessage(error='', data='OK')    

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/convert_to_alumni',
                      http_method='POST', name='user.convert_to_alumni')
    def convert_to_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            user.perms = 'alumni'

            user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/revert_from_alumni',
                      http_method='POST', name='user.revert_from_alumni')
    def revert_from_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            user.perms = 'member'
            user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/resend_welcome_email',
                      http_method='POST', name='user.resend_welcome_email')
    def resend_welcome_email(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        if 'key' in request_object:
            user = ndb.Key(urlsafe=request_object["key"]).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            if user.perms == 'alumni':
                email = alumni_signup_email(user.to_dict(), request_user.organization, user.current_token)
                cron = EmailTask()
                cron.content = email["text"]
                cron.title = email["subject"]
                cron.pending = True
                cron.type = 'welcome_again'
                cron.timestamp = datetime.datetime.now()
                cron.email = user.email
                cron.put()
            else:
                email = member_signup_email(user=user.to_dict(), token=user.current_token)
                cron = EmailTask()
                cron.content = email["text"]
                cron.title = email["subject"]
                cron.pending = True
                cron.type = 'welcome_again'
                cron.timestamp = datetime.datetime.now()
                cron.email = user.email
                cron.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/resend_all_welcome_emails',
                      http_method='POST', name='user.resend_all_welcome_emails')
    def resend_all_welcome_emails(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        users = User.query(User.organization == request_user.organization).fetch()
        async_items = []
        for user in users:
            if not user.user_name:
                email = member_signup_email(user=user.to_dict(), token=user.current_token)
                cron = EmailTask()
                cron.content = email["text"]
                cron.title = email["subject"]
                cron.pending = True
                cron.type = 'welcome_again'
                cron.timestamp = datetime.datetime.now()
                cron.email = user.email
                async_items.append(cron.put_async())
        for item in async_items:
            item.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/update_user_directory_info',
                      http_method='POST', name='user.update_user_directory_info')
    def update_user_directory_info(self, request):
        user = User.query(User.user_name == request.user_name).get()
        user_data = json.loads(request.data)
        for key, value in user_data.iteritems():
            if not value and value != "":
                continue
            if key == "email":
                user.email = value
            elif key == "first_name":
                user.first_name = value
            elif key == "last_name":
                user.last_name = value
            elif key == "dob":
                user.dob = datetime.datetime.strptime(value, '%m/%d/%Y')
            elif key == "grad_month":
                user.grad_month = int(value)
            elif key == "grad_year":
                user.grad_year = int(value)
            elif key == "address":
                user.address = value
            elif key == "city":
                user.city = value
            elif key == "state":
                user.state = value
            elif key == "zip":
                user.zip = int(value)
            elif key == "class_year":
                user.class_year = int(value)
            elif key == "pledge_class_year":
                user.pledge_class_year = int(value)
            elif key == "pledge_class_semester":
                user.pledge_class_semester = value.lower()
            elif key == "phone":
                user.phone = value
            elif key == "facebook":
                user.facebook = value
            elif key == "instagram":
                user.instagram = value
            elif key == "twitter":
                user.twitter = value
            elif key == "linkedin":
                user.linkedin = value
            elif key == "website":
                user.website = value
            elif key == "perm_address":
                user.perm_address = value
            elif key == "perm_city":
                user.perm_city = value
            elif key == "perm_state":
                user.perm_state = value
            elif key == "perm_zip":
                user.perm_zip = value
            elif key == "major":
                user.major = value
            elif key == "status":
                user.status = value
            elif key == "expected_graduation":
                user.expected_graduation = value
            elif key == "position":
                user.position = value
            elif key == "occupation":
                user.occupation = value
            elif key == "employer":
                user.employer = value
            elif key == "pledge_class":
                user.pledge_class = value
            elif key == "email_prefs":
                user.email_prefs = value
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/get_upload_url',
                      http_method='POST', name='auth.get_upload_url')
    def get_upload_url(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        upload_url = blobstore.create_upload_url('/upload')
        return OutgoingMessage(error='', data=upload_url)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/set_uploaded_prof_pic',
                      http_method='POST', name='auth.upload_profile_picture')
    def upload_profile_picture(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        key = json.loads(request.data)["key"]
        old_key = user.prof_pic
        if old_key and blobstore.BlobInfo.get(old_key):
            blobstore.BlobInfo.get(old_key).delete()
        user.prof_pic = blobstore.BlobKey(key)
        user.put()
        return OutgoingMessage(error='', data=get_image_url(user.prof_pic))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/directory_less',
                      http_method='POST', name='auth.directory_less')
    def directory_less(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_users_future = User.query(User.organization == request_user.organization).fetch_async(projection=[User.user_name, User.first_name, User.last_name, User.perms, User.prof_pic, User.email])
        organization_users = organization_users_future.get_result()
        user_list = list()
        alumni_list = list()
        for user in organization_users:
            user_dict = user.to_dict()
            user_dict['key'] = user.key
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict)
            else:
                user_list.append(user_dict)
        return_data = json_dump({'members': user_list, 'alumni': alumni_list})
        return OutgoingMessage(error='', data=return_data)


    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/get_user',
                      http_method='POST', name='user.get_by_user')
    def get_user_by_username(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        data = json.loads(request.data)
        user = User.query(User.user_name == data['user']).get()
        if user.organization is not request_user.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        return_data = json_dump(user.to_dict())
        return OutgoingMessage(error='', data=return_data)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/directory',
                      http_method='POST', name='auth.directory')
    def directory(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_users = User.query(User.organization == request_user.organization).fetch()
        user_list = list()
        alumni_list = list()
        for user in organization_users:
            user_dict = user.to_dict()
            if user.dob:
                user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
            else:
                del user_dict["dob"]
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict)
            else:
                user_list.append(user_dict)
        return_data = json_dump({'members': user_list, 'alumni': alumni_list})
        return OutgoingMessage(error='', data=return_data)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/set_iphone_token',
                      http_method='POST', name='user.set_iphone_token')
    def set_iphone_token(self, request):
        data = json.loads(request.data)
        futures = list()
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        users = User.query(User.iphone_tokens == data).fetch()
        for user in users:
            if not user.key == request_user.key:
                user.iphone_tokens.remove(data)
                futures.append(user.put_async())
        if not data in request_user.iphone_tokens:
            request_user.iphone_tokens.append(data)
            futures.append(request_user.put_async())
        for f in futures:
            f.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/set_android_token',
                      http_method='POST', name='user.set_android_token')
    def set_android_token(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not data in request_user.android_tokens:
            request_user.android_tokens.append(data)
            request_user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/change_profile_image',
                      http_method='POST', name='user.change_profile_image')
    def change_prof_pic(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        img_data = data["img"]
        crop_data = json.loads(data["crop"])
        blob_key = set_profile_picture(request_user.user_name+'_'+id_generator(), img_data, crop_data)
        if request_user.prof_pic:
            blobstore.delete(request_user.prof_pic)
        request_user.prof_pic = blobstore.BlobKey(blob_key)
        request_user.put()
        return OutgoingMessage(error='', data=json_dump(get_image_url(blob_key)))


    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/get_updates',
                      http_method='POST', name='user.get_updates')
    def get_updates(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        new_timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        if 'timestamp' not in data:
            return OutgoingMessage(error='', data=json_dump({'updates': [], 'timestamp': new_timestamp}))
        timestamp = datetime.datetime.strptime(str(data['timestamp']), "%Y-%m-%dT%H:%M:%S")
        if type(timestamp) is not datetime.datetime:
            return OutgoingMessage(error='', data=json_dump({'updates': [], 'timestamp': new_timestamp}))
        else:
            updates = Update.query(Update.timestamp >= timestamp).fetch()
            out_updates = []
            for update in updates:
                out_updates.append(update.data)
            return OutgoingMessage(error='', data=json_dump({'updates': out_updates, 'timestamp': new_timestamp}))


APPLICATION = endpoints.api_server([api, chatter_api, links, polls, events, auth, channels, notifications_api,
                                    admin_api])
