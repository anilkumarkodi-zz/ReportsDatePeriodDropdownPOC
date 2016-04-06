Reports.service("DataSetService", ['$http','DataEntrySectionService','DataElementService', function ($http, DataEntrySectionService, DataElementService) {
    var datasets = [];
    this.getDataSet = function(dataSetId, dataVizObjects){

        var DataSet = function(data){
            var dataSet = {};
            dataSet.name = data.name;
            dataSet.id = data.id;
            dataSet.type="dataset";
            dataSet.sections = new Array(data.sections.length);

            var getSections = function(){
                return Promise.all(_.map(data.sections, (function(section, index){
                    return DataEntrySectionService.getSection(section.id, dataVizObjects).then(function(section){
                        dataSet.sections[index] =section
                    })
                })));
            };
            dataSet.isResolved = getSections();
            return dataSet;
        };
        var successPromise = function(response){
            var dataset = new DataSet(response.data);
            return dataset;
        };

        var failurePromise = function(response){
            return {isError: true, status: response.status, statusText: response.statusText}
        };

        return $http.get(ApiUrl + "/dataSets/"+dataSetId+".json")
                .then(successPromise, failurePromise);
    }

}]);
