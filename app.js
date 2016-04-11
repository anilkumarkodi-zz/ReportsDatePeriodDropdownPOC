var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar', 'checklist-model']);
var dhisUrl;
if(window.location.href.includes("apps"))
    dhisUrl= window.location.href.split('api/apps/')[0] + '/';
else
    dhisUrl= "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

Reports.controller('ReportsController',['UserService', 'DataSetService', '$scope', 'DataVizObjectService', 'Config', function(userService, DataSetService, $scope, DataVizObjectService, Config) {

    $scope.selectedDataSet= null;
    $scope.getTimePeriod = function(dataSet){
        if(dataSet != undefined){
            $scope.isShow = false;
            $scope.selectedDataSet=dataSet;
            if(dataSet.name.indexOf("MMR") > -1)
                $scope.showMonthlyTimePeriod = true;
            else {
                $scope.showMonthlyTimePeriod = false;
                alert('Weekly charts available post pilot');
            }
        }
    };

    $scope.getReport = function(){
        $(".no-data-wrapper").hide();
        
        if($scope.selectedMonth!=undefined && $scope.selectedYear!=undefined) {
            $scope.user = null;
            $scope.mmrDataSet = {}
            $scope.mmrDataVizObjects = []
            $scope.isShow = true;

            var getDataVizObjects = function(user) {
                $scope.user = user;
                return DataVizObjectService.getDataVizObjects(user, $scope.selectedDataSet.name)
                  .then(function(dataVizObjects) {
                      $scope.mmrDataVizObjects = dataVizObjects;
                      console.log("All dataviz", $scope.mmrDataVizObjects);
                  })
            };

            var assignDataVizObjectsToDataSet = function() {
                if( $scope.mmrDataVizObjects.length != 0 ) {
                    return DataSetService.getDataSet($scope.selectedDataSet.id, $scope.mmrDataVizObjects)
                      .then(function(dataset) {
                          console.log("DataSet", dataset)
                          return $scope.mmrDataSet = dataset;
                      });
                }
                else
                    alert('No data charts configured for selected template');
            };

            userService.getLoggedInUser()
              .then(getDataVizObjects)
              .then(assignDataVizObjectsToDataSet);
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
        template: '<select class="form-control first-child" ng-model="$parent.selectedMonth" required><option value="" disabled selected>Select a Month</option><option ng-repeat="month in months" value="{{month.value}}">{{month.text}}</option></select>',
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
        template: '<select class="form-control" ng-model="$parent.selectedYear" required><option value="" disabled selected>Select a Year</option><option ng-repeat="year in years" value="{{year}}">{{year}}</option></select>',
        controller: ["$scope", "$element", "$attrs", function (scope, element, attrs) {
            scope.years = [];
            for(var i= new Date().getFullYear() ;i>=2000;i--) {
                scope.years.push(i);
            }
        }]
    }
});