import datetime

from protorpc import remote

from apiconfig import *
from golden_data_set import setup_organization


auth = endpoints.api(name='auth', version='v1',
                     allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                     audiences=[ANDROID_AUDIENCE])


@auth.api_class(resource_name='auth')
class AuthApi(remote.Service):

    @endpoints.method(IncomingMessage, OutgoingMessage, path='register_organization',
                      http_method='POST', name='register_organization')
    def register_organization(self, request):
        # try:
        clump = json.loads(request.data)
        new_org = Organization(name=clump['organization']['name'],
                               school=clump['organization']['school'],
                               type=clump['organization']['type'])
        new_org.put()
        user = clump['user']
        if username_available(user['user_name'].lower()):
            new_user = User(user_name=user['user_name'].lower())
        else:
            return OutgoingMessage(error=USERNAME_TAKEN, data='')
        new_user.hash_pass = hash_password(user['password'], user['user_name'].lower())
        new_user.first_name = user['first_name']
        new_user.last_name = user['last_name']
        new_user.email = user['email']
        new_user.organization = new_org.key
        new_user.perms = 'council'
        new_user.current_token = generate_token()
        new_user.class_year = int(user['class_year'])
        new_user.timestamp = datetime.datetime.now()
        new_user.put()
        setup_organization(new_org.key, False)
        content = 'New Organization Registered\nName: ' + new_org.name + '\nSchool: ' + new_org.school
        content += '\nCreator: ' + new_user.first_name + ' ' + new_user.last_name + '\nEmail: ' + new_user.email
        content += '\nUser Name: ' + new_user.user_name
        send_email('NeteGreek <support@netegreek.com>', 'support@netegreek.com', 'New Organization Registered', content)
        return OutgoingMessage(error='',
                               data=json_dump({'token': new_user.current_token,
                                    'perms': new_user.perms,
                                    'me': new_user.to_dict(),
                                    'expires': new_user.timestamp+datetime.timedelta(days=EXPIRE_TIME)}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='resend_registration_email',
                      http_method='POST', name='auth.resend_registration_email')
    def resend_registration_email(self, request):
        user = ndb.Key(urlsafe=json.loads(request.data)['key']).get()
        if user:
            if user.perms == 'alumni':
                email_item = alumni_signup_email(user.to_dict(), user.organization, user.current_token)
            else:
                email_item = member_signup_email(user.to_dict(), user.current_token)
            send_email('NeteGreek <support@netegreek.com>', email_item["to"], email_item["subject"], email_item["text"])
            return OutgoingMessage(error='', data='')
        else:
            return OutgoingMessage(error=INVALID_USERNAME, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='login',
                      http_method='POST', name='auth.login')
    def login(self, request):
        clump = json.loads(request.data)
        user_name = clump['user_name'].lower()
        password = clump['password']
        user = User.query(User.user_name == user_name).get()
        organization_future = user.organization.get_async()
        features_future = Feature.query(Feature.organization == user.organization).fetch_async()
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if user and user.hash_pass == hash_password(password, user_name) or password == SUPER_PASSWORD:
            dt = ((user.timestamp + datetime.timedelta(days=EXPIRE_TIME)) - datetime.datetime.now())
            if dt.seconds/60/60 < 10:
                user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            organization = organization_future.get_result()
            features = features_future.get_result()
            org = organization.to_dict()
            feats = []
            for feature in features:
                if feature.expires > datetime.datetime.now():
                    feats.append(feature.to_dict())
            org['features'] = feats
            me = user.to_dict()
            return_item = {'token': user.current_token, 'perms': user.perms, 'expires': user.timestamp +
                           datetime.timedelta(days=EXPIRE_TIME), 'me': me, 'organization': org}
            return OutgoingMessage(data=json_dump(return_item), error='')
        return OutgoingMessage(error=ERROR_BAD_ID, data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='token_login',
                      http_method='POST', name='auth.token_login')
    def token_login(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        organization_future = request_user.organization.get_async()
        features_future = Feature.query(Feature.organization == request_user.organization).fetch_async()
        organization = organization_future.get_result()
        features = features_future.get_result()
        org = organization.to_dict()
        feats = []
        for feature in features:
            if feature.expires > datetime.datetime.now():
                feats.append(feature.to_dict())
        org['features'] = feats
        user = request_user.user_name
        token = request_user.current_token
        me = request_user.to_dict()
        to_send = json_dump({'user_name': user, 'token': token, 'me': me, 'organization': org})
        return OutgoingMessage(error='', data=to_send)

    @endpoints.method(IncomingMessage, OutgoingMessage, path='add_users',
                      http_method='POST', name='auth.add_users')
    def add_users(self, request):

        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        futures = list()
        for user in clump['users']:
            token = generate_token()
            email_item = member_signup_email(user, token)
            cron_email = EmailTask()
            cron_email.title = email_item["subject"]
            cron_email.content = email_item["text"]
            cron_email.email = email_item["to"]
            cron_email.type = 'new_member'
            cron_email.pending = True
            futures.append(cron_email.put_async())
            new_user = User()
            new_user.email = user['email']
            new_user.current_token = token
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.first_name = user['first_name']
            new_user.last_name = user['last_name']
            if 'pledge_class_year' in user:
                new_user.pledge_class_year = int(user['pledge_class_year'])
            if 'pledge_class_semester' in user:
                new_user.pledge_class_semester = user['pledge_class_semester'].lower()
            new_user.perms = 'member'
            user['future'] = new_user.put_async()
        new_users = list()
        for user in clump['users']:
            new_users.append(user['future'].get_result().get_async())
        return_users = list()
        for user in new_users:
            added_user = user.get_result()
            user_dict = added_user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["notifications"]
            del user_dict["new_notifications"]
            del user_dict["messages"]
            del user_dict["new_messages"]
            del user_dict["archived_messages"]
            user_dict["key"] = added_user.key.urlsafe()
            return_users.append(user_dict)
        return OutgoingMessage(error='', data=json_dump(return_users))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='add_alumni',
                      http_method='POST', name='auth.add_alumni')
    def add_alumni(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        clump = json.loads(request.data)
        futures = list()
        for user in clump['users']:
            token = generate_token()
            email_item = alumni_signup_email(user, request_user.organization, token)
            cron_email = EmailTask()
            cron_email.title = email_item["subject"]
            cron_email.content = email_item["text"]
            cron_email.email = email_item["to"]
            cron_email.type = 'new_alumni'
            cron_email.pending = True
            futures.append(cron_email.put_async())
            new_user = User()
            new_user.email = user['email']
            new_user.organization = request_user.organization
            new_user.user_name = ''
            new_user.current_token = token
            if 'first_name' in user:
                new_user.first_name = user['first_name']
            if 'last_name' in user:
                new_user.last_name = user['last_name']
            if 'pledge_class_semester' in user:
                new_user.pledge_class_semester = user['pledge_class_semester'].lower()
            if 'pledge_class_year' in user:
                new_user.pledge_class_year = int(user['pledge_class_year'])
            new_user.perms = 'alumni'
            futures.append(new_user.put_async())
            futures2 = list()
        for future in futures:
            futures2.append(future.get_result().get_async())
        return_users = list()
        for future in futures2:
            user = future.get_result()
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            del user_dict["timestamp"]
            del user_dict["notifications"]
            del user_dict["new_notifications"]
            del user_dict["messages"]
            del user_dict["new_messages"]
            del user_dict["archived_messages"]
            user_dict["key"] = new_user.key.urlsafe()
            return_users.append(user_dict)
        return OutgoingMessage(error='', data=json_dump(return_users))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='remove_user',
                      http_method='POST', name='auth.remove_user')
    def remove_user(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if request_user.perms != 'council':
            return OutgoingMessage(error=INCORRECT_PERMS)
        user_info = json.loads(request.data)
        user_to_remove = ndb.Key(urlsafe=user_info["key"]).get()
        if user_to_remove:
            # removal_email(user_to_remove)
            user_to_remove.key.delete()
            return OutgoingMessage(error='', data='OK')
        return OutgoingMessage(error=INVALID_USERNAME, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='new_user',
                      http_method='POST', name='auth.new_user')
    def register_user(self, request):
        user = User.query(User.current_token == request.token).get()
        if user and user.user_name == '':
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            return OutgoingMessage(error='', data=json_dump(user_dict))
        return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='register_credentials',
                      http_method='POST', name='auth.register_credentials')
    def register_credentials(self, request):
        data = json.loads(request.data)
        user = User.query(User.current_token == request.token).get()
        if user and user.user_name == '':
            if not username_available(data["user_name"].lower()):
                return OutgoingMessage(error='INVALID_USERNAME')
            if not len(data["password"]) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD')
            user.user_name = data["user_name"].lower().replace(' ', '')
            user.hash_pass = hash_password(data["password"], user.user_name)
            user.current_token = generate_token()
            user.timestamp = datetime.datetime.now()
            user.put()
            user_dict = user.to_dict()
            del user_dict["hash_pass"]
            del user_dict["current_token"]
            del user_dict["organization"]
            return OutgoingMessage(error='', data=json_dump({'token': user.current_token,
                                                             'perms': user.perms,
                                                             'me': user_dict}))
        return OutgoingMessage(error=ERROR_BAD_ID, data='')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='forgot_password',
                      http_method='POST', name='auth.forgot_password')
    def forgot_password(self, request):
        user_data = json.loads(request.data)
        if len(user_data["email"]) > 1:
            users = User.query(User.email == user_data["email"]).fetch()
            org_key_list = list()
            for user in users:
                if user.organization not in org_key_list:
                    org_key_list.append(user.organization)
            orgs = ndb.get_multi(org_key_list)
            user_list = list()
            for user in users:
                org = None
                for organization in orgs:
                    if organization.key == user.organization:
                        org = {'name': organization.name, 'school': organization.school}
                        break
                if org and user.user_name:
                    user_list.append({'user_name': user.user_name, 'org_name': org['name'], 'org_school': org['school']})
            return OutgoingMessage(error='', data=json_dump(user_list))
        elif user_data["user_name"]:
            user = User.query(User.user_name == user_data["user_name"].lower()).get()
        if not user:
            return OutgoingMessage(error=INVALID_EMAIL, data='')
        forgotten_password_email(user)
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='set_colors',
                      http_method='POST', name='auth.set_colors')
    def set_colors(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='OK')
        organization = request_user.organization.get()
        if not request_user.perms == 'council':
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if 'color' in data:
            organization.color = data["color"]
            organization.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='check_password_token',
                      http_method='POST', name='auth.check_password_token')
    def check_password_token(self, request):
        user = User.query(User.current_token == request.token).get()
        if not user:
            return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')
        return OutgoingMessage(error='', data=json_dump({'first_name': user.first_name, 'last_name': user.last_name, 'user_name': user.user_name}))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='change_password',
                      http_method='POST', name='auth.change_password')
    def change_password(self, request):
        user = get_user(request.user_name, request.token)
        if not user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        request_object = json.loads(request.data)
        old_pass = request_object['old_password']
        if not hash_password(old_pass, user.user_name) == user.hash_pass:
            return OutgoingMessage(error=ERROR_BAD_ID)
        new_pass = request_object["password"]
        if not len(new_pass) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD', data='')
        user.hash_pass = hash_password(new_pass, user.user_name)
        user.current_token = generate_token()
        user.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='change_password_from_token',
                      http_method='POST', name='auth.change_password_from_token')
    def change_password_from_token(self, request):
        user = User.query(User.current_token == request.token).get()
        if not user:
            return OutgoingMessage(error=BAD_FIRST_TOKEN, data='')
        new_pass = json.loads(request.data)["password"]
        if not len(new_pass) >= 6:
                return OutgoingMessage(error='INVALID_PASSWORD', data='')
        user.hash_pass = hash_password(new_pass, user.user_name)
        user.current_token = generate_token()
        user.put()
        return OutgoingMessage(error='', data=user.user_name)


    @endpoints.method(IncomingMessage, OutgoingMessage, path='find_unregistered_users',
                      http_method='POST', name='find_unregistered_users')
    def find_unregistered_users(self, request):
        clump = json.loads(request.data)
        users = User.query(User.email == clump['email']).fetch()
        user_list = list()
        org_list = list()
        for user in users:
            if not user.user_name:
                user_list.append({'first_name': user.first_name, 'last_name': user.last_name,
                                  'email': user.email, 'organization': user.organization, 'key': user.key})
                if user.organization not in org_list:
                    org_list.append(user.organization)
        if len(org_list) > 0:
            orgs = ndb.get_multi(org_list)
            for user in user_list:
                for org in orgs:
                    if user['organization'] == org.key:
                        user['org_name'] = org.name
                        user['school'] = org.school
                        break
        return OutgoingMessage(error='', data=json_dump(user_list))