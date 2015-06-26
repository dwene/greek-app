from apiconfig import *
from protorpc import remote
import datetime
from notifications import Notifications

events = endpoints.api(name='event', version='v1',
                       allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                       audiences=[ANDROID_AUDIENCE])


@events.api_class(resource_name='polls')
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
        new_event = Event()
        new_event.creator = request_user.key
        if "description" in event_data:
            new_event.description = event_data["description"]
        new_event.title = event_data["title"]
        new_event.time_start = datetime.datetime.strptime(event_data["time_start"], '%m/%d/%Y %I:%M %p')
        new_event.time_end = datetime.datetime.strptime(event_data["time_end"], '%m/%d/%Y %I:%M %p')
        new_event.time_created = datetime.datetime.now()
        new_event.organization = request_user.organization
        new_event.org_tags = event_data["tags"]["org_tags"]
        if "location" in event_data:
            new_event.location = event_data["location"]
        if 'address' in event_data:
            new_event.address = event_data["address"]
        for tag in new_event.org_tags:
            if tag not in request_user.recently_used_tags:
                request_user.recently_used_tags.insert(0, tag)
            if len(request_user.recently_used_tags) > 5:
                request_user.recently_used_tags = request_user.recently_used_tags[:5]
        new_event.perms_tags = event_data["tags"]["perms_tags"]
        if EVERYONE in event_data["tags"]["perms_tags"]:
            new_event.perms_tags = ['everyone']
        users = get_users_from_tags(event_data["tags"], request_user.organization, False)
        new_event_key = new_event.put()
        future_list = list()
        recurring = False
        if 'recurring' in event_data and event_data['recurring'] == True:
            recurring_type = event_data['recurring_type']
            end_date = datetime.datetime.strptime(event_data['until'], '%m/%d/%Y')
            recurring_end = datetime.datetime(end_date.year, end_date.month, end_date.day, 23, 59, 59)
            curr_start_date = new_event.time_start
            curr_end_date = new_event.time_end
            if recurring_type == 'weekly':
                curr_start_date = curr_start_date + datetime.timedelta(days=7)
                curr_end_date = curr_end_date + datetime.timedelta(days=7)
            elif recurring_type == 'monthly':
                curr_start_date = curr_start_date + datetime.timedelta(months=1)
                curr_end_date = curr_end_date + datetime.timedelta(months=1)
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
                if "location" in event_data:
                    ev.location = event_data["location"]
                if 'address' in event_data:
                    ev.address = event_data["address"]
                ev.perms_tags = new_event.perms_tags
                ev.parent_event = new_event_key
                recurring = True
                future_list.append(ev.put_async())
                if recurring_type == 'weekly':
                    curr_start_date = curr_start_date + datetime.timedelta(days=7)
                    curr_end_date = curr_end_date + datetime.timedelta(days=7)
                elif recurring_type == 'monthly':
                    curr_start_date = curr_start_date + datetime.timedelta(months=1)
                    curr_end_date = curr_end_date + datetime.timedelta(months=1)
                else:
                    break

        notification = Notification()
        notification.type = 'event'
        if recurring:
            notification.content = request_user.first_name + " " + request_user.last_name + " invited you to the repeated events: " + event_data["title"]
        else:
            notification.content = request_user.first_name + " " + request_user.last_name + " invited you to the event: " + event_data["title"]
        notification.sender = new_event.creator
        notification.timestamp = datetime.datetime.now()
        notification.link = 'app/events/' + new_event_key.urlsafe()
        notification.created_key = new_event_key
        notification.put()
        future_list.append(request_user.put_async())
        Notifications.add_notification_to_users(notification, users,  {'type': 'event', 'key': new_event_key})
        for item in future_list:
            item.get_result()
        return OutgoingMessage(error='', data=json_dump(new_event_key.urlsafe()))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='check_tag_availability',
                      http_method='POST', name='event.check_tag_availability')
    def check_tag_availability(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        tag = json.loads(request.data)
        if not check_availability_of_tag(tag, request_user.organization):
            return OutgoingMessage(error=TAG_INVALID, data='')
        # logging.error()
        # organization_future = request_user.organization.get_async()
        # event_future = Event.query(ndb.AND(Event.organization == request_user.organization,
        #                                    Event.tag == tag.lower())).get_async()
        # organization = organization_future.get_result()
        # logging.error('The tag im checking is ' + tag.lower())
        # if tag.lower() in organization.tags:
        #     return OutgoingMessage(error=TAG_INVALID, data='')
        # if event_future.get_result():
        #     return OutgoingMessage(error=TAG_INVALID, data='')
        # if tag.lower() in ['alumni', 'member', 'council', 'leadership', 'everyone']:
        #     return OutgoingMessage(error=TAG_INVALID, data='')
        # logging.error('And its valid')
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='rsvp',
                      http_method='POST', name='event.rsvp')
    def rsvp_event(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        event_data = json.loads(request.data)
        event = ndb.Key(urlsafe=event_data["key"]).get()
        if event_data["rsvp"] == "going":
            if request_user.key in event.not_going:
                event.not_going.remove(request_user.key)
            if request_user.key not in event.going:
                event.going.append(request_user.key)
            event.put()
        elif event_data["rsvp"] == "not_going":
            if request_user.key in event.going:
                event.going.remove(request_user.key)
            if request_user.key not in event.not_going:
                event.not_going.append(request_user.key)
            event.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='get_events',
                      http_method='POST', name='event.get_events')
    def get_events(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if len(request_user.tags) > 0:
            events = Event.query(ndb.AND(Event.organization == request_user.organization,
                                 ndb.OR(Event.org_tags.IN(request_user.tags),
                                        Event.perms_tags == request_user.perms,
                                        Event.perms_tags == 'everyone',
                                        Event.going == request_user.key))).order(-Event.time_start).fetch()
        else:
            events = Event.query(ndb.AND(Event.organization == request_user.organization,
                                 ndb.OR(Event.perms_tags == request_user.perms,
                                        Event.perms_tags == 'everyone',
                                        Event.going == request_user.key))).order(-Event.time_start).fetch()
        out_events = list()
        for event in events:
            dict_event = event.to_dict()
            dict_event["tags"] = {"org_tags": event.org_tags, "perms_tags": event.perms_tags}
            dict_event["key"] = event.key
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
        event = ndb.Key(urlsafe=request_data["key"]).get()
        if event.organization != request_user.organization:
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        change = False
        for key, value in request_data.iteritems():
            if key == "time_start":
                if not event.time_start == datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p'):
                    event.time_start = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
                    change = True
            elif key == "time_end":
                if not event.time_end == datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p'):
                    event.time_end = datetime.datetime.strptime(value, '%m/%d/%Y %I:%M %p')
                    change = True
            elif key == "title":
                if not event.title == value:
                    event.title = value
                    change = True
            elif key == "description":
                if not event.description == value:
                    event.description = value
                    change = True
            elif key == "location":
                if not event.location == value:
                    event.location = value
                    change = True
            elif key == 'address':
                if not event.address == value:
                    event.address = value
                    change = True
            elif key == "tags":
                if "org_tags" in value:
                    event.org_tags = value["org_tags"]
                if "perms_tags" in value:
                    event.perms_tags = value["perms_tags"]
                    if EVERYONE in value["perms_tags"]:
                        event.perms_tags = ['everyone']
                # invited_users = get_users_from_tags(tags=value,
                #                                     organization=request_user.organization,
                #                                     keys_only=True)
                # going_difference = set(event.going).difference(set(invited_users))
                # not_going_difference = set(event.not_going).difference(set(invited_users))
                # if len(going_difference) > 0:
                #     for _key in list(going_difference):
                #         event.going.remove(_key)
                # if len(not_going_difference) > 0:
                #     for _key in list(not_going_difference):
                #         event.not_going.remove(_key)
        futures = list()
        futures.append(event.put_async())
        if change:
            users = get_users_from_tags({'org_tags': event.org_tags, 'perms_tags': event.perms_tags},
                                        request_user.organization, False)
            notification = Notification()
            notification.type = 'event'
            notification.content = request_user.first_name + " " + request_user.last_name +" updated the event: " + event.title
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
        event = Event.query(Event.key == event_key).get()
        users_future = User.query(ndb.AND(User.organization ==
                                  request_user.organization, User.perms != 'alumni')) .fetch_async(projection=[User.user_name, User.prof_pic,
                                                                                     User.first_name, User.last_name])
        attendance_data_future = AttendanceData.query(AttendanceData.event == event_key).fetch_async()
        users = users_future.get_result()
        attendance_data = attendance_data_future.get_result()
        data_list = list()
        for user in users:
            user_dict = user.to_dict()
            user_dict["key"] = user.key
            for att in attendance_data:
                if att.user == user.key:
                    user_dict["attendance_data"] = att.to_dict()
            data_list.append(user_dict)
        # for att in attendance_data:
        #     att_dict = att.to_dict()
        #     for user in users:
        #         if user.key == att.user:
        #             att_dict["user"] = user.to_dict()
        #             if user.key in event.going:
        #                 att_dict["going"] = True
        #             elif user.key in event.not_going:

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
        user_key = ndb.Key(urlsafe=data["user_key"])
        event_key = ndb.Key(urlsafe=data["event_key"])
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
        if "clear" in data:
            if data["clear"] is True and att_data:
                att_data.time_in = None
                att_data.put()
                return OutgoingMessage(error='', data='OK')
            elif data["clear"] is True and not att_data:
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
            if "note" in data:
                att_data.note = data["note"]
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
        user_key = ndb.Key(urlsafe=data["user_key"])
        event_key = ndb.Key(urlsafe=data["event_key"])
        att_data = AttendanceData.query(ndb.AND(AttendanceData.event == event_key,
                                                AttendanceData.user == user_key)).get()
        if "clear" in data:
            if data["clear"] is True and att_data:
                att_data.time_out = None
                att_data.put()
                return OutgoingMessage(error='', data='OK')
            elif data["clear"] is True and not att_data:
                return OutgoingMessage(error='', data='OK')
        if att_data:
            att_data.time_out = datetime.datetime.now()
            att_data.put()
        else:
            att_data = AttendanceData()
            att_data.user = user_key
            att_data.event = event_key
            att_data.time_out = datetime.datetime.now()
            if "note" in data:
                att_data.note = data["note"]
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