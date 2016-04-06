var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
if(window.location.href.includes("apps"))
    dhisUrl= window.location.href.split('api/apps/')[0] + '/';
else
    dhisUrl= "http://localhost:8000";
var ApiUrl = dhisUrl + '/api';

Reports.controller('ReportsController',['DataSetService', function(DataSetService){
  var dataset = DataSetService.getDataSet("IJqIv106lrn")
}]);