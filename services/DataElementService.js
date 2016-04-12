Reports.service("DataElementService", ['$http',function ($http) {
    var failurePromise = function(response){
        return {isError: true, status: response.status, statusText: response.statusText}
    };

    var DataElement = function (data) {
        var dataElement = {};
        var promises = [];
        dataElement.name = data.displayFormName ? data.displayFormName : data.name;
        dataElement.id = data.id;
        dataElement.type = 'TEXT';
        dataElement.isResolved = Promise.all(promises);
        return dataElement;

    };

    this.getDataElement = function(incompleteDataElement){
        var successPromise = function(response){
            return (new DataElement(response.data))
        };

        return $http.get(ApiUrl + "/dataElements/" + incompleteDataElement.id + ".json")
            .then(successPromise, failurePromise)
    };
}]);