describe("DataEntrySectionService", function () {
    var dataEntrySectionService;
    var httpMock;

    beforeEach(function () {
        module("Reports");
        angular.module('d2HeaderBar', []);

        var mockedDataElement = {
            id: "1234",
            name: "dataElement1",
            isResolved: Promise.resolve({})
        };

        var mockedDataElementService = {
            getDataElement: function () {
                return Promise.resolve(mockedDataElement);
            }
        };

        module(function ($provide) {
            $provide.value('DataElementService', mockedDataElementService);
        });
    });

    beforeEach(inject(function (DataEntrySectionService, $httpBackend) {
        dataEntrySectionService = DataEntrySectionService;
        httpMock = $httpBackend;
    }));

    describe("getSection", function () {
        it("should get data section object", function (done) {
            var section = {
                id: "123"
            };
            var serverSection = {
                name: "section1",
                id: "123",
                dataElements: [{
                    id: "1234",
                    name: "dataElement3"
                }, {
                    id: "1235",
                    name: "dataElement4"
                }]
            };

            var expectedSection = {
                name: "section1",
                id: "123",
                dataElements: [{
                    id: "1234",
                    name: "dataElement1",
                    isResolved: Promise.resolve({})
                }, {
                    id: "1234",
                    name: "dataElement1",
                    isResolved: Promise.resolve({})
                }],
                code: undefined,
                isResolved: Promise.resolve({})
            };

            httpMock.expectGET("i18n/en.json").respond(200);
            httpMock.expectGET("http://localhost:8000/api/sections/" + section.id + ".json").respond(200, serverSection);
            dataEntrySectionService.getSection(section.id).then(function (actualSection) {
                actualSection.isResolved.then(function () {
                    expectedSection.isResolved = actualSection.isResolved;
                    expect(expectedSection).toEqual(actualSection);
                    done();
                });
            });
            httpMock.flush();
        });

        it("should get the failure response when section object not found", function (done) {
            var section = {
                id: "123"
            };
            spyOn(window, 'alert');
            httpMock.expectGET("i18n/en.json").respond(200,{
                "dhis_unavailable": "Could not connect to DHIS"
            });
            httpMock.expectGET("http://localhost:8000/api/sections/" + section.id + ".json").respond(404);
            dataEntrySectionService.getSection(section.id).then(function () {

                setTimeout(function(){
                    expect(window.alert).toHaveBeenCalledWith("Could not connect to DHIS");
                    done();
                }, 100);

            });
            httpMock.flush();
        });
    });
});