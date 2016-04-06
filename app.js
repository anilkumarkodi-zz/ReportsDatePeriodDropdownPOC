var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
if(window.location.href.includes("apps"))
    dhisUrl= window.location.href.split('api/apps/')[0] + '/';
else
    dhisUrl= "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

Reports.controller('ReportsController',['UserService', 'DataSetService', '$scope', 'DataVizObjectService', 'Config', function(userService, DataSetService, $scope, DataVizObjectService, Config) {
    var user;
    $scope.mmrDataSet = {}
    var result = {}

    var getMMRDataSet = function(dataSets) {
        return _.filter(dataSets, function(dataSet) {
            return dataSet.name.startsWith(Config.dataSetObjectName)
        })[ 0 ];
    };

    userService.getLoggedInUser()
      .then(function(user) {
          $scope.user = user;
          DataVizObjectService.getDataVizObjects(user)
            .then(function(dataVizObjects) {
                _.map(dataVizObjects, function(map) {
                    console.log(map.name, dataVizObjects.length);
                })
            });

          DataSetService.getDataSet(getMMRDataSet(user.project.dataSets).id)
            .then(function(dataset) {
                return $scope.mmrDataSet = dataset;
            });
      });

    } ]);