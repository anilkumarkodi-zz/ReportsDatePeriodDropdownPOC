Reports.service('UserService', ['$http','$translate', function ($http, $translate) {
    this.getLoggedInUser = function () {

        var failurePromise = function () {
            $translate('data_fetch_failed').then(function(translatedValue) {
                alert(translatedValue);
            });
        };

        var UserOrgUnit = function (data) {
            var orgUnit = {};
            orgUnit.name = data.name;
            orgUnit.id = data.id;
            orgUnit.level = data.level;
            orgUnit.dataSets = data.dataSets;
            return orgUnit;
        };

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
                    });
                    return user;
                });
        };

        return $http.get(ApiUrl + "/me.json")
            .then(successPromise, failurePromise);
    };
}]);
