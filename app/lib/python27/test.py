from ndbdatastore import *
from google.appengine.ext import blobstore
import json
import datetime
from google.appengine.ext import ndb
from apns import APNs, Frame, Payload
import time
import hashlib
apns = APNs(use_sandbox=True, cert_file='certs/cert.pem', key_file='certs/key.pem')

def changePasswords():
    users = User.query().fetch()
    for user in users:
        if user.hash_pass:
            print "Changing hash_pass for " + user.user_name
            user.hash_pass = hashlib.sha224(user.hash_pass + user.user_name).hexdigest()
            user.put()


def add_calendars():
    organization = ndb.Key(Organization, 5733679603122176).get()
    public = Calendar()
    public.organization = organization.key
    public.name = 'public'
    public.users = User.query(User.organization == organization.key).fetch(keys_only=True)

    everyone = Calendar()
    everyone.organization = organization.key
    everyone.name = "everyone"
    everyone.users = User.query(User.perms.IN(['council', 'leadership', 'member']),
                                User.organization == organization.key).fetch(keys_only=True)
    leadership = Calendar()
    leadership.organization = organization.key
    leadership.name = "leadership"
    leadership.users = User.query(User.perms.IN(['council', 'leadership']),
                                  User.organization == organization.key).fetch(keys_only=True)
    council = Calendar()
    council.name = 'council'
    council.organization = organization.key
    council.users = User.query(User.perms.IN(['council']),
                               User.organization == organization.key).fetch(keys_only=True)
    organization.calendars = []
    organization.calendars.append(everyone.put())
    organization.calendars.append(leadership.put())
    organization.calendars.append(council.put())
    organization.calendars.append(public.put())
    organization.put()

def moveLinks():
    org = ndb.Key(Organization, 5733679603122176).get()
    links = Link.query(Link.organization == org.key).fetch()
    for link in links:
        ln = link.to_dict()
        print str(ln)
    return

def create_linkgroups():
    org = ndb.Key(Organization, 5733679603122176).get()
    hash = dict()
    hash['Panhellenic'] = ndb.get_multi([ndb.Key(Link, 4916071710588928), ndb.Key(Link, 5117441587806208)])
    hash['Administrative'] = ndb.get_multi([ndb.Key(Link, 5103040226918400), ndb.Key(Link, 5188137487695872),
                                            ndb.Key(Link, 5715233054130176), ndb.Key(Link, 6269278466605056)])
    hash['Education'] = ndb.get_multi([ndb.Key(Link, 5134152701575168), ndb.Key(Link, 5629998891270144),
                                            ndb.Key(Link, 5722070642065408), ndb.Key(Link, 6260052608417792)])
    hash['Public Relations'] = ndb.get_multi([ndb.Key(Link, 5140064254296064), ndb.Key(Link, 5688959128567808)])
    hash['Membership'] = ndb.get_multi([ndb.Key(Link, 5724479581847552), ndb.Key(Link, 5760043521671168)])
    hash['President'] = ndb.get_multi([ndb.Key(Link, 5663773708779520)])

    for name in ['Panhellenic', 'Administrative', 'Education', 'Public Relations', 'Membership', 'President']:
        gr = LinkGroup()
        gr.organization = org.key
        gr.name = name
        gr.links = []
        gr_key = gr.put()
        link_keys = list()
        print name + ": "
        for link in hash[name]:
            print link.title
            link.group = gr_key
            link_keys.append(link.key)
            link.put()
        gr.links = link_keys
        gr.put()


def UpdateSchema():
    orgs = [ndb.Key(Organization, 5746664899870720).get()]
    for org in orgs:
        links = Link.query(Link.organization == org.key).fetch()
        link_groups = LinkGroup.query(LinkGroup.organization == org.key).fetch()
        group_dict = {}
        for group in org.link_groups:
            for lg in link_groups:
                if lg.name == group:
                    group_dict[group] = lg
                    break
            new_group = LinkGroup()
            new_group.name = group
            new_group.links = []
            new_group.organization = org.key
            new_group.put()
            group_dict[group] = new_group
        for link in links:
            print str(link.to_dict())
            if isinstance(link.group, ''.__class__):
                link.group = group_dict[link.group].key
                group_dict[link.group].links.append(link.key)
                link.put()
        for key, value in group_dict.iteritems():
            print "putting linkgroup"
            value.put()
    return

def test_push():
    token_hex = '8812b1c4bc78bc74e27a5e7c4128697aaafdf5f617c92fbfa3a2afc1c705f850'
    payload = Payload(alert="Hello World!", sound="default", badge=1)
    apns.gateway_server.send_notification(token_hex, payload)


def removeNotifications():
    print "Starting Remove Notifications"
    all_users = User.query().fetch()
    print "All users fetched"
    futures = list()
    i = 0
    print "All Users List Length: " + str(len(all_users))
    for user in all_users:
        user.notifications = []
        user.new_notifications = []
        user.hidden_notifications = []
        i += 1
        try:
            user.put()
            print "Users put: " + str(i)
        except:
            print "It didnt work..."
            try:
                print user.key.urlsafe()
                print user.first_name
                print user.last_name
                print user.organization.urlsafe()
            except:
                "Couldnt print all the properties.."
    print "Removed all instanced of notifications. Terminating."


def show_notifications():
    users = User.query().fetch()
    none_count = 0
    for user in users:
        for item in user.new_notifications:
            temp = item.get()
            if not temp:
                print "I got none"
                none_count += 1
                user.new_notifications.remove(item)
            print temp
        for item in user.notifications:
            temp = item.get()
            if not temp:
                print "I got none"
                none_count += 1
                user.notifications.remove(item)
            print temp
        for item in user.hidden_notifications:
            temp = item.get()
            if not temp:
                print "I got none"
                none_count += 1
                user.hidden_notifications.remove(item)
            print temp    
        user.put()

def deleteMyPicture():
    derek = User.query(User.user_name == 'dwene').get()
    derek.prof_pic = None
    derek.put()


def fixJake():
    jake = ndb.Key(urlsafe="agtzfmdyZWVrLWFwcHIRCxIEVXNlchiAgICAluq8CAw").get()
    jake.channel_tokens = []
    jake.notifications = []
    jake.new_notifications = []
    jake.hidden_notifications = []
    jake.put()

def updateNotifications():
    notifications = Notification.query().fetch()

    users = User.query().fetch()
    count = 0
    for notify in notifications:
        count = count + 1
        print 'starting message' + str(count)
        if notify.type == 'message':
            m = Message()
            m.title = notify.title
            m.content = notify.content
            m.timestamp = notify.timestamp
            m.sender = notify.sender
            m.sender_name = notify.sender_name
            key = m.put()
            for user in users:
                user_dict = user.to_dict()
                if "notifications" in user_dict:
                    if notify.key in user.notifications:
                        user.notifications.remove(notify.key)
                        user.messages.append(key)
                if "hidden_notifications" in user_dict:
                    if notify.key in user.hidden_notifications:
                        user.hidden_notifications.remove(notify.key)
                        user.archived_messages.append(key)
                if "new_notifications" in user_dict:
                    if notify.key in user.new_notifications:
                        user.new_notifications.remove(notify.key)
                        user.new_messages.append(key)
    futures = list()
    for user in users:
        futures.append(user.put_async())
    for future in futures:
        future.get_result()


# def deleteNotifications():
#     notifications = Notification.query().fetch()
#     users = User.query().fetch()
#     futures = list()
#     for notify in notifications:
#         futures.append(notify.key.delete_async())
#     for user in users:
#         user.notifications = []
#         user.hidden_notifications = []
#         user.new_notifications = []
#         futures.append(user.put_async())
#     for future in futures:
#         future.get_result()

def deleteSentNotifications():
    users = User.query().fetch()
    futures = list()
    for user in users:
        user.sent_notifications = []
        futures.append(user.put_async())
    for future in futures:
        future.get_result()

def test_directory():
    time1 = datetime.datetime.now()
    # agtzfmdyZWVrLWFwcHIZCxIMT3JnYW5pemF0aW9uGICAgICF2JcKDA
    organization = ndb.Key(urlsafe = "agtzfmdyZWVrLWFwcHIZCxIMT3JnYW5pemF0aW9uGICAgICF2JcKDA")
    organization_users = User.query(User.organization == organization).fetch(projection=[User.first_name, User.last_name,User.prof_pic,User.user_name])
    # event_list_future = Event.query(Event.organization == organization,
    #                                 ).fetch_async(projection=[Event.going, Event.tag])
    # organization_users = organization_users_future.get_result()
    print datetime.datetime.now() - time1
    # event_list = event_list_future.get_result()
    user_list = list()
    for user in organization_users:
        user_list.append(user.key)
    time2 = datetime.datetime.now()
    ndb.get_multi(user_list)
    print "Howdy: " + str(datetime.datetime.now() - time2)
    event_list = list()
    print datetime.datetime.now() - time1
    user_list = list()
    alumni_list = list()
    for user in organization_users:
        user_dict = user.to_dict()
        del user_dict["hash_pass"]
        del user_dict["current_token"]
        del user_dict["organization"]
        del user_dict["timestamp"]
        del user_dict["notifications"]
        del user_dict["new_notifications"]
        del user_dict["hidden_notifications"]
        event_tags = list()
        for event in event_list:
            if user.key in event.going:
                event_tags.append(event.tag)
        user_dict["event_tags"] = event_tags
        user_dict["key"] = user.key.urlsafe()
        if user.dob:
            user_dict["dob"] = user.dob.strftime("%m/%d/%Y")
        else:
            del user_dict["dob"]
        user_dict["key"] = user.key.urlsafe()
        if user_dict["perms"] == 'alumni':
            alumni_list.append(user_dict)
        else:
            user_list.append(user_dict)
    time6 = datetime.datetime.now()
    print time6 - time1
