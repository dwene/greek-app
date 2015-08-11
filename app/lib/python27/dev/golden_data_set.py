__author__ = 'Derek'
from apiconfig import *
from ndbdatastore import *
from endpoint_apis.auth import hash_password

def regenerate_data_set():

    organization_key = create_organization()
    users = create_users(organization_key)
    chatter = create_chatter(organization_key)


def create_users(org_key):
    derek = User()
    derek.organization = org_key
    derek.user_name = 'dwene'
    derek.hash_pass = hash_password('password', derek.user_name)
    derek.perms = 'admin'

def create_organization():
    organization = Organization()
    organization.school = "Texas A&M University"
    organization.name = "NeteGreek Phi"
    organization.color = "cyan"
    organization.type = "fraternity"
    return organization.put()


def create_chatter(org_key):
    chatter = Chatter()
    chatter.organization = org_key