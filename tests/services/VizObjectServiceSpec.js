describe("VizObjectService", function () {
    var vizObjectService;
    var httpMock;
    var $rootScope;
    var timeout;
    var p;

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("Reports");
    });

    beforeEach(inject(function (VizObjectService, $httpBackend, $q, _$rootScope_, $timeout) {
        vizObjectService = VizObjectService;
        p = $q;
        $rootScope = _$rootScope_;
        httpMock = $httpBackend;
        timeout = $timeout;
    }));

    describe("getVizObjects", function () {
        it("should give viz objects", function (done) {
            var dataSetCode = "123";
            var selectedTimePeriod = "26-05-2016";
            var user = {};
            var serverData = {
                charts: [{
                    id: "1",
                    displayName: "test chart",
                    href: "http://localhost:8000/api/charts"
                }],
                reportTables: [{
                    id: "12",
                    displayName: "test report table",
                    href: "http://localhost:8000/api/reportTables",
                }],
                eventCharts: [{
                    id: "123",
                    displayName: "test event chart",
                    href: "http://localhost:8000/api/eventCharts",
                }],
                eventReports: [{
                    id: "1234",
                    displayName: "test event report",
                    href: "http://localhost:8000/api/eventReports"
                }],
                chartsData: {
                    id: '1',
                    displayName: 'test chart',
                    href: 'http://localhost:8000/api/charts',
                    jsonData: 'http://localhost:8000/api/charts/data'
                },
                reportTableData: {
                    id: '12',
                    displayName: 'test report table',
                    href: 'http://localhost:8000/api/reportTables',
                    jsonData: 'http://localhost:8000/api/reportTables/data',
                    headers: [{hidden: false, name: "Total"}],
                    rows: [{}]
                }
            };

            var expectedVizObjects = [{
                id: '1',
                displayName: 'test chart',
                href: 'http://localhost:8000/api/charts',
                jsonData: 'http://localhost:8000/api/charts/data'
            }, {
                id: '12',
                displayName: 'test report table',
                href: 'http://localhost:8000/api/reportTables',
                jsonData: {
                    id: "12",
                    displayName: 'test report table',
                    href: 'http://localhost:8000/api/reportTables',
                    jsonData: 'http://localhost:8000/api/reportTables/data',
                    headers: [{hidden: false, name: "Total"}, {hidden: false, name: "Total"}],
                    rows: [{1: NaN}, [NaN, NaN]]
                }
            }, {
                id: '123',
                displayName: 'test event chart',
                href: 'http://localhost:8000/api/eventCharts',
                jsonData: {}
            }, {
                id: '1234',
                displayName: 'test event report',
                href: 'http://localhost:8000/api/eventReports',
                jsonData: {}
            }];

            httpMock.expectGET("http://localhost:8000/api/charts.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);
            httpMock.expectGET("http://localhost:8000/api/reportTables.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);
            httpMock.expectGET("http://localhost:8000/api/eventCharts.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);
            httpMock.expectGET("http://localhost:8000/api/eventReports.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);

            vizObjectService.getVizObjects(user, dataSetCode, selectedTimePeriod).isResolved.then(function (actualVizObjects) {
                httpMock.expectGET("http://localhost:8000/api/charts/1/data.json").respond(200, serverData.chartsData);
                httpMock.expectGET("http://localhost:8000/api/reportTables/12/data.json?date=" + selectedTimePeriod).respond(200, serverData.reportTableData);
                httpMock.flush(1);
                httpMock.flush(1);
                expectedVizObjects.isResolved = actualVizObjects.isResolved;
                expect(actualVizObjects).toEqual(expectedVizObjects);
                done();
            });
            httpMock.flush(4);
            setTimeout($rootScope.$digest, 900);
        });

        it("should get the failure promise when server not responded", function () {
            var dataSetCode = "123";
            var selectedTimePeriod = "26-05-2016";
            var user = {};
            spyOn(window, 'alert');

            httpMock.expectGET("http://localhost:8000/api/charts.json?filter=name:ilike:" + dataSetCode).respond(404);
            httpMock.expectGET("http://localhost:8000/api/reportTables.json?filter=name:ilike:" + dataSetCode).respond(404);
            httpMock.expectGET("http://localhost:8000/api/eventCharts.json?filter=name:ilike:" + dataSetCode).respond(404);
            httpMock.expectGET("http://localhost:8000/api/eventReports.json?filter=name:ilike:" + dataSetCode).respond(404);

            vizObjectService.getVizObjects(user, dataSetCode, selectedTimePeriod).isResolved.then(function () {
                httpMock.expectGET("http://localhost:8000/api/charts/1/data.json").respond(404);
                httpMock.expectGET("http://localhost:8000/api/reportTables/12/data.json?date=" + selectedTimePeriod).respond(404);
                expect(window.alert).toHaveBeenCalledWith("");
                done();
            });
            httpMock.flush(4);
            setTimeout($rootScope.$digest, 900);
        })
    });
});