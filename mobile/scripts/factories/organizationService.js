App.service('OrganizationService', function (AUTH_EVENTS, $rootScope) {
  this.create = function (organization) {
    this.organization = organization;
    this.color = organization.color;
    this.me = organization.me;
    this.link_groups = organization.link_groups;
    this.perms = organization.perms;
    $rootScope.$broadcast('organization:updated');
  };
  this.destroy = function () {
    this.organization = null;
    this.color = null;
    this.me = null;
    this.link_groups = null;
    this.perms = null;
  };
  return this;
});