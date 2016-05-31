describe("UserService", function () {
    var userService;
    var httpMock;
    var $rootScope;

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("Reports");
    });

    beforeEach(inject(function (UserService, $httpBackend, _$rootScope_) {
        userService = UserService;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
    }));

    describe("getLoggedInUser", function () {
        it("should give the logged in user", function (done) {
            var serverData = {
                name: "test org unit",
                id: 1234,
                organisationUnits: [{
                    name: "xyz",
                    id: "123",
                    level: "2",
                    dataSets: []
                }]
            };
            var expectedUser = {
                id: 1234,
                orgUnit: {
                    name: "xyz",
                    id: "123",
                    level: "2",
                    dataSets: []
                }
            };

            httpMock.expectGET("http://localhost:8000/api/me.json").respond(200, serverData);
            httpMock.expectGET("http://localhost:8000/api/organisationUnits/" + serverData.organisationUnits[0].id + ".json").respond(200, serverData.organisationUnits[0]);
            userService.getLoggedInUser().then(function (actualUser) {
                expect(expectedUser).toEqual(actualUser);
                done();
            });
            httpMock.flush();
            setInterval($rootScope.$digest, 900);
        });

        it("should get the failure promise when server not responded", function () {
            spyOn(window, "alert");
            httpMock.expectGET("http://localhost:8000/api/me.json").respond(404);
            userService.getLoggedInUser().then(function () {
                expect(window.alert).toHaveBeenCalledWith("Fetching data failed");
            });
            httpMock.flush();
        });
    })
});