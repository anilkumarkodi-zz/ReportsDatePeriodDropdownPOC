Reports.service('DataVizObjectService',['$http','Config', function($http, config){
    var failurePromise = function(){
        alert('Fetching data failed');
    };

    this.getDataVizObjects = function(user, dataSetName){
        var dataVizObjects=[];

        var getCharts = function(){
            var chartsSuccessPromise = function(response){
                dataVizObjects.push(response.data.charts)
            };
            return $http.get(ApiUrl + "/charts.json?filter=name:ilike:" + dataSetName)
                .then(chartsSuccessPromise, failurePromise);
        };

        var getReportTables = function(){
            var reportTablesSuccessPromise = function(response){
                dataVizObjects.push(response.data.reportTables)
            };

            return $http.get(ApiUrl + "/reportTables.json?filter=name:ilike:" + dataSetName)
                .then(reportTablesSuccessPromise, failurePromise);
        };

        var getReportTablesJson = function(dataVizObjects){
           _.map(dataVizObjects, function(dataObject, index) {
                dataObject.jsonData = {};
                var reportTablesJsonSuccessPromise = function(response){
                    dataVizObjects[index].jsonData = response.data;
                };
               if( !(_.isEmpty(dataObject)) )
                   return $http.get(dataObject.href.replace("8080","8000")+ "/data.json")
                     .then(reportTablesJsonSuccessPromise, failurePromise);
            })
            return dataVizObjects;
        };

        var promises = [];
        promises.push(getCharts());
        promises.push(getReportTables());
        dataVizObjects.isResolved = Promise.all(promises);
        return Promise.all(promises)
            .then(function(){
                return _.flatten(dataVizObjects);
            })
          .then(getReportTablesJson);

    };
}]);
