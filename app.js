var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
if(window.location.href.includes("apps"))
    dhisUrl= window.location.href.split('api/apps/')[0] + '/';
else
    dhisUrl= "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

Reports.controller('ReportsController',['UserService', 'DataSetService', '$scope', 'DataVizObjectService', 'Config', function(userService, DataSetService, $scope, DataVizObjectService, Config) {
    $scope.getReport = function(){
        $scope.user = null;
        $scope.mmrDataSet = {}
        $scope.mmrDataVizObjects = []
        $scope.mmrFilteredDataVizObjects = []
        var result = {}
        $scope.months=['January', 'February', 'March', 'April' ];
        $scope.years= [];
        $scope.month=null;
        $scope.year=null;
        $scope.isShow=false;
        $scope.isShow=true;

        var getMMRDataSet = function(dataSets) {
            return _.filter(dataSets, function(dataSet) {
                return dataSet.name.startsWith(Config.dataSetObjectName)
            })[ 0 ];
        };

        var getDataVizObjects = function(user) {
            $scope.user = user;
            return DataVizObjectService.getDataVizObjects(user)
              .then(function(dataVizObjects) {
                      $scope.mmrDataVizObjects = dataVizObjects;
                  })
        };

        var filterDataVizObjects = function() {
            return DataVizObjectService.getFilteredDataVizObjects($scope.mmrDataVizObjects, '201604')
              .then(function(dataVizObjects) {
                  $scope.mmrFilteredDataVizObjects = dataVizObjects;
              });
        }

        var assignFilteredDataVizObjects = function() {
            if($scope.mmrFilteredDataVizObjects.length!=0)
                return DataSetService.getDataSet(getMMRDataSet($scope.user.project.dataSets).id, $scope.mmrFilteredDataVizObjects)
                  .then(function(dataset) {
                      console.log(dataset)
                      return $scope.mmrDataSet = dataset;
                  });
            else
                alert('No data charts configured for selected period');
        }

        userService.getLoggedInUser()
          .then(getDataVizObjects)
          .then(filterDataVizObjects)
          .then(assignFilteredDataVizObjects)




        for(var i= new Date().getFullYear() ;i>=2000;i--) {
            $scope.years.push(i);
        }
    };

} ]);