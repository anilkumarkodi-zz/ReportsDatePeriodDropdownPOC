Reports.service('UserService', ['$http', function ($http) {
    this.getLoggedInUser = function () {

        var failurePromise = function () {
            alert('Fetching data failed');
        };

        var UserOrgUnit = function (data) {
            var orgUnit = {};
            orgUnit.name = data.name;
            orgUnit.id = data.id;
            orgUnit.level = data.level;
            orgUnit.dataSets = data.dataSets;
            return orgUnit;
        }

        var getOrganisationUnit = function (orgUnit) {
            var successPromise = function (response) {
                return new UserOrgUnit(response.data);
            };
            return $http.get(ApiUrl + "/organisationUnits/" + orgUnit.id + ".json")
                .then(successPromise, failurePromise)
        };

        var successPromise = function (response) {
            return new User(response.data)
        };

        var User = function (userData) {
            var user = {};
            user.id = userData.id;
            var promises = _.map(userData.organisationUnits, getOrganisationUnit);

            return Promise.all(promises)
                .then(function (organisationUnits) {
                    user.orgUnit = _.minBy(organisationUnits, function (organisationUnit) {
                        return organisationUnit.level;
                    })
                    return user;
                });
        };

        return $http.get(ApiUrl + "/me.json")
            .then(successPromise, failurePromise);
    };
}]);
