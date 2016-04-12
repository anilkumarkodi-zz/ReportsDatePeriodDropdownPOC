Reports.service("DataEntrySectionService", ['$http','DataElementService', function ($http, DataElementService) {
    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var Section = function(data){
        var section = {};
        section.name = data.name;
        section.id = data.id;
        section.dataElements = new Array(data.dataElements.length);

        var promises =_.map(data.dataElements, function(incompleteDataElement, index) {
            return DataElementService.getDataElement(incompleteDataElement)
                .then(function (dataElement) {
                    return dataElement.isResolved.then(function(){
                        return section.dataElements[index] = dataElement;
                    });
            })
        });
        section.isResolved = Promise.all(promises)
        return section;
    };
    this.getSection = function(section, dataVizObjects){
        var successPromise = function(response){
            return (new Section(response.data, dataVizObjects))
        };
        return $http.get(ApiUrl + "/sections/" + section + ".json")
            .then(successPromise, failurePromise)
    };

}]);
