Reports.service('DataVizObjectService',['$http','Config', function($http, config){
    this.getDataVizObjects = function(user){
        var dataVizObjects=[];
        var failurePromise = function(){
            alert('Fetching data failed');
        };


        var getCharts = function(){
            var chartsSuccessPromise = function(response){
                dataVizObjects.push(response.data.charts)
                console.log(response.data);
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
        return Promise.all(promises)
            .then(function(){
                return _.flatten(dataVizObjects);
            });

    };
}]);
