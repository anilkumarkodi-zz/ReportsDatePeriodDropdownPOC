describe("NarrativeService", function () {
    var narrativeService;
    var httpMock;

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("Reports");
    });

    beforeEach(inject(function (NarrativeService, $httpBackend) {
        narrativeService = NarrativeService;
        httpMock = $httpBackend;
    }));

    describe("getNarratives", function () {
        it("should get the narratives", function () {
            var dataSet = {
                id: "123",
                isResolved: Promise.resolve({}),
                name: "test dataSet",
                sections: [{
                    dataElements: [{id: "1234"}, {id: "4321"}]
                }]
            };

            var expectedNarrative = [
                {
                    dataElement: '1234',
                    period: '25-05-2016',
                    orgUnit: 'test_org_unit',
                    value: ''
                }, {
                    dataElement: '4321',
                    period: '25-05-2016',
                    orgUnit: 'test_org_unit',
                    value: ''
                }
            ];

            var period = "25-05-2016";
            var orgUnitId = "108";
            var serverDataSet = {
                period: period,
                orgUnit: "test_org_unit"
            };

            httpMock.expectGET("i18n/en.json").respond(200,{});

            httpMock.expectGET("http://localhost:8000/api/dataValueSets?dataSet=" + dataSet.id + "&period=" + period + "&orgUnit=" + orgUnitId).respond(200, serverDataSet);
            narrativeService.getNarratives(dataSet, period, orgUnitId).then(function (actualNarrative) {
                expect(expectedNarrative).toEqual(actualNarrative);
            });
            httpMock.flush(2);
        });

        it("should get the failure promise when server not responded", function (done) {
            var dataset = {id: "1234"};
            var period = "25-05-2016";
            var orgUnitId = "108";

            spyOn(window, 'alert');
            httpMock.expectGET("i18n/en.json").respond(200,{
                "dhis_unavailable": "Could not connect to DHIS"
            });
            httpMock.expectGET("http://localhost:8000/api/dataValueSets?dataSet=" + dataset.id + "&period=" + period + "&orgUnit=" + orgUnitId).respond(404);
            narrativeService.getNarratives(dataset, period, orgUnitId).then(function () {
                setTimeout(function(){
                    expect(window.alert).toHaveBeenCalledWith("Could not connect to DHIS")
                    done();
                }, 100);

            });
            httpMock.flush(2);
        });
    });

    describe("saveNarratives", function () {
        it("should give failure promise when server not responded", function (done) {
            var narratives = [
                {
                    dataElement: '1234',
                    period: '25-05-2016',
                    orgUnit: 'test_org_unit',
                    value: ''
                }, {
                    dataElement: '4321',
                    period: '25-05-2016',
                    orgUnit: 'test_org_unit',
                    value: ''
                }
            ];

            spyOn(window, 'alert');

            httpMock.expectGET("i18n/en.json").respond(200,{
                "dhis_unavailable": "Could not connect to DHIS"
            });
            httpMock.expectPOST("http://localhost:8000/api/dataValueSets", {"dataValues": narratives}, {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            }).respond(404);

            narrativeService.saveNarratives(narratives).then(function () {
                setTimeout(function(){
                    expect(window.alert).toHaveBeenCalledWith("Could not connect to DHIS");
                    done();
                }, 100);
            });
            httpMock.flush(2);
        });

        it("should give alert when there are conflicts in data", function (done) {
            var narratives = [
                {
                    dataElement: '1234',
                    period: '25-05-2016',
                    orgUnit: 'test_org_unit',
                    value: ''
                }, {
                    dataElement: '4321',
                    period: '25-05-2016',
                    orgUnit: 'test_org_unit',
                    value: ''
                }
            ];

            var serverData = {
                conflicts: [{
                    value: "123"
                }]
            };

            spyOn(window, 'alert');
            
            httpMock.expectGET('i18n/en.json').respond(200,{
                "narrative_for_future_period": "Narrative cannot be saved for future periods."
            });
            httpMock.expectPOST("http://localhost:8000/api/dataValueSets", {"dataValues": narratives}, {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            }).respond(200, serverData);
            narrativeService.saveNarratives(narratives).then(function () {
                setTimeout(function(){
                    expect(window.alert).toHaveBeenCalledWith("Narrative cannot be saved for future periods.");
                    done();
                }, 100);

            });
            httpMock.flush(2);
        });
    });
});