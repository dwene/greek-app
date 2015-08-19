__author__ = 'Derek'
from apiconfig import *
from ndbdatastore import *

def UpdateSchema():
    orgs = [ndb.Key(Organization, 5746664899870720)]
    for org in orgs:
        links = Link.query(Link.organization == org).fetch()
        link_groups = LinkGroup.query(LinkGroup.organization == org).fetch()
        group_dict = {}
        for group in org.link_groups:
            for lg in link_groups:
                if lg.name == group:
                    group_dict[group] = lg
                    break
            new_group = LinkGroup()
            new_group.name = group
            new_group.links = []
            new_group.organization = org
            new_group.put()
            group_dict[group] = new_group
        for link in links:
            if isinstance(link.group, ''.__class__):
                link.group = group_dict[link.group].key
                group_dict[link.group].links.append(link.key)
                link.put()
        for key, value in group_dict.iteritems():
            value.put()
    return