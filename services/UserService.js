Reports.service('UserService',['$http','Config','$translate', function($http, config, $translate){
   this.getLoggedInUser = function(){

       var failurePromise = function(){
         $translate('Fetching data failed').then(function (translatedValue) {
          alert(translatedValue);
         });
       };

       var isOperationalUnit = function(orgUnit){
           return orgUnit.level == config.operationalUnitLevel
       };

       var getOrganisationUnit = function(orgUnit){
           var successPromise = function(response){
               return response.data;
           };
           return $http.get(ApiUrl + "/organisationUnits/" + orgUnit.id + ".json")
               .then(successPromise, failurePromise)
       };

       var successPromise = function(response){
           return new User(response.data)
       };

       var User = function(userData){
           var user = {};
           user.id = userData.id;
           var promises = _.map(userData.organisationUnits, getOrganisationUnit);
           return Promise.all(promises)
               .then(function(organisationUnits){
                   user.operationalUnit = _.filter(organisationUnits, isOperationalUnit)[0];
                   return getOrganisationUnit(user.operationalUnit.parent)
                       .then(function(parentOrgUnit){
                           user.project = parentOrgUnit;
                           return getOrganisationUnit(user.project.parent)
                               .then(function(parentOrgUnit) {
                                   user.mission = parentOrgUnit;
                                   return user;
                               });
                       })
               });
       };

       return $http.get(ApiUrl + "/me.json")
           .then(successPromise, failurePromise);
   };
}]);
