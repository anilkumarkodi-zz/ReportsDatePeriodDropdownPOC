Reports.directive('templateSelect',function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/template/templateSelectorView.html'
  };
});

Reports.controller("templateSelectorCtrl", ["UserService", "$scope", "$element", "$attrs", 'Config', function (userService, scope, element, attrs, Config) {
      var getMMRDataSet = function(dataSets) {
        return _.filter(dataSets, function(dataSet) {
          return dataSet.name.startsWith(Config.dataSetObjectNamePrefix);
        });
      };

      scope.dataSets=[];
      userService.getLoggedInUser()
        .then(function(user){
          scope.dataSets=getMMRDataSet(user.project.dataSets);
        });
}]);