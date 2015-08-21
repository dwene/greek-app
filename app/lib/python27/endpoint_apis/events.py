from apiconfig import *
from protorpc import remote
import datetime
from notifications import Notifications
from dateutil.relativedelta import relativedelta
from pushfactory import PushFactory
events = endpoints.api(name='event', version='v1',
                       allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                       audiences=[ANDROID_AUDIENCE])


@events.api_class(resource_name='events')
class EventsApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='create',
                      http_method='POST', name='event.create')
    def create_event(self, request):
        event_data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        organization = request_user.organization.get()
        new_event = Event()
        new_event.creator = request_user.key
        if 'description' in event_data:
            new_event.description = event_data['description']
        new_event.title = event_data['title']
        new_event.time_start = datetime.datetime.strptime(event_data['time_start'], '%m/%d/%Y %I:%M %p')
        new_event.time_end = datetime.datetime.strptime(event_data['time_end'], '%m/%d/%Y %I:%M %p')
        new_event.time_created = datetime.datetime.now()
        new_event.organization = request_user.organization
        if 'location' in event_data:
            new_event.location = event_data['location']
        if 'address' in event_data:
            new_event.address = event_data['address']
        if 'calendar' in event_data:
            cal_key = ndb.Key(urlsafe=event_data['calendar'])
            if cal_key in organization.calendars:
                new_event.calendar = cal_key
        new_event_key = new_event.put()
        individuals = []
        if 'individuals' in event_data:
            invite_keys = []
            for individual in event_data['individuals']:
                invite_key = ndb.Key(urlsafe=individual)
                if invite_key.kind() is User:
                    invite_keys.append(invite_key)
            individuals = ndb.get_multi(invite_keys)
            for invite in individuals:
                if invite.organization is not organization.key:
                    individuals.remove(invite)
        new_event.invites = individuals
        future_list = list()
        recurring = False
        if 'recurring' in event_data and event_data['recurring'] is True:
            recurring_type = event_data['recurring_type']
            end_date = datetime.datetime.strptime(event_data['until'], '%m/%d/%Y')
            curr_start_date = new_event.time_start
            curr_end_date = new_event.time_end
            if recurring_type == 'weekly':
                curr_start_date = curr_start_date + relativedelta(days=7)
                curr_end_date = curr_end_date + relativedelta(days=7)
            elif recurring_type == 'monthly':
                curr_start_date = curr_start_date + relativedelta(months=1)
                curr_end_date = curr_end_date + relativedelta(months=1)
            while curr_start_date <= end_date:
                ev = Event()
                ev.creator = new_event.creator
                ev.description = new_event.description
                ev.title = new_event.title
                ev.time_start = curr_start_date
                ev.time_end = curr_end_date
                ev.time_created = new_event.time_created
                ev.organization = new_event.organization
                ev.org_tags = new_event.org_tags
                if 'location' in event_data:
                    ev.location = event_data['location']
                if 'address' in event_data:
                    ev.address = event_data['address']
                ev.calendar = new_event.invites
                ev.invites = new_event.invites
                ev.parent_event = new_event_key
                recurring = True
                future_list.append(ev.put_async())
                if recurring_type == 'weekly':
                    curr_start_date = curr_start_date + relativedelta(days=7)
                    curr_end_date = curr_end_date + relativedelta(days=7)
                elif recurring_type == 'monthly':
                    curr_start_date = curr_start_date + relativedelta(months=1)
                    curr_end_date = curr_end_date + relativedelta(months=1)
                else:
                    break
        notification = dict()
        if recurring:
            notification['content'] = request_user.first_name + ' ' + request_user.last_name + ' invited you to the repeated events: ' + event_data['title']
        else:
            notification['content'] = request_user.first_name + ' ' + request_user.last_name + ' invited you to the event: ' + event_data['title']
        notification['sender'] = new_event.creator
        notification['type'] = 'EVENT'
        notification['type_key'] = new_event_key
        if new_event.calendar:
            calendar = new_event.calendar.get()
            push_keys = list(set(calendar.users) | set(new_event.invites))
        else:
            push_keys = new_event.invites
        PushFactory.send_notification_with_keys(notification, push_keys)
        return OutgoingMessage(error='', data=json_dump(new_event_key.urlsafe()))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='get_events',
                      http_method='POST', name='event.get_events')
    def get_events(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        now = datetime.datetime.now()
        this_month = datetime.datetime(int(now.strftime("%Y")), int(now.strftime("%m")), 1)
        start_month = this_month - relativedelta(months=2)
        end_month = this_month + relativedelta(months=4)
        calendars = Calendar.query(Calendar.organization == request_user.organization,
                                   Calendar.users == request_user.key).fetch(keys_only=True)
        events = Event.query(ndb.OR(Event.calendar.IN(calendars),
                                    Event.invites == request_user.key,
                                    Event.creator == request_user.key),
                             Event.time_start > start_month, Event.time_start < end_month).\
            fetch(projection=[Event.time_start, Event.time_end, Event.title])
        out_events = list()
        for event in events:
            dict_event = event.to_dict()
            out_events.append(dict_event)
        return OutgoingMessage(error='', data=json_dump(out_events))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='edit_event',
                      http_method='POST', name='event.edit_event')
    def edit_event(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        request_data = json.loads(request.data)
        event = ndb.Key(urlsafe=request_data['key']).get()
        if event.organization != request_user.organization or event.kind() is not Event:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        change = False
        for key, value in request_data.iteritems():
            if key == 'time_start':
                if not event.time_start == datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p'):
                    event.time_start = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
                    change = True
            elif key == 'time_end':
                if not event.time_end == datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p'):
                    event.time_end = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
                    change = True
            elif key == 'title':
                if not event.title == value:
                    event.title = value
                    change = True
            elif key == 'description':
                if not event.description == value:
                    event.description = value
                    change = True
            elif key == 'location':
                if not event.location == value:
                    event.location = value
                    change = True
            elif key == 'address':
                if not event.address == value:
                    event.address = value
                    change = True
        futures = list()
        futures.append(event.put_async())
        if change:
            users = get_users_from_tags({'org_tags': event.org_tags, 'perms_tags': event.perms_tags},
                                        request_user.organization, False)
            notification = Notification()
            notification.type = 'event'
            notification.content = request_user.first_name + ' ' + request_user.last_name +' updated the event: ' + event.title
            notification.sender = request_user.key
            notification.timestamp = datetime.datetime.now()
            notification.link = 'app/events/'+event.key.urlsafe()
            notification.put()
            Notifications.add_notification_to_users(notification, users, {'type': 'event', 'key': event.key})
            for item in futures:
                item.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='get_check_in_info',
                      http_method='POST', name='event.get_check_in_info')
    def get_check_in_info(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        event_key = ndb.Key(urlsafe=json.loads(request.data))
        users_future = User.query(ndb.AND(User.organization ==
                                  request_user.organization, User.perms != 'alumni'))\
            .fetch_async(projection=[User.user_name, User.prof_pic, User.first_name, User.last_name])
        attendance_data_future = AttendanceData.query(AttendanceData.event == event_key).fetch_async()
        users = users_future.get_result()
        attendance_data = attendance_data_future.get_result()
        data_list = list()
        for user in users:
            user_dict = user.to_dict()
            user_dict['key'] = user.key
            for att in attendance_data:
                if att.user == user.key:
                    user_dict['attendance_data'] = att.to_dict()
            data_list.append(user_dict)
        return OutgoingMessage(error='', data=json_dump(data_list))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='check_in',
                      http_method='POST', name='event.check_in')
    def check_in(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        user_key = ndb.Key(urlsafe=data['user_key'])
        event_key = ndb.Key(urlsafe=data['event_key'])
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
        if 'clear' in data:
            if data['clear'] is True and att_data:
                att_data.time_in = None
                att_data.put()
                return OutgoingMessage(error='', data='OK')
            elif data['clear'] is True and not att_data:
                return OutgoingMessage(error='', data='OK')
        if att_data:
            att_data.time_in = datetime.datetime.now()
            att_data.put()
            return OutgoingMessage(error='', data='OK')  # They are already checked in
        else:
            att_data = AttendanceData()
            att_data.user = user_key
            att_data.event = event_key
            att_data.time_in = datetime.datetime.now()
            if 'note' in data:
                att_data.note = data['note']
            att_data.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='check_out',
                      http_method='POST', name='event.check_out')
    def check_out(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        data = json.loads(request.data)
        user_key = ndb.Key(urlsafe=data['user_key'])
        event_key = ndb.Key(urlsafe=data['event_key'])
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
        if 'clear' in data:
            if data['clear'] is True and att_data:
                att_data.time_out = None
                att_data.put()
                return OutgoingMessage(error='', data='OK')
            elif data['clear'] is True and not att_data:
                return OutgoingMessage(error='', data='OK')
        if att_data:
            att_data.time_out = datetime.datetime.now()
            att_data.put()
        else:
            att_data = AttendanceData()
            att_data.user = user_key
            att_data.event = event_key
            att_data.time_out = datetime.datetime.now()
            if 'note' in data:
                att_data.note = data['note']
            att_data.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete',
                      http_method='POST', name='event.delete')
    def delete_event(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        event_key = ndb.Key(urlsafe=json.loads(request.data))
        event_data = AttendanceData.query(AttendanceData.event == event_key).fetch(keys_only=True)
        notifications = Notification.query(Notification.created_key == event_key).fetch(keys_only=True)
        ndb.delete_multi(event_data)
        ndb.delete_multi(notifications)
        event_key.delete()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='calendars',
                      http_method='POST', name='calendars')
    def get_calendars(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        calendars = Calendar.query(Calendar.organization == request_user.organization,
                                   Calendar.name.IN(['everyone', 'leadership', 'council'])).fetch()
        user_keys = set()
        for calendar in calendars:
            user_keys = user_keys | set(calendar.users)
        user_keys = list(user_keys)
        users = User.query(User.key.IN(user_keys)).fetch(projection=[User.first_name, User.last_name, User.prof_pic])
        user_dict = dict()
        for user in users:
            user_dict[user.key] = user
        calendar_list = []
        for calendar in calendars:
            cal = calendar.to_dict()
            users = []
            for user in calendar.users:
                if user_dict[user] is not None:
                    users.append(user_dict[user].to_dict())
            cal['users'] = users
            calendar_list.append(cal)
        return OutgoingMessage(error='', data=json_dump(calendar_list))