var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
if(window.location.href.includes("apps"))
    dhisUrl= window.location.href.split('api/apps/')[0] + '/';
else
    dhisUrl= "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

Reports.controller('ReportsController',['UserService', 'DataSetService', 'DataVizObjectService', '$scope', function(userService, DataSetService, DataVizObjectService, $scope){
    userService.getLoggedInUser()
        .then(function(user){
            $scope.user = user;
            DataVizObjectService.getDataVizObjects(user)
                .then(function(dataVizObjects){
                    _.map(dataVizObjects, function(map){
                        console.log(map.name, dataVizObjects.length);
                    })

                })
        });

    var dataset = DataSetService.getDataSet("IJqIv106lrn")

}]);