Reports.service('DataVizObjectService',['$http','Config', function($http, config){
    var failurePromise = function(){
        alert('Fetching data failed');
    };

    this.getDataVizObjects = function(user, dataSetCode){
        var dataVizObjects=[];

        var getCharts = function(){
            var chartsSuccessPromise = function(response){
                dataVizObjects.push(response.data.charts)
            };
            return $http.get(ApiUrl + "/charts.json?filter=name:ilike:" + dataSetCode)
                .then(chartsSuccessPromise, failurePromise);
        };

        var getReportTables = function(){
            var reportTablesSuccessPromise = function(response){
                dataVizObjects.push(response.data.reportTables)
            };

            return $http.get(ApiUrl + "/reportTables.json?filter=name:ilike:" + dataSetCode)
                .then(reportTablesSuccessPromise, failurePromise);
        };

        var getReportTablesJson = function(dataVizObjects){
           _.map(dataVizObjects, function(dataObject, index) {
                dataObject.jsonData = {};
                var reportTablesJsonSuccessPromise = function(response){
                    if((dataVizObjects[index].href).indexOf("charts")>-1)
                        dataVizObjects[index].jsonData=dataVizObjects[index].href+"/data";
                    else
                        dataVizObjects[index].jsonData = response.data;
                };
                var dataObjectUrl=ApiUrl;
                if((dataObject.href).indexOf("charts")>-1)
                    dataObjectUrl=dataObjectUrl+"/charts/"+dataObject.id+"/data.json";
                else
                    dataObjectUrl=dataObjectUrl+"/reportTables/"+dataObject.id+"/data.json";

                return $http.get(dataObjectUrl)
                  .then(reportTablesJsonSuccessPromise, failurePromise);
            });
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
