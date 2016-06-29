Reports.directive('templateSelect', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/template/templateSelectorView.html'
    };
});

Reports.controller("templateSelectorCtrl", ["UserService", "$scope", 'Config', function (userService, scope, Config) {
    var getMMRDataSet = function (dataSets) {
        return _.filter(dataSets, function (dataSet) {
            if (dataSet.code)
                return dataSet.code.startsWith(Config.dataSetMonthlyObjectCodePrefix) | dataSet.code.startsWith(Config.dataSetWeeklyObjectCodePrefix);
        });
    };

    scope.dataSets = [];
    userService.getLoggedInUser()
        .then(function (user) {
            scope.dataSets = getMMRDataSet(user.orgUnit.dataSets);
        });
}]);