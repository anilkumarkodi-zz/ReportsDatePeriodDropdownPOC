var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
if(window.location.href.includes("apps"))
    dhisUrl= window.location.href.split('api/apps/')[0] + '/';
else
    dhisUrl= "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

Reports.controller('ReportsController',['UserService', 'DataSetService', '$scope', 'Config', function(userService, DataSetService, $scope, Config){
    var user;
    $scope.mmrDataSet = {}
    var result ={}

    var getMMRDataSet = function(dataSets){
        return _.filter(dataSets, function(dataSet){
            return dataSet.name.startsWith(Config.dataSetObjectName)
        })[0];
    };

    userService.getUser()
        .then(function(user){
            user = user;
            DataSetService.getDataSet(getMMRDataSet(user.project.dataSets).id)
              .then(function(dataset){
                  return $scope.mmrDataSet = dataset;
            });
        });

}]);