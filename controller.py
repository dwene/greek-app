import sys
import endpoints
import logging
import datetime
import hashlib
import uuid
from protorpc import messages
from protorpc import message_types
from protorpc import remote
import json
import pickle
from google.appengine.ext import ndb
import time
import collections
from google.appengine.api import mail
from google.appengine.ext import blobstore
from google.appengine.api import images
import urllib
from google.appengine.api import urlfetch



WEB_CLIENT_ID = 'greek-app'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
ANDROID_AUDIENCE = WEB_CLIENT_ID


# "Password Salt"
SALT = 'Mary had a little lamb, whose fleece was white as snow and everywhere that mary went the lamb was sure to go'
# error codes for returning errors
ERROR_BAD_ID = 'BAD_LOGIN'
BAD_FIRST_TOKEN = 'BAD_FIRST_TOKEN'
INVALID_FORMAT = 'INVALID_FORMAT'
TOKEN_EXPIRED = 'TOKEN_EXPIRED'
USERNAME_TAKEN = 'USERNAME_TAKEN'
INCORRECT_PERMS = 'INCORRECT_PERMISSIONS'
INFO_NOT_FILLED_OUT = 'EMPTY_INFO'
INVALID_EMAIL = 'INVALID_EMAIL'
INVALID_USERNAME = 'INVALID_USERNAME'


class IncomingMessage(messages.Message):
    user_name = messages.StringField(1)
    token = messages.StringField(2)
    data = messages.StringField(3)


class OutgoingMessage(messages.Message):
    error = messages.StringField(1)
    data = messages.StringField(2)

# MODELS


class User(ndb.Model):
    #login stuff
    user_name = ndb.StringProperty()
    hash_pass = ndb.StringProperty()
    current_token = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty()
    #general information
    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    dob = ndb.DateProperty()
    #school/work status
    major = ndb.StringProperty()
    occupation = ndb.StringProperty()
    employer = ndb.StringProperty()
    class_year = ndb.IntegerProperty()
    expected_graduation = ndb.DateProperty()
    pledge_class = ndb.StringProperty()
    #address stuff
    address = ndb.StringProperty()
    city = ndb.StringProperty()
    state = ndb.StringProperty()
    zip = ndb.IntegerProperty()
    perm_address = ndb.StringProperty()
    perm_city = ndb.StringProperty()
    perm_state = ndb.StringProperty()
    perm_zip = ndb.IntegerProperty()
    #contact info
    email = ndb.StringProperty()
    phone = ndb.StringProperty()
    facebook = ndb.StringProperty()
    twitter = ndb.StringProperty()
    instagram = ndb.StringProperty()
    linkedin = ndb.StringProperty()
    website = ndb.StringProperty()
    #netegreek info
    organization = ndb.KeyProperty()
    tags = ndb.StringProperty(repeated=True)
    perms = ndb.StringProperty()
    prof_pic = ndb.BlobKeyProperty()
    status = ndb.StringProperty()
    position = ndb.StringProperty()


class Organization(ndb.Model):
    name = ndb.StringProperty()
    school = ndb.StringProperty()
    type = ndb.StringProperty()
    tags = ndb.StringProperty(repeated=True)


class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        else:
            return json.JSONEncoder.default(self, obj)


def member_signup_email(user, request_user):
    to_email = [{'email': user['email'], 'type': 'to', 'name': user['first_name']}]
    token = request_user.organization.get().name
    token += user['last_name']
    token += generate_token()
    token = token.replace(" ", "")
    user['token'] = token
    logging.error(token)
    signup_link = 'https://greek-app.appspot.com/#/newuser/'+token
    from_email = 'netegreek@greek-app.appspotmail.com'
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += "Your account has been created! To finish setting up your NeteGreek account please follow the link below.\n"
    body += signup_link + "\n\n -NeteGreek Team"
    to_send = {}
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = {}
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = 'support@netegreek.com'
    message["from_name"] = 'NeteGreek'
    message["to"] = to_email
    to_send["message"] = message
    json_data = json.dumps(to_send)
    ret_data = {'json_data': json_data, 'user': user}
    return ret_data


def alumni_signup_email(user, request_user):
    to_email = [{'email': user['email'], 'type': 'to'}]
    org = request_user.organization.get()
    token = org.name
    token += user['email']
    token = token.replace("@", "")
    token = token.replace(".", "")
    token += generate_token()
    token = token.replace(" ", "")
    user['token'] = token
    signup_link = 'https://greek-app.appspot.com/#/newuser/'+token
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += org.name + " at " + org.school + "has requested to add you to their database of alumni. If you would like" \
                                             " to add yourself please go to the following link\n"
    body += signup_link + "\n\n -NeteGreek Team"
    to_send = {}
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = {}
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = 'support@netegreek.com'
    message["from_name"] = 'NeteGreek'
    message["to"] = to_email
    to_send["message"] = message
    json_data = json.dumps(to_send)
    ret_data = {'json_data': json_data, 'user': user}
    return ret_data


def send_mandrill_email(from_email, to_emails, subject, body):
    to_send = {}
    to_send["key"] = 'y8EslL_LZDf4__hJZbbMAQ'
    message = {}
    message["text"] = body
    message["subject"] = subject
    message["from_email"] = from_email
    message["from_name"] = 'NeteGreek'
    message["to"] = to_emails
    to_send["message"] = message
    json_data = json.dumps(to_send)
    result = urlfetch.fetch(url='https://mandrillapp.com/api/1.0//messages/send.json',
                            payload=json_data,
                            method=urlfetch.POST,
                            headers={'Content-Type': 'application/json'})
    return


def removal_email(user):
    to_email = [{'email': user.email, 'type': 'to', 'name': user.first_name}]
    from_email = 'support@netegreek.com'
    subject = 'Removal from NeteGreek App'
    body = "Hello\n"
    body += "This if a notice that you have been removed from the organization '" + user.organization.get().name
    body += "' Please email your NeteGreek administrators for more information\n"
    body += "Have a great day\n\n"
    body += "NeteGreek Team"
    send_mandrill_email(from_email, to_email, subject, body)


def forgotten_password_email(user):
    to_email = [{'email': user.email, 'type': 'to', 'name': user.first_name}]
    from_email = 'support@netegreek.com'
    subject = 'NeteGreek Password Reset'
    token = generate_token()
    user.current_token = token
    user.put()
    link = 'https://greek-app.appspot.com/?token='+token+'#/changepasswordfromtoken'
    logging.error(link)
    body = 'Hello\n'
    body += 'Please follow the link to reset your password. If you believe you are receiving this email in '
    body += 'error please contact your NeteGreek administrator.\n'+ link + '\nHave a great day!\nNeteGreek Team'
    send_mandrill_email(from_email, to_email, subject, body)


def check_form_status(user):
    if user:
        if user.address and user.state and user.dob and user.city and user.major:
            return True
        return False


def json_dump(item):
    return json.dumps(item, cls=DateEncoder)


def wait_for_replies(rpcs):
    error = []
    sent = []
    for item in rpcs:
        try:
            result = item['rpc'].get_result()
            text = result.content
            contents = json.loads(result.content)
            logging.error(contents)
            for content in contents:
                if content['status'] == 'error':
                    error.append(item['user'])
                    logging.error('Im being added to error list')
                else:
                    sent.append(item['user'])
                    logging.error('Im being added to sent list')
        except:
            error.append(item['user'])
    return {'errors': error, 'sent': sent}


# Use a helper function to define the scope of the callback.


def check_if_info_set(key):
    return True


def get_user(user_name, token):
    user = User.query(User.user_name == user_name).get()
    if not user:
        return None
    dt = (datetime.datetime.now() - user.timestamp)
    if user.current_token == token and dt.days < 3:
        return user
    else:
        return None


def username_available(user_name):
    if User.query(User.user_name == user_name).get():
        return False
    elif len(user_name) < 5:
        return False
    else:
        return True


def generate_token():
    return str(uuid.uuid4())


def get_key_from_token(token):
    user = User.query().filter(User.current_token == token).get()
    if user:
        return user.key
    return 0

@endpoints.api(name='netegreek', version='v1', allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE])
class RESTApi(remote.Service):
    # USER REQUESTS
    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register_organization',
                      http_method='POST', name='auth.register_organization')
    def register_organization(self, request):
        try:
            clump = json.loads(request.data)
            logging.error(clump)
            new_org = Organization(name=clump['organization']['name'], school=clump['organization']['school'])
            new_org.put()
            user = clump['user']
            if username_available(user['user_name']):
                new_user = User(user_name=user['user_name'])
            else:
                return OutgoingMessage(error=USERNAME_TAKEN, data='')
            new_user.hash_pass = hashlib.sha224(user['password'] + SALT).hexdigest()
            new_user.first_name = user['first_name']
            new_user.last_name = user['last_name']
            new_user.email = user['email']
            new_user.organization = new_org.key
            new_user.perms = 'council'
            new_user.current_token = generate_token()
            new_user.class_year = int(user['class_year'])
            new_user.timestamp = datetime.datetime.now()
            new_user.put()
            return OutgoingMessage(error='', data=json_dump({'token': new_user.current_token, 'perms': new_user.perms}))
        except:
            return OutgoingMessage(error=INVALID_FORMAT + ": " + str(request.data))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/login',
                      http_method='POST', name='auth.login')
    def login(self, request):
        clump = json.loads(request.data)
        user_name = clump['user_name']
        password = clump['password']
        user = User.query(User.user_name == user_name).get()
        if user and user.hash_pass == hashlib.sha224(password + SALT).hexdigest():
            dt = (datetime.datetime.now() - user.timestamp)
            if dt.seconds/60/60 > 18:
                user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            return_item = {'token': user.current_token, 'perms': user.perms}
            return OutgoingMessage(data=json_dump(return_item), error='')
        return OutgoingMessage(error=ERROR_BAD_ID, data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/add_users',
                      http_method='POST', name='auth.add_users')
    def add_users(self, request):

        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        logging.error(clump)
        rpcs = []
        for user in clump['users']:
            email_item = member_signup_email(user, request_user)
            rpc = urlfetch.create_rpc()
            urlfetch.make_fetch_call(rpc=rpc,
                                     url='https://mandrillapp.com/api/1.0/messages/send.json',
                                     payload=email_item['json_data'],
                                     method=urlfetch.POST,
                                     headers={'Content-Type': 'application/json'})
            rpcs.append({'rpc': rpc, 'user': email_item['user']})
        rpc_data = wait_for_replies(rpcs)

        for user in rpc_data['sent']:
            new_user = User()
            new_user.email = user['email']
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.current_token = user['token']
            new_user.first_name = user['first_name']
            new_user.last_name = user['last_name']
            new_user.class_year = int(user['class_year'])
            new_user.perms = 'member'
            new_user.put()

        to_send = json_dump({'errors': rpc_data['errors']})
        return OutgoingMessage(error='', data=to_send)





    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/add_alumni',
                      http_method='POST', name='auth.add_alumni')
    def add_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        logging.error(clump)
        rpcs = []
        for user in clump['users']:
            email_item = alumni_signup_email(user, request_user)
            rpc = urlfetch.create_rpc()
            urlfetch.make_fetch_call(rpc=rpc,
                                     url='https://mandrillapp.com/api/1.0/messages/send.json',
                                     payload=email_item['json_data'],
                                     method=urlfetch.POST,
                                     headers={'Content-Type': 'application/json'})
            rpcs.append({'rpc': rpc, 'user': email_item['user']})
        rpc_data = wait_for_replies(rpcs)

        for user in rpc_data['sent']:
            new_user = User()
            new_user.email = user['email']
            if 'first_name' in user:
                new_user.first_name = user['first_name']
            if 'last_name' in user:
                new_user.last_name = user['last_name']
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.current_token = user['token']
            new_user.perms = 'alumni'
            new_user.put()

        to_send = json_dump({'errors': rpc_data['errors']})
        return OutgoingMessage(error='', data=to_send)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/get_users',
                      http_method='POST', name='auth.get_users')
    def get_users(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS)

        organization_users = User.query(User.organization == request_user.organization).fetch()
        user_list = []
        alumni_list = []
        for user in organization_users:
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["prof_pic"]
            user_dict["key"] = user.key.urlsafe()
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict)
            else:
                user_list.append(user_dict)
            return_object = json_dump({'members': user_list, 'alumni': alumni_list})
        return OutgoingMessage(error='', data=return_object)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/remove_user',
                      http_method='POST', name='auth.remove_user')
    def remove_user(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        logging.error(request.data)
        user_info = json.loads(request.data)
        logging.error(user_info)
        user_to_remove = ndb.Key(urlsafe=user_info["key"]).get()
        if user_to_remove:
            removal_email(user_to_remove)
            user_to_remove.key.delete()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_USERNAME, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/new_user',
                      http_method='POST', name='auth.new_user')
    def register_user(self, request):
        logging.error(request.token)
        user = User.query(User.current_token == request.token).get()
        logging.error(user)
        if user and user.user_name == '':
            user_dict = user.to_dict()
            logging.error(user_dict)
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            return OutgoingMessage(error='', data=json_dump(user_dict))
        return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register_credentials',
                      http_method='POST', name='auth.register_credentials')
    def add_credentials(self, request):
        data = json.loads(request.data)
        user = User.query(User.current_token == request.token).get()
        if user and user.user_name == '':
            if not username_available(data["user_name"]):
                return OutgoingMessage(error='INVALID_USERNAME')
            if not len(data["password"]) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD')
            user.user_name = data["user_name"]
            user.hash_pass = hashlib.sha224(data["password"] + SALT).hexdigest()
            user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            return OutgoingMessage(error='', data=user.current_token)
        return OutgoingMessage(error=ERROR_BAD_ID, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/get_user_directory_info',
                      http_method='POST', name='user.get_user_directory_info')
    def get_user_directory_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        user_dict = request_user.to_dict()
        del user_dict["hash_pass"]
        del user_dict["current_token"]
        del user_dict["organization"]
        del user_dict["timestamp"]
        user_dict["key"] = request_user.key.urlsafe()
        if not user_dict["user_name"]:
            user_dict["has_registered"] = True
        else:
            user_dict["has_registered"] = False
        try:
            user_dict["prof_pic"] = images.get_serving_url(request_user.prof_pic, secure_url=True)
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
        logging.error(request_object["key"])
        user = ndb.Key(urlsafe=request_object["key"]).get()
        if not user:
            return OutgoingMessage(error=INVALID_USERNAME, data='')
        if request_object["perms"] not in ["leadership", "council", "member"]:
            return OutgoingMessage(error=INVALID_FORMAT, data='')
        user.perms = request_object["perms"]
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

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/update_user_directory_info',
                      http_method='POST', name='user.update_user_directory_info')
    def update_user_directory_info(self, request):
        user = User.query(User.user_name == request.user_name).get()
        logging.error(user)
        user_data = json.loads(request.data)
        logging.error(user_data)
        for key, value in user_data.iteritems():
            logging.error(key + " " + str(value))
            if not value:
                continue
            if key == "email":
                user.email = value
            elif key == "first_name":
                user.first_name = value
            elif key == "last_name":
                user.last_name = value
            elif key == "dob":
                user.dob = datetime.datetime.strptime(value, '%Y-%m-%d')
            elif key == "expected_graduation":
                user.expected_graduation = datetime.datetime.strptime(value, '%Y-%m-%d')
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
            elif key == "phone":
                user.phone = value
            elif key == "facebook":
                user.facebook = value
            elif key == "instagram":
                user.instagram = value
            elif key == "twitter":
                user.twitter = value
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
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/forgot_password',
                      http_method='POST', name='auth.forgot_password')
    def forgot_password(self, request):
        user_data = json.loads(request.data)
        if len(user_data["email"]) > 1:
            user = User.query(User.email == user_data["email"]).get()
        elif user_data["user_name"]:
            user = User.query(User.user_name == user_data["user_name"]).get()
        if not user:
            return OutgoingMessage(error=INVALID_EMAIL, data='')
        forgotten_password_email(user)
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/change_password',
                      http_method='POST', name='auth.change_password')
    def change_password(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        request_object = json.loads(request.data)
        old_pass = request_object['old_password']
        if not hashlib.sha224(old_pass + SALT).hexdigest() == user.hash_pass:
            return OutgoingMessage(error=ERROR_BAD_ID)
        new_pass = request_object["password"]
        if not len(new_pass) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD', data='')
        user.hash_pass = hashlib.sha224(new_pass + SALT).hexdigest()
        user.current_token = generate_token()
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/change_password_from_token',
                      http_method='POST', name='auth.change_password_from_token')
    def change_password_from_token(self, request):
        user = User.query(User.current_token == request.token).get()
        if not user:
            return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')
        new_pass = json.loads(request.data)["password"]
        logging.error(new_pass)
        if not len(new_pass) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD', data='')
        user.hash_pass = hashlib.sha224(new_pass + SALT).hexdigest()
        user.current_token = generate_token()
        user.put()
        return OutgoingMessage(error='', data=user.user_name)

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
        if old_key:
            blobstore.BlobInfo.get(old_key).delete()
        user.prof_pic = blobstore.BlobKey(key)
        user.put()
        return OutgoingMessage(error='', data=images.get_serving_url(user.prof_pic))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/directory',
                      http_method='POST', name='auth.get_directory_info')
    def get_directory_info(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_users = User.query(User.organization == user.organization).fetch()
        user_list = []
        alumni_list = []
        for user in organization_users:
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            try:
                user_dict["prof_pic"] = images.get_serving_url(user.prof_pic)
            except:
                del user_dict["prof_pic"]
            if user_dict["perms"] == 'alumni':
                alumni_list.append(user_dict);
            else:
                user_list.append(user_dict)
        return_data = json_dump({'members': user_list, 'alumni': alumni_list})
        return OutgoingMessage(error='', data=return_data)

    #-------------------------
    # TAGGING Endpoints
    #-------------------------

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/add_organization_tag',
                      http_method='POST', name='user.add_organization_tag')
    def add_organization_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        if request_object["tag"] not in organization.tags and len(request_object['tag']) > 1:
            organization.tags.append(request_object["tag"])
            organization.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_FORMAT, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/remove_organization_tag',
                      http_method='POST', name='user.remove_organization_tag')
    def remove_organization_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        if request_object["tag"] in organization.tags:
            organization.tags.remove(request_object['tag'])
            organization.put()
            users = User.query(ndb.AND(User.tags == request_object["tag"],
                               User.organization == request_user.organization)).fetch()
            for user in users:
                user.tags.remove(request_object['tag'])
                user.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_FORMAT, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/rename_organization_tag',
                      http_method='POST', name='user.rename_organization_tag')
    def rename_organization_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        if request_object["old_tag"] in organization.tags:
            organization.tags.remove(request_object['old_tag'])
            organization.tags.append(request_object['new_tag'])
            organization.put()
            users = User.query(ndb.AND(User.tags == request_object["old_tag"],
                               User.organization == request_user.organization)).fetch()
            for user in users:
                user.tags.remove(request_object['old_tag'])
                user.tags.append(request_object['new_tag'])
                user.put()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_FORMAT, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/get_organization_tags',
                      http_method='POST', name='user.get_organization_tags')
    def get_organization_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization = request_user.organization.get()
        if not organization:
            return OutgoingMessage(error='ORGANIZATION_NOT_FOUND', data='')
        return OutgoingMessage(error='', data=json_dump({'tags': organization.tags}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/add_users_tags',
                      http_method='POST', name='user.add_users_tags')
    def add_users_tags(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        organization = request_user.organization.get()
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            for tag in request_object["tags"]:
                if tag not in user.tags and tag in organization.tags:
                    user.tags.append(tag)
            user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='manage/remove_users_tags',
                      http_method='POST', name='user.remove_user_tag')
    def remove_user_tag(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_object = json.loads(request.data)
        for key in request_object["keys"]:
            user = ndb.Key(urlsafe=key).get()
            if not user:
                return OutgoingMessage(error=INVALID_USERNAME, data='')
            for tag in request_object["tags"]:
                if tag in user.tags:
                    user.tags.remove(tag)
            user.put()
        return OutgoingMessage(error='', data='OK')


APPLICATION = endpoints.api_server([RESTApi])
