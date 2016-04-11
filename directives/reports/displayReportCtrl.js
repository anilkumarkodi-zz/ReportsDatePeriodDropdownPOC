Reports.directive('displayReport',function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/reports/displayReportView.html',
    scope:{
      reportData:'='
    }
  };
});

Reports.controller("displayReportCtrl", function () {
});