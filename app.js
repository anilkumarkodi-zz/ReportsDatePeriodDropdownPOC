var Reports = angular.module('Reports', ['ngResource', 'ngRoute', 'pascalprecht.translate', 'ngCookies', 'd2HeaderBar']);
var dhisUrl;
var dhis2;
if (window.location.href.includes("apps"))
    dhisUrl = window.location.href.split('api/apps/')[0];
else
    dhisUrl = "http://localhost:8000/";
var ApiUrl = dhisUrl + 'api';
if (dhis2)
    setTimeout(function () {
        dhis2.menu.mainAppMenu.closeAll();
    }, 2000);
Reports.controller('ReportsController', ['UserService', 'DataSetService', '$scope', '$translate', 'VizObjectService', 'Config', 'NarrativeService', function (userService, DataSetService, $scope, $translate, VizObjectService, Config, NarrativeService) {
    $scope.noDataMessageShown = true;
    $scope.selectedDataSet = null;
    $scope.narratives = {};
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
                $translate('report_type_unavailable').then(function(translatedValue) {
                     alert(translatedValue);
                });
            }
        }
    };

    $scope.calculateHeight = function (event) {
        var textArea = event.target;

        textArea.style.overflow = 'hidden';
        textArea.style.height = 0;
        textArea.style.height = textArea.scrollHeight + 'px';

    };

    $scope.saveReport = function (textArea) {
        NarrativeService.saveNarratives([$scope.narratives[textArea.dataElement.id]]);
    }

    $scope.getReport = function () {
        $scope.noDataMessageShown = false;
        $scope.spinnerShown = true;
        if ($scope.selectedMonth != undefined && $scope.selectedYear != undefined) {
            $scope.user = null;
            $scope.mmrDataSet = {}
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
                    $translate('analytics_objects_unavailable').then(function(translatedValue) {
                        alert(translatedValue);
                    });
            };

            var addNarratives = function () {
                return DataSetService.getDataSet($scope.selectedDataSet.id)
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
            return userService.getLoggedInUser()
                .then(getVizObjects)
                .then(assignVizObjectsToDataSet)
                .then(addNarratives);
        }
        else {
                $translate('time_period_selection_alert').then(function(translatedValue) {
                alert(translatedValue);
            });
        }
    };
}]);

Reports.directive('monthSelect', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<select class="form-control first-child" ng-model="$parent.selectedMonth" required><option value="" disabled selected>{{ "default_month_option" | translate }}</option><option ng-repeat="month in months" value="{{month.value}}">{{month.text}}</option></select>',
        controller: ["$scope","$translate", "$element", "$attrs", function (scope, translate, element, attrs) {
            scope.months = [];
            scope.months.push({value: "01", text: translate.instant('January')});
            scope.months.push({value: "02", text: translate.instant('February')});
            scope.months.push({value: "03", text: translate.instant('March')});
            scope.months.push({value: "04", text: translate.instant('April')});
            scope.months.push({value: "05", text: translate.instant('May')});
            scope.months.push({value: "06", text: translate.instant('June')});
            scope.months.push({value: "07", text: translate.instant('July')});
            scope.months.push({value: "08", text: translate.instant('August')});
            scope.months.push({value: "09", text: translate.instant('September')});
            scope.months.push({value: "10", text: translate.instant('October')});
            scope.months.push({value: "11", text: translate.instant('November')});
            scope.months.push({value: "12", text: translate.instant('December')});
        }]
    };
});

Reports.directive('yearSelect', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<select class="form-control" ng-model="$parent.selectedYear" required><option value="" disabled selected>{{ "default_year_option" | translate }}</option><option ng-selected="{{year==$parent.selectedYear}}"ng-repeat="year in years" value="{{year}}">{{year}}</option></select>',
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
})
Reports.config(function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: 'i18n/',
        suffix: '.json'
    });

    $translateProvider.registerAvailableLanguageKeys(
      ['es', 'fr', 'en', 'pt'],
      {
          'en*': 'en',
          'es*': 'es',
          'fr*': 'fr',
          'pt*': 'pt',
          '*': 'en' // must be last!
      }
    );

    $translateProvider.fallbackLanguage(['en']);

    jQuery.ajax({
        url: ApiUrl + '/userSettings/keyUiLocale/',
        contentType: 'text/plain',
        method: 'GET',
        dataType: 'text',
        async: false
    }).success(function (uiLocale) {
        if (uiLocale == '') {
            $translateProvider.determinePreferredLanguage();
        }
        else {
            $translateProvider.use(uiLocale);
        }
    }).fail(function () {
        $translateProvider.determinePreferredLanguage();
    });
});