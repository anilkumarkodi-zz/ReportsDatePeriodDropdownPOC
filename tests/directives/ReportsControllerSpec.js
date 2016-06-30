describe("ReportsController", function () {
    var $controller;
    var scope;
    var _$rootScope;
    var mockedDataset;
    var httpMock;
    var mockedNarrativeService;

    beforeEach(function () {
        module("Reports");
        angular.module("d2HeaderBar", []);

        mockedDataset = {
            id: "12",
            name: "general",
            sections: [{id: "1", name: "section1", code: "test"}],
            isResolved: Promise.resolve({}),
            code: "MMR"
        };

        var mockedDataSetService = {
            getDataSet: function () {
                return Promise.resolve(mockedDataset);
            }
        };

        var mockedUser = {
            id: 1234,
            orgUnit: {
                name: "xyz",
                id: "123",
                level: "2",
                dataSets: [{
                    code: "MMR data set"
                }, {
                    code: "WMR data set"
                }]
            }
        };

        var mockedUserService = {
            getLoggedInUser: function () {
                return Promise.resolve(mockedUser);
            }
        };

        var mockedVizObject = [{
            name: "test viz object for charts",
            href: 'http://localhost:8000/api/charts'
        }, {
            name: "test viz object for charts",
            href: 'http://localhost:8000/api/reportTables'
        }, {
            name: "test viz object for charts",
            href: 'http://localhost:8000/api/'
        }];

        var mockedVizObjectService = {
            getVizObjects: function () {
                return Promise.resolve(mockedVizObject);
            }
        };

        var mockedNarratives = [{
            dataElement: '1234',
            period: '25-05-2016',
            orgUnit: 'test_org_unit',
            value: ''
        }, {
            dataElement: '4321',
            period: '25-05-2016',
            orgUnit: 'test_org_unit',
            value: ''
        }];

        mockedNarrativeService = {
            getNarratives: function () {
                return Promise.resolve(mockedNarratives);
            },
            saveNarratives : function () {
              return Promise.resolve(mockedNarratives);
            }
        };

        module(function ($provide) {
            $provide.value('UserService', mockedUserService);
            $provide.value('VizObjectService', mockedVizObjectService);
            $provide.value('DataSetService', mockedDataSetService);
            $provide.value('NarrativeService', mockedNarrativeService);
        });
    });

    beforeEach(inject(function (_$controller_, $rootScope, $httpBackend) {
        _$rootScope = $rootScope;
        scope = _$rootScope.$new();
        $controller = _$controller_;
        httpMock = $httpBackend;
    }));

    beforeEach(function () {
        $controller('ReportsController', {$scope: scope});
    });

    describe("getReport", function () {
        it("should give an alert when month and year are not selected for the report", function (done) {
            httpMock.expectGET("i18n/en.json").respond(200,{
                "time_period_selection_alert": "Please select Time Period"
            });
            spyOn(window, "alert");
            scope.getReport();
            httpMock.flush();
            setTimeout(function(){
                _$rootScope.$digest
                expect(window.alert).toHaveBeenCalledWith("Please select Time Period");
                done();
            }, 100);

        });

        it("should get the report for the selected month and year", function (done) {
            scope.selectedMonth = "may";
            scope.selectedYear = "2016";
            scope.selectedDataSet = {code: "321", id: "456"};

            scope.getReport().then(function () {
                expect(scope.spinnerShown).toBe(false);
                expect(scope.reportShown).toBe(true);
                done();
            });
        });
    });

    describe("getTimePeriod", function () {
        it("should get time period for MMR", function (done) {
            scope.getTimePeriod(mockedDataset);
            expect(scope.showMonthlyTimePeriod).toBe(true);
            done();
        });

        it("should give an alert for WMR", function (done) {
            httpMock.expectGET("i18n/en.json").respond(200,{
                "report_type_unavailable": "Weekly charts available post pilot"
            });

            mockedDataset.code = "WMR";
            spyOn(window, "alert");
            scope.getTimePeriod(mockedDataset);
            httpMock.flush();
            expect(scope.showMonthlyTimePeriod).toBe(false);
            setTimeout(function(){
                _$rootScope.$digest
                expect(window.alert).toHaveBeenCalledWith("Weekly charts available post pilot");
                done();
            }, 100);
        });
    });

    describe("calculateHeight", function () {
        it("should set height to the report", function () {
            var event = {
                target: {
                    style: {
                        overflow: "",
                        height: ""
                    },
                    scrollHeight: 20
                }
            };
            scope.calculateHeight(event);
            expect(event.target.style.height).toEqual("20px");
            expect(event.target.style.overflow).toEqual("hidden");
        });
    });

    describe("monthSelect", function () {
        var $scope;
        beforeEach(inject(function ($rootScope, $compile) {
            httpMock.expectGET("i18n/en.json").respond(200,{});
            $scope = $rootScope.$new();
            var element = angular.element("<month-select></month-select>");
            httpMock.flush();
            $compile(element)($scope);
            $scope.$digest();
        }));

        it("should have list of months", function () {
            expect($scope.months.length).toBe(12);
        });
    });

    describe("yearSelect", function () {
        var $scope;
        beforeEach(inject(function ($rootScope, $compile) {
            httpMock.expectGET("i18n/en.json").respond(200,{});
            $scope = $rootScope.$new();
            var element = angular.element("<year-select></year-select>");
            httpMock.flush();
            $compile(element)($scope);
            $scope.$digest();
        }));

        it("should have list of years", function () {
            expect($scope.years.length).toBe(2);
        });
    });
    
    describe("saveReport", function(){
        it("should save reports", function(){
             var textArea  = {
                 dataElement:{
                     id:"1"
                 }
             };
            spyOn(mockedNarrativeService,'saveNarratives');
            scope.saveReport(textArea);
            expect(mockedNarrativeService.saveNarratives).toHaveBeenCalled();


        });
    })
});