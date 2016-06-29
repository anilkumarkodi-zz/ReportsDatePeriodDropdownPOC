Reports.service("DataEntrySectionService", ['$http', 'DataElementService', function ($http, DataElementService) {
    var failurePromise = function (response) {
        alert("Could not connect to DHIS");
    };

    var Section = function (data) {
        var section = {};
        section.name = data.name;
        section.id = data.id;
        section.dataElements = new Array(data.dataElements.length);
        section.code = data.description;

        var promises = _.map(data.dataElements, function (incompleteDataElement, index) {
            return DataElementService.getDataElement(incompleteDataElement)
                .then(function (dataElement) {
                    return dataElement.isResolved.then(function () {
                        return section.dataElements[index] = dataElement;
                    });
                })
        });
        section.isResolved = Promise.all(promises)
        return section;
    };
    this.getSection = function (section, vizObjects) {
        var successPromise = function (response) {
            return (new Section(response.data, vizObjects))
        };
        return $http.get(ApiUrl + "/sections/" + section + ".json")
            .then(successPromise, failurePromise)
    };

}]);
