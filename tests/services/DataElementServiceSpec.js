describe("DataElementService", function () {
    var dataElementService;
    var httpMock;

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("Reports");
    });

    beforeEach(inject(function (DataElementService, $httpBackend) {
        dataElementService = DataElementService;
        httpMock = $httpBackend;
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
            httpMock.expectGET("i18n/en.json").respond(200,{});
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(200, serverDataElement);
            dataElementService.getDataElement(dataElement).then(function (actualDataElement) {
                expectedDataElement.isResolved = actualDataElement.isResolved;
                expect(expectedDataElement).toEqual(actualDataElement);
            });
            httpMock.flush();
        });

        it("should get the failure promise when server not responded", function () {
            var dataElement = {
                id: "1234"
            };
            var expectedPromise = {isError: true, status: 404, statusText: ''};
            httpMock.expectGET("i18n/en.json").respond(200,{});
            httpMock.expectGET("http://localhost:8000/api/dataElements/" + dataElement.id + ".json").respond(404);
            dataElementService.getDataElement(dataElement).then(function (actualPromise) {
                expect(expectedPromise).toEqual(actualPromise)
            });
            httpMock.flush();
        });
    });
});