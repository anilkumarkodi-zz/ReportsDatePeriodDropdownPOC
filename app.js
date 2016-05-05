var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
if (window.location.href.includes("apps"))
    dhisUrl = window.location.href.split('api/apps/')[0];
else
    dhisUrl = "http://localhost:8000/";
var ApiUrl = dhisUrl + 'api';
setTimeout(function () {
    dhis2.menu.mainAppMenu.closeAll();
}, 2000);
Reports.controller('ReportsController', ['UserService', 'DataSetService', '$scope', 'VizObjectService', 'Config', 'NarrativeService', function (userService, DataSetService, $scope, VizObjectService, Config, NarrativeService) {
    $scope.noDataMessageShown = true;
    $scope.selectedDataSet = null;
    $scope.getTimePeriod = function (dataSet) {
        $scope.reportShown = false;
        $scope.noDataMessageShown = true;
        $scope.spinnerShown = false;

        if (dataSet != undefined) {
            $scope.isShow = false;
            $scope.selectedDataSet = dataSet;
            if (dataSet.code.startsWith(Config.dataSetMonthlyObjectCodePrefix))
                $scope.showMonthlyTimePeriod = true;
            else {
                $scope.showMonthlyTimePeriod = false;
                alert('Weekly charts available post pilot');
            }
        }
    };

    $scope.calculateHeight = function (event) {
        var textArea = event.target;

        textArea.style.overflow = 'hidden';
        textArea.style.height = 0;
        textArea.style.height = textArea.scrollHeight + 'px';

    };

    $scope.getReport = function () {
        $scope.noDataMessageShown = false;
        $scope.spinnerShown = true;
        if ($scope.selectedMonth != undefined && $scope.selectedYear != undefined) {
            $scope.user = null;
            $scope.mmrDataSet = {}
            $scope.saveReport = function (textArea) {
                NarrativeService.saveNarratives([$scope.narratives[textArea.dataElement.id]]);
            }
            $scope.isShow = true;
            $scope.mmrVizObjects = [];

            var getVizObjects = function (user) {
                $scope.user = user;
                var selectedTimePeriod = $scope.selectedYear + "-" + $scope.selectedMonth;
                return VizObjectService.getVizObjects(user, $scope.selectedDataSet.code, selectedTimePeriod)
                    .then(function (vizObjects) {
                        $scope.mmrVizObjects.push(vizObjects);
                        console.log("All Viz Objects", $scope.mmrVizObjects);
                    })
            };

            var processSection = function (dataSection) {
                dataSection.charts = [];
                dataSection.reportTables = [];
                dataSection.eventCharts = [];
                dataSection.eventReports = [];
                return _.map(_.flatten($scope.mmrVizObjects), function (vizObject) {
                    if (( (vizObject.name).indexOf(dataSection.code) > -1 )) {
                        if (((vizObject.href).indexOf("charts") > -1 || (vizObject.href).indexOf("eventCharts") > -1)) {
                            vizObject.href = vizObject.href + "/data?date=" + $scope.selectedYear + "-" + $scope.selectedMonth;
                            dataSection.charts.push(vizObject);
                        }
                        else if ((vizObject.href).indexOf("reportTables") > -1) {
                            vizObject.href = vizObject.href + "/data.html?date=" + $scope.selectedYear + "-" + $scope.selectedMonth;
                            dataSection.reportTables.push(vizObject);
                        }
                        else
                            alert("event reports later");
                    }
                    return dataSection;
                })[0];
            };

            var assignVizObjectsToDataSet = function () {
                if ($scope.mmrVizObjects.length != 0) {
                    return DataSetService.getDataSet($scope.selectedDataSet.id)
                        .then(function (dataset) {
                            return dataset.isResolved.then(function () {
                                _.map(dataset.sections, function (dataSection) {
                                    processSection(dataSection);
                                });
                                $scope.mmrDataSet = dataset;
                            });
                        });
                }
                else
                    alert('No data charts or tables configured for the selected template');
            };

            var addNarratives = function () {
                DataSetService.getDataSet($scope.selectedDataSet.id)
                    .then(function (selectedDataSet) {
                        NarrativeService.getNarratives(selectedDataSet, $scope.selectedYear + $scope.selectedMonth, $scope.user.orgUnit.id)
                            .then(function (Narratives) {
                                $scope.narratives = {};
                                _.map(Narratives, function (narrative) {
                                    $scope.narratives[narrative.dataElement] = narrative;
                                })
                                $scope.spinnerShown = false;
                                $scope.reportShown = true;
                            });
                    })
            }
            userService.getLoggedInUser()
                .then(getVizObjects)
                .then(assignVizObjectsToDataSet)
                .then(addNarratives);
        }
        else {
            alert('Please select Time Period');
        }
    };
}]);

Reports.directive('monthSelect', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<select class="form-control first-child" ng-model="$parent.selectedMonth" required><option value="" disabled selected>Select a Month</option><option ng-repeat="month in months" value="{{month.value}}">{{month.text}}</option></select>',
        controller: ["$scope", "$element", "$attrs", function (scope, element, attrs) {
            scope.months = [];
            scope.months.push({value: "01", text: 'January'});
            scope.months.push({value: "02", text: 'February'});
            scope.months.push({value: "03", text: 'March'});
            scope.months.push({value: "04", text: 'April'});
            scope.months.push({value: "05", text: 'May'});
            scope.months.push({value: "06", text: 'June'});
            scope.months.push({value: "07", text: 'July'});
            scope.months.push({value: "08", text: 'August'});
            scope.months.push({value: "09", text: 'September'});
            scope.months.push({value: "10", text: 'October'});
            scope.months.push({value: "11", text: 'November'});
            scope.months.push({value: "12", text: 'December'});
        }]
    }
});

Reports.directive('yearSelect', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<select class="form-control" ng-model="$parent.selectedYear" required><option value="" disabled selected>Select a Year</option><option ng-selected="{{year==$parent.selectedYear}}"ng-repeat="year in years" value="{{year}}">{{year}}</option></select>',
        controller: ["$scope", "$element", "$attrs", function (scope, element, attrs) {
            scope.years = [];
            var noOfYear = 0;
            var currentYear = new Date().getFullYear();

            scope.$parent.selectedYear = currentYear;

            while (noOfYear < 2) {
                scope.years.push(currentYear - noOfYear);
                noOfYear++;
            }
        }]
    }
});