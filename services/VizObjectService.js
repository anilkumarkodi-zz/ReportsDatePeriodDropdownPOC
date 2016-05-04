Reports.service('VizObjectService',['$http','Config', function($http, config){
    var failurePromise = function(){
        alert('Fetching data failed');
    };

    this.getVizObjects = function(user, dataSetCode, selectedTimePeriod){
        var vizObjects=[];

        var getCharts = function(){
            var chartsSuccessPromise = function(response){
                vizObjects.push(response.data.charts)
            };
            return $http.get(ApiUrl + "/charts.json?filter=name:ilike:" + dataSetCode)
                .then(chartsSuccessPromise, failurePromise);
        };

        var getReportTables = function(){
            var reportTablesSuccessPromise = function(response){
               vizObjects.push(response.data.reportTables)
            };

            return $http.get(ApiUrl + "/reportTables.json?filter=name:ilike:" + dataSetCode)
                .then(reportTablesSuccessPromise, failurePromise);
        };

        var getEventCharts = function(){
            var eventChartsSuccessPromise = function(response){
                vizObjects.push(response.data.eventCharts)
            };
            return $http.get(ApiUrl + "/eventCharts.json?filter=name:ilike:" + dataSetCode)
                .then(eventChartsSuccessPromise, failurePromise);
        };

        var getEventReportTables = function(){
            var eventReportTablesSuccessPromise = function(response){
                vizObjects.push(response.data.eventReports)
            };

            return $http.get(ApiUrl + "/eventReports.json?filter=name:ilike:" + dataSetCode)
                .then(eventReportTablesSuccessPromise, failurePromise);
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

        var getReportTablesJson = function(vizObjects){
            _.map(vizObjects, function(dataObject, index) {
                dataObject.jsonData = {};
                var reportTablesJsonSuccessPromise = function(response){
                    if((vizObjects[index].href).indexOf("charts")>-1)
                        vizObjects[index].jsonData=vizObjects[index].href+"/data";
                    if((vizObjects[index].href).indexOf("reportTables")>-1){
                        calculateReportTableTotal(response.data);
                        vizObjects[ index ].jsonData = response.data;
                    }
                };
                var dataObjectUrl=ApiUrl;
                if((dataObject.href).indexOf("charts")>-1)
                    dataObjectUrl=dataObjectUrl+"/charts/"+dataObject.id+"/data.json";
                if((dataObject.href).indexOf("reportTables")>-1)
                    dataObjectUrl=dataObjectUrl+"/reportTables/"+dataObject.id+"/data.json?date="+selectedTimePeriod;

                return $http.get(dataObjectUrl)
                    .then(reportTablesJsonSuccessPromise, failurePromise);
            });
            return vizObjects;
        };

        var promises = [];
        promises.push(getCharts());
        promises.push(getReportTables());
        promises.push(getEventCharts());
        promises.push(getEventReportTables());
        vizObjects.isResolved = Promise.all(promises);
        return Promise.all(promises)
            .then(function(){
                return _.flatten(vizObjects);
            })
            .then(getReportTablesJson);

    };
}]);