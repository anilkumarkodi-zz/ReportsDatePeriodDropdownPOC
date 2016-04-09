var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
if(window.location.href.includes("apps"))
    dhisUrl= window.location.href.split('api/apps/')[0] + '/';
else
    dhisUrl= "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

Reports.controller('ReportsController',['UserService', 'DataSetService', '$scope', 'DataVizObjectService', 'Config', function(userService, DataSetService, $scope, DataVizObjectService, Config) {
    $scope.getTimePeriod = function(){
        if($scope.selectedTemplate != undefined){
            console.log($scope.selectedTemplate)
            $scope.showTimePeriod=true;
        }
    };

    $scope.getReport = function(){
        if($scope.selectedMonth!=undefined && $scope.selectedYear!=undefined) {
            $scope.user = null;
            $scope.mmrDataSet = {}
            $scope.mmrDataVizObjects = []
            $scope.mmrFilteredDataVizObjects = []

            $scope.isShow = true;

            console.log($scope.selectedYear + $scope.selectedMonth);
            var getMMRDataSet = function(dataSets) {
                return _.filter(dataSets, function(dataSet) {
                    return dataSet.name.startsWith(Config.dataSetObjectNamePrefix)
                })[ 0 ];
            };

            var getDataVizObjects = function(user) {
                $scope.user = user;
                return DataVizObjectService.getDataVizObjects(user)
                  .then(function(dataVizObjects) {
                      $scope.mmrDataVizObjects = dataVizObjects;
                      console.log("All dataviz", $scope.mmrDataVizObjects);
                  })
            };

            var filterDataVizObjects = function() {
                return DataVizObjectService.getFilteredDataVizObjects($scope.mmrDataVizObjects, $scope.selectedYear + $scope.selectedMonth)
                  .then(function(dataVizObjects) {
                      $scope.mmrFilteredDataVizObjects = dataVizObjects;
                      console.log("Filtered dataviz", $scope.mmrFilteredDataVizObjects);
                  });
            };

            var assignFilteredDataVizObjects = function() {
                if( $scope.mmrFilteredDataVizObjects.length != 0 ) {
                    return DataSetService.getDataSet(getMMRDataSet($scope.user.project.dataSets).id, $scope.mmrFilteredDataVizObjects)
                      .then(function(dataset) {
                          console.log("DataSet", dataset)
                          return $scope.mmrDataSet = dataset;
                      });
                }
                else
                    alert('No data charts configured for selected period');
            };

            userService.getLoggedInUser()
              .then(getDataVizObjects)
              .then(filterDataVizObjects)
              .then(assignFilteredDataVizObjects);
        }
        else {
            alert('Please select Time Period');
        }

    };

} ]);

Reports.directive('monthSelect',function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<select ng-model="selectedMonth" required><option value="" disabled selected>Select a Month</option><option ng-repeat="month in months" value="{{month.value}}">{{month.text}}</option></select>',
        controller: ["$scope", "$element", "$attrs", function (scope, element, attrs) {
            scope.months = [];
            scope.months.push({value:"01", text:'January'});
            scope.months.push({value:"02", text:'February'});
            scope.months.push({value:"03", text:'March'});
            scope.months.push({value:"04", text:'April'});
            scope.months.push({value:"05", text:'May'});
            scope.months.push({value:"06", text:'June'});
            scope.months.push({value:"07", text:'July'});
            scope.months.push({value:"08", text:'August'});
            scope.months.push({value:"09", text:'September'});
            scope.months.push({value:"10", text:'October'});
            scope.months.push({value:"11", text:'November'});
            scope.months.push({value:"12", text:'December'});
        }]
    }
});

Reports.directive('yearSelect',function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<select ng-model="selectedYear" required><option value="" disabled selected>Select a Year</option><option ng-repeat="year in years">{{year}}</option></select>',
        controller: ["$scope", "$element", "$attrs", function (scope, element, attrs) {
            scope.years = [];
            for(var i= new Date().getFullYear() ;i>=2000;i--) {
                scope.years.push(i);
            }
        }]
    }
});

Reports.directive('templateSelect',function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<select ng-model="selectedTemplate" ng-change="getTimePeriod()" required><option value="" disabled selected>Select a Template</option><option ng-repeat="set in dataSets" value="{{set.id}}">{{set.name}}</option></select>',
        controller: ["UserService", "$scope", "$element", "$attrs", 'Config', function (userService, scope, element, attrs, Config) {
            var getMMRDataSet = function(dataSets) {
                return _.filter(dataSets, function(dataSet) {
                    return dataSet.name.startsWith(Config.dataSetObjectNamePrefix);
                })[ 0 ];
            };
            scope.dataSets=[];
            userService.getLoggedInUser()
              .then(function(user){
                  scope.dataSets.push(getMMRDataSet(user.project.dataSets));
              });
        }]
    }
});