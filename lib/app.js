var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "TFS/VersionControl/Contracts", "TFS/VersionControl/GitRestClient", "TFS/Dashboards/WidgetContracts"], function (require, exports, Contracts_1, GitRestClient_1, WidgetContracts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Entering pull request counter");
    VSS.require("TFS/Dashboards/WidgetHelpers", function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("PullCounterWidget", function () {
            var pullCounter = new PullCounterWidget(WidgetHelpers);
            return pullCounter;
        });
        VSS.notifyLoadSucceeded();
    });
    var PullCounterWidget = /** @class */ (function () {
        // onDashboardLoaded: (() => void) | undefined = undefined; //this._onDashboardLoaded;
        // disableWidgetForStakeholders: ((widgetSettings: WidgetSettings) => IPromise<boolean>) | undefined = undefined; //this._disableWidgetForStakeholders;;
        // lightbox: ((widgetSettings: WidgetSettings, lightboxSize: Size) => IPromise<WidgetStatus>) | undefined = undefined; //this._lightbox;
        // listen: (<T>(event: string, eventArgs: EventArgs<T>) => void) | undefined = undefined; // this._listen;
        function PullCounterWidget(WidgetHelpers) {
            this.WidgetHelpers = WidgetHelpers;
        }
        PullCounterWidget.prototype.preload = function (widgetSettings) {
            return __awaiter(this, void 0, void 0, function () {
                var pullCounts, latestDate, gitClient, query, repositories, j, skip, top_1, _continue, _trackedLast, pullRequests, i, pullRequest;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getPullCounts()];
                        case 1:
                            pullCounts = _a.sent();
                            latestDate = this._getLatestDate(pullCounts);
                            gitClient = GitRestClient_1.getClient();
                            query = {
                                creatorId: "",
                                includeLinks: false,
                                repositoryId: "",
                                reviewerId: "",
                                sourceRefName: "",
                                sourceRepositoryId: "",
                                status: Contracts_1.PullRequestStatus.Completed,
                                targetRefName: ""
                            };
                            return [4 /*yield*/, gitClient.getRepositories()];
                        case 2:
                            repositories = _a.sent();
                            j = 0;
                            _a.label = 3;
                        case 3:
                            if (!(j < repositories.length)) return [3 /*break*/, 8];
                            skip = 0, top_1 = 100;
                            _continue = false;
                            _trackedLast = false;
                            _a.label = 4;
                        case 4: return [4 /*yield*/, gitClient.getPullRequests(repositories[j].id, query, undefined, undefined, 0, 100)];
                        case 5:
                            pullRequests = _a.sent();
                            for (i = 0; i < pullRequests.length; i++) {
                                pullRequest = pullRequests[i];
                                if (!pullCounts[pullRequest.createdBy.displayName])
                                    pullCounts[pullRequest.createdBy.displayName] = { count: 0, last: pullRequest.closedDate };
                                if (pullCounts[pullRequest.createdBy.displayName].last < pullRequest.closedDate)
                                    pullCounts[pullRequest.createdBy.displayName].last = pullRequest.closedDate;
                                if (latestDate <= pullRequest.closedDate) {
                                    _trackedLast = true;
                                    break;
                                }
                                pullCounts[pullRequest.createdBy.displayName].count++;
                            }
                            _continue = pullRequests.length === top_1;
                            skip += top_1;
                            _a.label = 6;
                        case 6:
                            if (_continue && !_trackedLast) return [3 /*break*/, 4];
                            _a.label = 7;
                        case 7:
                            j++;
                            return [3 /*break*/, 3];
                        case 8:
                            console.log(pullCounts);
                            this._setPullCounts(pullCounts);
                            return [2 /*return*/, this.WidgetHelpers.WidgetStatusHelper.Success()];
                    }
                });
            });
        };
        PullCounterWidget.prototype.load = function (widgetSettings) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = console).log;
                            return [4 /*yield*/, this._getPullCounts()];
                        case 1:
                            _b.apply(_a, [_c.sent()]);
                            return [2 /*return*/, this.WidgetHelpers.WidgetStatusHelper.Success()];
                    }
                });
            });
        };
        PullCounterWidget.prototype._getLatestDate = function (pullCounts) {
            var keys = Object.keys(pullCounts);
            var latestDate = new Date();
            latestDate.setFullYear(2000);
            for (var i = 0; i < keys.length; i++) {
                var date = pullCounts[keys[i]].last;
                if (date > latestDate)
                    latestDate = date;
            }
            return latestDate;
        };
        PullCounterWidget.prototype._getPullCounts = function () {
            return __awaiter(this, void 0, void 0, function () {
                var extensionDataService;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, VSS.getService(VSS.ServiceIds.ExtensionData)];
                        case 1:
                            extensionDataService = _a.sent();
                            return [4 /*yield*/, extensionDataService.getValue("counts", { defaultValue: {}, scopeType: "Default", scopeValue: "Current" })];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        PullCounterWidget.prototype._setPullCounts = function (pullCounts) {
            return __awaiter(this, void 0, void 0, function () {
                var extensionDataService;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, VSS.getService(VSS.ServiceIds.ExtensionData)];
                        case 1:
                            extensionDataService = _a.sent();
                            return [4 /*yield*/, extensionDataService.setValue("counts", pullCounts, { defaultValue: {}, scopeType: "Default", scopeValue: "Current" })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PullCounterWidget.prototype._lightbox = function (widgetSettings, lightboxSize) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            statusType: WidgetContracts_1.WidgetStatusType.Success
                        }];
                });
            });
        };
        PullCounterWidget.prototype._disableWidgetForStakeholders = function (widgetSettings) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, false];
                });
            });
        };
        PullCounterWidget.prototype._onDashboardLoaded = function () {
        };
        PullCounterWidget.prototype._listen = function (event, eventArgs) {
        };
        return PullCounterWidget;
    }());
    exports.PullCounterWidget = PullCounterWidget;
});
