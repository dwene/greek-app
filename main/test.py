from ndbdatastore import *
import json
import datetime
from google.appengine.ext import ndb


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
