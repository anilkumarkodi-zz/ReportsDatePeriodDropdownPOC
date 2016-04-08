Reports.service('DataVizObjectService',['$http','Config', function($http, config){
    var failurePromise = function(){
        alert('Fetching data failed');
    };

    this.getDataVizObjects = function(user){
        var dataVizObjects=[];

        var getCharts = function(){
            var chartsSuccessPromise = function(response){
                dataVizObjects.push(response.data.charts)
            };
            return $http.get(ApiUrl + "/charts.json?filter=name:ilike:" + config.dataVizObjectNamePrefix + "_" + user.mission.name + "_" + user.project.name)
                .then(chartsSuccessPromise, failurePromise);
        };

        var getReportTables = function(){
            var reportTablesSuccessPromise = function(response){
                dataVizObjects.push(response.data.reportTables)
            };

            return $http.get(ApiUrl + "/reportTables.json?filter=name:ilike:" + config.dataVizObjectNamePrefix + "_" + user.mission.name + "_" + user.project.name)
                .then(reportTablesSuccessPromise, failurePromise);
        };

        var promises = [];
        promises.push(getCharts());
        promises.push(getReportTables());
        dataVizObjects.isResolved = Promise.all(promises);
        return Promise.all(promises)
            .then(function(){
                return _.flatten(dataVizObjects);
            });

    };

    this.getFilteredDataVizObjects = function(dataVizObjects, date) {
        var filteredDataVizObjects  = []
        var filterData = function() {
            var filterSuccessPromise = function(response) {
                if( !_.isEmpty(response.data) )
                    filteredDataVizObjects.push(response.data);
            };
            return Promise.all(_.map(dataVizObjects, function(map) {
                return $http.get(map.href.replace("8080","8000") + "?filter=periods.code:eq:" + date)
                  .then(filterSuccessPromise, failurePromise);
            }));
        };

        return filterData()
          .then(function(){
              return _.flatten(filteredDataVizObjects);
          });
    };

}]);
