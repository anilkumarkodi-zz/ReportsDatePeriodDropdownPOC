xdescribe("VizObjectService", function () {
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
                    displayName: "REP_MMR02_TEST_CHART1",
                    href: "http://localhost:8000/api/charts"
                }],

                reportTables: [{
                    id: "12",
                    displayName: "REP_MMR01_TEST_REPORT_TABLE1",
                    href: "http://localhost:8000/api/reportTables"
                }],

                eventCharts: [{
                    id: "123",
                    displayName: "REP_MMR02_TEST_CHART1",
                    href: "http://localhost:8000/api/eventCharts"
                }],

                eventReports: [{
                    id: "1234",
                    displayName: "REP_MMR02_TEST_CHART1",
                    href: "http://localhost:8000/api/evenetReports"
                }]
            };

            var expectedVizObjects = [{
                    id: '1',
                    displayName: 'REP_MMR02_TEST_CHART1',
                    href: 'http://localhost:8000/api/charts',
                    jsonData: 'http://localhost:8000/api/charts/data'
                }, {
                    id: '12',
                    displayName: 'REP_MMR01_TEST_REPORT_TABLE1',
                    href: 'http://localhost:8000/api/reportTables',
                    jsonData: 'http://localhost:8000/api/reportTables/data'
                }, {
                    id: '123',
                    displayName: 'REP_MMR02_TEST_CHART1',
                    href: 'http://localhost:8000/api/eventCharts',
                    jsonData: {}
                }, {
                    id: '1234',
                    displayName: 'REP_MMR02_TEST_CHART1',
                    href: 'http://localhost:8000/api/evenetReports',
                    jsonData: {}
                }]
                ;

            httpMock.expectGET("http://localhost:8000/api/charts.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);
            httpMock.expectGET("http://localhost:8000/api/reportTables.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);
            httpMock.expectGET("http://localhost:8000/api/eventCharts.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);
            httpMock.expectGET("http://localhost:8000/api/eventReports.json?filter=name:ilike:" + dataSetCode).respond(200, serverData);

            vizObjectService.getVizObjects(user, dataSetCode, selectedTimePeriod).then(function (actualVizObjects) {
                console.log('hello there')
                httpMock.expectGET("http://localhost:8000/api/charts/1/data.json").respond(200, expectedVizObjects[0]);
                httpMock.expectGET("http://localhost:8000/api/reportTables/12/data.json?date=" + selectedTimePeriod).respond(200, expectedVizObjects[1]);
                httpMock.expectGET("http://localhost:8000/api" + selectedTimePeriod).respond(200, expectedVizObjects[2]);
                httpMock.expectGET("http://localhost:8000/api" + selectedTimePeriod).respond(200, expectedVizObjects[3]);
                console.log(actualVizObjects)
                expect(expectedVizObjects).toEqual(actualVizObjects);
                done();
            });
            httpMock.flush();
            console.log('digested')
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

            vizObjectService.getVizObjects(user, dataSetCode, selectedTimePeriod).then(function () {
                expect(window.alert).toHaveBeenCalledWith("Fetching data failed");
            });
            httpMock.flush();
        })
    });
});