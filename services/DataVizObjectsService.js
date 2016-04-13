Reports.service('DataVizObjectService',['$http','Config', function($http, config){
    var failurePromise = function(){
        alert('Fetching data failed');
    };

    this.getDataVizObjects = function(user, dataSetCode, selectedTimePeriod){
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

        var calculateReportTableTotal = function(data) {
          var visibleHeaderIndex = [];
          var headers = data.headers;
          var rows = data.rows;
          headers.push({hidden:false,name:"Total"});
          var newRow = new Array(headers.length-1);
          newRow[1]="Total";
          _.map(headers, function(header, index){
            if(!(header.hidden) && (index !=1) && (index!= headers.length-1)) visibleHeaderIndex.push(index);
          });
          _.map(visibleHeaderIndex, function(visibleHeaderIndex){
            var columnSum = 0;
            _.map(rows, function(row){
              columnSum = columnSum + +row[visibleHeaderIndex]
            });
            newRow[visibleHeaderIndex] = (columnSum == 0) ? "" : columnSum;
          });
          rows.push(newRow);

          _.map(rows, function(row){
            var rowSum = 0;
            _.map(visibleHeaderIndex, function(visibleHeaderIndex){
              rowSum = rowSum+ +(row[visibleHeaderIndex]);
            });
            row[headers.length-1] = (rowSum ==0)? "" : rowSum;
          })
        };

        var getReportTablesJson = function(dataVizObjects){
           _.map(dataVizObjects, function(dataObject, index) {
                dataObject.jsonData = {};
                var reportTablesJsonSuccessPromise = function(response){
                    if((dataVizObjects[index].href).indexOf("charts")>-1)
                        dataVizObjects[index].jsonData=dataVizObjects[index].href+"/data";
                    else {
                      calculateReportTableTotal(response.data);
                      dataVizObjects[ index ].jsonData = response.data;
                    }
                };
                var dataObjectUrl=ApiUrl;
                if((dataObject.href).indexOf("charts")>-1)
                    dataObjectUrl=dataObjectUrl+"/charts/"+dataObject.id+"/data.json";
                else
                    dataObjectUrl=dataObjectUrl+"/reportTables/"+dataObject.id+"/data.json?date="+selectedTimePeriod;

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
