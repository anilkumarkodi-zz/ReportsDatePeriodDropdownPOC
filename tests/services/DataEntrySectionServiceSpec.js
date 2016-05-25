describe("DataEntrySectionService", function () {
    var dataEntrySectionService;
    var dataElementService;
    var httpMock;
    var $rootScope;
    var timeout;
    var p;

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

    beforeEach(inject(function (DataEntrySectionService, $httpBackend, $q, _$rootScope_, $timeout) {
        dataEntrySectionService = DataEntrySectionService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
    }));

    describe("getSection", function () {
        it("should get data section object from server", function (done) {
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

            httpMock.expectGET("http://localhost:8000/api/sections/" + section.id + ".json").respond(200, serverSection);

            var actualSection;
            dataEntrySectionService.getSection(section.id).then(function (section) {
                section.isResolved.then(function () {
                    actualSection = section;
                    expectedSection.isResolved = actualSection.isResolved;
                    expect(expectedSection).toEqual(actualSection);
                    done();
                });
            });
            httpMock.flush();
            setInterval($rootScope.digest, 900);
        });

        it("should get the failure response when section object not found", function () {
            var section = {
                id: "123"
            };
            spyOn(window, 'alert');
            httpMock.expectGET("http://localhost:8000/api/sections/" + section.id + ".json").respond(404);
            dataEntrySectionService.getSection(section.id).then(function (section) {
                expect(window.alert).toHaveBeenCalledWith("Could not connect to DHIS")
            });
            httpMock.flush();
        });
    });
});