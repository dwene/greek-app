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

WEB_CLIENT_ID = 'greek-app'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
ANDROID_AUDIENCE = WEB_CLIENT_ID


"""Password Salt"""
SALT = 'Mary had a little lamb, whose fleece was white as snow and everywhere that mary went the lamb was sure to go'
"""error codes for returning errors"""
ERROR_BAD_ID = 'BAD_LOGIN'
BAD_FIRST_TOKEN = 'BAD_FIRST_TOKEN'
INVALID_FORMAT = "INVALID_FORMAT"
TOKEN_EXPIRED = "TOKEN_EXPIRED"
USERNAME_TAKEN = 'USERNAME_TAKEN'
INCORRECT_PERMS = 'INCORECT_PERMISSIONS'

class IncomingMessage(messages.Message):
    user_name = messages.StringField(1)
    token = messages.StringField(2)
    data = messages.StringField(3)


class OutgoingMessage(messages.Message):
    error = messages.StringField(1)
    data = messages.StringField(2)

"""MODELS"""


class User(ndb.Model):
    user_name = ndb.StringProperty()
    hash_pass = ndb.StringProperty()
    current_token = ndb.StringProperty()
    previous_token = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty()
    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    email = ndb.StringProperty()
    dob = ndb.DateProperty()
    address = ndb.StringProperty()
    city = ndb.StringProperty()
    state = ndb.StringProperty()
    zip = ndb.IntegerProperty()
    phone = ndb.IntegerProperty()
    class_year = ndb.IntegerProperty()
    is_alumni = ndb.BooleanProperty()
    organization = ndb.KeyProperty()
    tag = ndb.StringProperty(repeated=True)
    prof_pic = ndb.BlobKeyProperty()


class Organization(ndb.Model):
    name = ndb.StringProperty()
    school = ndb.StringProperty()
    type = ndb.StringProperty()


def signup_email(url_key):
    key = ndb.Key(urlsafe=url_key)
    new_user = key.get()
    to_email = new_user.email
    token = new_user.organization.get().name
    token += new_user.last_name
    token += generate_token()
    token = token.replace(" ", "")
    new_user.current_token = token
    logging.error(token)
    signup_link = 'https://greek-app.appspot.com/?token='+token+'#/newmember'
    from_email = 'netegreek@greek-app.appspotmail.com'
    subject = "Registration for NeteGreek App!"
    body = "Hello!\n"
    body += "Your account has been created! To finish setting up your NeteGreek account please follow the link below.\n"
    body += signup_link + "\n\n -NeteGreek Team"
    new_user.put()
    mail.send_mail(from_email, to_email, subject, body)

def removal_email(key):
    user = key.get()
    to_email = user.email
    from_email = 'netegreek@greek-app.appspotmail.com'
    subject = 'Removal from NeteGreek App'
    body = "Hello\n"
    body += "This if a notice that you have been removed from the organization '" + user.organization.get().name
    body += "' Please email your NeteGreek administrators for more information\n"
    body += "Have a great day\n\n"
    body+= "NeteGreek Team"
    mail.send_mail(from_email, to_email, subject, body)

def forgotten_password_email(url_key):
    key = ndb.Key(urlsafe=url_key)
    user = key.get()
    to_email = user.email
    from_email = 'netegreek@greek-app.appspotmail.com'
    subject = 'NeteGreek Password Reset'
    token = generate_token()
    user.current_token = token
    user.put()
    link = 'https://greek-app.appspot.com/?token='+token+'#/newpassword'
    body = 'Hello\n'
    body += 'Please follow the link to reset your password. If you believe you are receiving this email in '
    body += 'error please contact your NeteGreek administrator.\n'+ link + '\nHave a great day!\nNeteGreek Team'
    mail.send_mail(from_email, to_email, subject, body)

def testEmail():
    from_email = 'netegreek@greek-app.appspotmail.com'
    body = "Hello! this is a test email! Have a great day!"
    to_email = 'derek.wene@yahoo.com'
    subject = 'test'
    mail.send_mail(from_email, to_email, subject, body)


def dumpJSON(item):
    dthandler = lambda obj: (
        obj.isoformat()
        if isinstance(obj, datetime.datetime)
        or isinstance(obj, datetime.date)
        else None)
    logging.debug(item)
    return json.dumps(item, dthandler)


def check_auth(user_name, token):
    user = User.query(User.user_name == user_name).get()
    dt = (datetime.datetime.now() - user.timestamp)
    if user.current_token == token and dt.days < 3:
        return True
    else:
        return False


def get_user(user_name, token):
    user = User.query(User.user_name == user_name).get()
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
            new_user.tag = ['council']
            new_user.current_token = generate_token()
            new_user.timestamp = datetime.datetime.now()
            new_user.put()
            return OutgoingMessage(error='', data=new_user.current_token)
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
            user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            return OutgoingMessage(data=user.current_token, error='')
        return OutgoingMessage(error=ERROR_BAD_ID, data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/add_users',
                      http_method='POST', name='auth.add_users')
    def add_users(self, request):
        if not check_auth(request.user_name, request.token):
            return OutgoingMessage(error=TOKEN_EXPIRED)
        if 'council' not in User.query(User.user_name == request.user_name).get().tag:
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        logging.error(clump)
        for user in clump['users']:
            new_user = User()
            new_user.first_name = user['first_name']
            new_user.last_name = user['last_name']
            new_user.email = user['email']
            new_user.class_year = int(user['class_year'])
            new_user.organization = User.query(User.user_name == request.user_name).get().organization
            new_user.user_name = ''
            new_user.put()
            signup_email(new_user.key.urlsafe())
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/get_users',
                      http_method='POST', name='auth.get_users')
    def get_users(self, request):
        if not check_auth(request.user_name, request.token):
            return OutgoingMessage(error=TOKEN_EXPIRED)
        request_user = User.query(User.user_name == request.user_name).get()
        if 'council' not in request_user.tag:
            return OutgoingMessage(error=INCORRECT_PERMS)

        organization_users = User.query(User.organization == request_user.organization).fetch()
        user_list = []
        for user in organization_users:
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["previous_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            user_list.append(user_dict)

        return OutgoingMessage(error='', data=dumpJSON(user_list))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/remove_user',
                      http_method='POST', name='auth.remove_user')
    def remove_user(self, request):
        if not check_auth(request.user_name, request.token):
            return OutgoingMessage(error=TOKEN_EXPIRED)
        request_user = User.query(User.user_name == request.user_name).get()
        if 'council' not in request_user.tag:
            return OutgoingMessage(error=INCORRECT_PERMS)
        logging.error(request.data)
        user_info = json.loads(request.data)
        logging.error(user_info)
        user_to_remove = User.query(ndb.AND(User.organization == request_user.organization,
                                            User.email == user_info["email"],
                                            User.first_name == user_info["first_name"],
                                            User.last_name == user_info["last_name"])).get()
        if user_to_remove:
            removal_email(user_to_remove.key)
            user_to_remove.key.delete()
            time.sleep(.25)
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error='USER_NOT_FOUND', data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/new_user',
                      http_method='POST', name='auth.new_user')
    def register_user(self, request):
        logging.error(request.token)
        user = User.query(User.current_token == request.token).get()
        logging.error(user)
        if user and user.user_name == '':
            user_dict = user.to_dict()
            logging.error(user_dict)
            user_dict["hash_pass"] = "xxx"
            user_dict["current_token"] = "xxx"
            user_dict["previous_token"] = "xxx"
            user_dict["organization"] = "xxx"
            return OutgoingMessage(error='', data=dumpJSON(user_dict))
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
        if not check_auth(request.user_name, request.token):
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')

        user = User.query(User.user_name == request.user_name).get()
        logging.error(user.user_name)
        user_dict = user.to_dict()
        del user_dict["hash_pass"]
        del user_dict["current_token"]
        del user_dict["previous_token"]
        del user_dict["organization"]
        del user_dict["timestamp"]
        logging.error(user_dict)
        return OutgoingMessage(error='', data=dumpJSON(user_dict))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/update_user_directory_info',
                      http_method='POST', name='user.update_user_directory_info')
    def update_user_directory_info(self, request):

        user = User.query(User.user_name == request.user_name).get()
        logging.error(user)
        user_data = json.loads(request.data)
        logging.error(user_data)
        for key, value in user_data.iteritems():
            logging.error(key + " " + str(value))
            if key == "email":
                user.email = value
            if key == "first_name":
                user.first_name = value
            if key == "last_name":
                user.last_name = value
            if key == "dob":
                user.dob = datetime.datetime.strptime(value, '%Y-%m-%d')
            if key == "address":
                user.address = value
            if key == "city":
                user.city = value
            if key == "state":
                user.state = value
            if key == "zip":
                user.zip = value
            if key == "class_year":
                user.class_year = value
            if key == "phone":
                user.phone = value
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/forgot_password',
                      http_method='POST', name='auth.forgot_password')
    def forgot_password(self, request):
        user_data = json.loads(request.data)
        email = user_data["email"]
        user = User.query(User.email == email).get()
        forgotten_password_email(user.key.urlsafe())
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='user/upload_profile_picture_url',
                      http_method='POST', name='auth.upload_profile_picture')
    def upload_profile_picture(self, request):
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
        key = request.data
        old_key = user.prof_pic
        blobstore.BlobInfo.get(old_key).delete()
        user.prof_pic = key
        user.put()
        return OutgoingMessage(error='', data=blobstore.BlobInfo.get(user.prof_pic).get_serving_url(secure_url=True))







    # @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/test_email',
    #                   http_method='POST', name='auth.test_email')
    # def test_email(self):
    #     background_thread.BackgroundThread(target=testEmail, args=[]).start()
    #     return OutgoingMessage(error='', data='OK')

    #
    #
    # @endpoints.method(IncomingMessage, OutgoingMessage, path='auth/register',
    #                   http_method='POST', name='auth.register')
    # def add_users(self, request):
    #
    #     user = User()
    #     user.user_name = request.user_name
    #     user.first_name = request.first_name
    #     user.last_name = request.last_name
    #     user.email = request.email
    #     user.hash_pass = hashlib.sha224(request.password + "this is a random string to help in the salting progress "
    #                                                        "blah").hexdigest()
    #     user.current_token = str(uuid.uuid4())
    #     user.time_stamp = datetime.datetime.now()
    #     user.put()
    #     time.sleep(.25)
    #     try:
    #         return UserCreds(current_token=user.current_token, first_name=user.first_name, last_name=user.last_name)
    #     except:
    #         return OutgoingMessage(message='error')
    #
    # @endpoints.method(USER_PASS, UserCreds, path='auth/login/{user_name}/{password}',
    #                   http_method='GET', name='auth.login')
    # def login_user(self, request):
    #     user = User.query().filter(User.user_name == request.user_name).get()
    #     logging.error(user)
    #     if user:
    #         if user.hash_pass == hashlib.sha224(request.password + "this is a random string to help in the salting"
    #                                                                " progress blah").hexdigest():
    #             user.current_token = str(uuid.uuid4())
    #             user.time_stamp = datetime.datetime.now()
    #             user.put()
    #             time.sleep(.5)
    #             return UserCreds(current_token=user.current_token, first_name=user.first_name, last_name=user.last_name)
    #
    #     return OutgoingMessage(message='error')

APPLICATION = endpoints.api_server([RESTApi])
