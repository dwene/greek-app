from apiconfig import *
from protorpc import remote
import datetime
import logging
import time

links = endpoints.api(name='link', version='v1',
                      allowed_client_ids=[WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID],
                      audiences=[ANDROID_AUDIENCE])


@ndb.synctasklet
def get_links_by_organization(organization):
    groups = yield LinkGroup.query(LinkGroup.organization == organization).fetch_async()
    key_list = []
    for group in groups:
        for link in group.links:
            key_list.append(link)
    links = yield ndb.get_multi_async(key_list)
    raise ndb.Return((groups, links))


@links.api_class(resource_name='links')
class LinksApi(remote.Service):
    @endpoints.method(IncomingMessage, OutgoingMessage, path='get',
                      http_method='POST', name='get')
    def get_links(self, request):
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        (groups, links) = get_links_by_organization(request_user.organization)
        group_dict = dict()
        out = []
        for group in groups:
            group_dict[group.key.urlsafe()] = []
        for link in links:
            if isinstance(group_dict[link.group.urlsafe()], [].__class__):
                group_dict[link.group.urlsafe()].append(link.to_dict())
        for group in groups:
            gr = group.to_dict()
            gr['links'] = group_dict[group.key.urlsafe()]
            out.append(gr)
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='create',
                      http_method='POST', name='create')
    def create_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if data['newGroup']:
            group = LinkGroup()
            group.name = data['group']
            group.organization = request_user.organization
            group.put()
            group_key = group.key
        else:
            group = ndb.Key(urlsafe=data['group']['key']).get()
            group_key = group.key
        link = Link()
        link.link = data['link']['link']
        link.title = data['link']['title']
        link.group = group_key
        link.organization = request_user.organization
        group.links.append(link.put())
        group.put()
        if data['newGroup']:
            out = dict()
            grp = group.to_dict()
            grp['links'] = [link.to_dict()]
            out['group'] = grp
            out['newGroup'] = True
        else:
            out = dict()
            lnk = link.to_dict()
            out['link'] = lnk
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='edit',
                      http_method='POST', name='edit')
    def edit_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not 'link' in data:
            OutgoingMessage(error='Missing Key', data='')
        link = ndb.Key(urlsafe=data['link']['key']).get()
        futures = []
        link.title = data['link']['title']
        link.link = data['link']['link']
        if data['newGroup'] is True:
            old_group = link.group.get()
            old_group.links.remove(link.key)
            old_group.put()
            group = LinkGroup()
            group.name = data['group']
            group.organization = request_user.organization
            group.links = [ndb.Key(urlsafe=data['link']['key'])]
            link.group = group.put()
            out = group.to_dict()
            out['links'] = [link.to_dict()]
        elif not link.group.urlsafe() is data['link']['group']:
            old_group = link.group.get()
            new_group = ndb.Key(urlsafe=data['link']['group']).get()
            if link.key in old_group.links:
                old_group.links.remove(link.key)
            if link.key not in new_group.links:
                new_group.links.append(link.key)
            link.group = new_group.key
            ndb.put_multi([new_group, old_group])
            out = 'OK'
        link.put()
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete',
                      http_method='POST', name='delete')
    def delete_link(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not 'key' in data:
            return OutgoingMessage(error='Missing key', data='')
        link = ndb.Key(urlsafe=data['key']).get()
        group = link.group.get()
        group.links.remove(link.key)
        futures = [link.key.delete_async(), group.put_async()]
        for future in futures:
            future.get_result()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='create_group',
                      http_method='POST', name='create_group')
    def create_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        group = LinkGroup()
        group.links = []
        group.name = data['name']
        group.organization = request_user.organization
        group.put()
        out = group.to_dict()
        out['key'] = group.key
        return OutgoingMessage(error='', data=json_dump(out))

    @endpoints.method(IncomingMessage, OutgoingMessage, path='rename_group',
                      http_method='POST', name='rename_group')
    def rename_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not all(k in data for k in ('name', 'key')):
            return OutgoingMessage(error='Missing Data', data='')
        group = ndb.Key(urlsafe=data['key']).get()
        group.name = data['name']
        group.put()
        return OutgoingMessage(error='', data='OK')

    @endpoints.method(IncomingMessage, OutgoingMessage, path='delete_group',
                      http_method='POST', name='delete_group')
    def delete_link_group(self, request):
        data = json.loads(request.data)
        request_user = get_user(request.user_name, request.token)
        if not request_user:
            return OutgoingMessage(error=TOKEN_EXPIRED, data='')
        if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
            return OutgoingMessage(error=INCORRECT_PERMS, data='')
        if not 'key' in data:
             return OutgoingMessage(error='Missing Data', data='')
        group = ndb.Key(urlsafe=data['key']).get()
        ndb.delete_multi(group.links)
        group.key.delete()
        return OutgoingMessage(error='', data='OK')


    # @endpoints.method(IncomingMessage, OutgoingMessage, path='edit_group',
    #                   http_method='POST', name='edit_group')
    # def edit_link_group(self, request):
    #     data = json.loads(request.data)
    #     request_user = get_user(request.user_name, request.token)
    #     if not request_user:
    #         return OutgoingMessage(error=TOKEN_EXPIRED, data='')
    #     if not (request_user.perms == 'council' or request_user.perms == 'leadership'):
    #         return OutgoingMessage(error=INCORRECT_PERMS, data='')
    #     group = LinkGroup.query(LinkGroup.key == ndb.Key(urlsafe=data['key'])).fetch()
    #     group.name = data['name']
    #     group.
    #     for link in data['links']:
    #
    #     links = Link.query(Link.group == data['group'], Link.organization ==
    #                        request_user.organization).fetch(keys_only=True)
    #     return OutgoingMessage(error='', data='OK')
