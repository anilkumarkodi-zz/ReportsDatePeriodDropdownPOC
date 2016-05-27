describe("templateSelectorCtrl", function () {
    var rootScope;
    var userService;
    var controller;
    var scope;
    var mockedUser;

    beforeEach(function () {
        angular.module('d2HeaderBar', []);
        module("Reports");
        mockedUser = {
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
        module(function ($provide) {
            $provide.value("UserService", mockedUserService);
        });
    });

    beforeEach(inject(function (UserService, _$controller_, $rootScope) {
        userService = UserService;
        rootScope = $rootScope;
        controller = _$controller_;
        scope = rootScope.$new();
    }));

    beforeEach(function () {
        controller('templateSelectorCtrl', {$scope: scope});
    });

    describe("getMMRDataSet", function () {
        it("should filter MMR and WMR data sets", function (done) {
            var expectedDataSets = [{code: "MMR data set"}, {code: "WMR data set"}];
            userService.getLoggedInUser().then(function (user) {
                expect(expectedDataSets).toEqual(scope.dataSets);
                done();
            });
        });

        it("should get empty data sets when there are no MMR or WMR data sets", function (done) {
            mockedUser.orgUnit.dataSets = [{
                code: "MMr data set"
            }, {
                code: "WMr data set"
            }];
            var expectedDataSets = [];
            userService.getLoggedInUser().then(function (user) {
                expect(expectedDataSets).toEqual(scope.dataSets);
                done();
            });
        })
    })

});