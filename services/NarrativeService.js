Reports.service('NarrativeService', ['$http','$translate', function($http,$translate){
    var dataSet;
    var successPromise = function(response){
        var Narratives = response.data.dataValues ? response.data.dataValues : [];
        var allDataElementIds = _.map(_.flatten(_.map(dataSet.sections, "dataElements")), "id");
        var existingDataElementIds = _.map(Narratives, "dataElement");
        _.map(allDataElementIds, function(dataElementId){
            if(!_.includes(existingDataElementIds, dataElementId))
                Narratives.push({dataElement: dataElementId, period: response.data.period, orgUnit: response.data.orgUnit, value: ""})
        });
        return Narratives;
    };
    var failurePromise = function(){
        $translate('Could not connect to DHIS').then(function (translatedValue) {
            alert(translatedValue);
        });
    };
    this.getNarratives = function(dataset, period, orgUnitId){
    dataSet = dataset;
        return $http.get(ApiUrl + "/dataValueSets?dataSet=" + dataset.id + "&period=" + period + "&orgUnit=" + orgUnitId)
            .then(successPromise, failurePromise);
    };

    this.saveNarratives = function(Narratives){
        var consoleNarrativeMessage;
        var validate = function(response){
        if(response.data.conflicts) {
            $translate('Narrative cannot be saved for future periods').then(function (translatedValue) {
                alert(translatedValue);
            });
            console.log(response.data.conflicts[0].value);
          }
        };
        
        $translate('Narrative Posted').then(function (translatedValue) {
            consoleNarrativeMessage = translatedValue;
        });

        console.log(consoleNarrativeMessage, {dataValues: Narratives});
        return $http.post(ApiUrl + "/dataValueSets", {dataValues: Narratives}, {headers: {"Content-Type": "application/json"}})
            .then(validate, failurePromise)
    }
}]);