describe("DataElementService", function () {
    var dataElementService;
    var httpMock;
    var $rootScope;
    var timeout;
    var p;
    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("Reports");
    });

    beforeEach(inject(function (DataElementService, $httpBackend, $q, _$rootScope_, $timeout) {
        dataElementService = DataElementService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
    }));

    describe("getDataElement", function () {
        it("Should get basic data element object", function () {
            var dataElement = {
                id: "1234"
            };
            var serverDataElement = {
                id: "1234",
                name: "Karma",
                categoryCombo: {
                    name: "default"
                }
            };
            var expectedDataElement = {
                id: "1234",
                name: "Karma",
                type: "TEXT"
            };

            var actualDataElement;
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(200, serverDataElement);
            dataElementService.getDataElement(dataElement).then(function (response) {
                actualDataElement = response;
            });
            httpMock.flush();
            expectedDataElement.isResolved = actualDataElement.isResolved;
            expect(expectedDataElement).toEqual(actualDataElement);
        });

        it("should get the failure promise when server not responded", function () {
            var dataElement = {
                id: "1234"
            };
            var expectedPromise = {isError: true, status: 404, statusText: ''};
            var actualPromise;
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(404);
            dataElementService.getDataElement(dataElement).then(function (response) {
                actualPromise = response;
            });
            httpMock.flush();
            expect(expectedPromise).toEqual(actualPromise)
        })
    });
});