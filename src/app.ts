import * as vstsHelpers from "TFS/Dashboards/WidgetHelpers";
import { ExtensionDataService } from "VSS/SDK/Services/ExtensionData";
import { GitRepository, GitPullRequestSearchCriteria, PullRequestStatus, GitPullRequest } from "TFS/VersionControl/Contracts";
import { getClient as getGitClient, GitHttpClient } from "TFS/VersionControl/GitRestClient";
import { IWidget, WidgetSettings, WidgetStatus, WidgetStatusType, EventArgs, Size } from "TFS/Dashboards/WidgetContracts";

console.log("Entering pull request counter");

VSS.require("TFS/Dashboards/WidgetHelpers", function (WidgetHelpers: typeof vstsHelpers) {
    WidgetHelpers.IncludeWidgetStyles();
    VSS.register("PullCounterWidget", function () {
        const pullCounter = new PullCounterWidget(WidgetHelpers);
        return pullCounter;
    });
    VSS.notifyLoadSucceeded();
});

type PullCounts = { [key: string]: { count: number, last: Date } };

export class PullCounterWidget {

    // onDashboardLoaded: (() => void) | undefined = undefined; //this._onDashboardLoaded;
    // disableWidgetForStakeholders: ((widgetSettings: WidgetSettings) => IPromise<boolean>) | undefined = undefined; //this._disableWidgetForStakeholders;;
    // lightbox: ((widgetSettings: WidgetSettings, lightboxSize: Size) => IPromise<WidgetStatus>) | undefined = undefined; //this._lightbox;
    // listen: (<T>(event: string, eventArgs: EventArgs<T>) => void) | undefined = undefined; // this._listen;

    constructor(public WidgetHelpers: typeof vstsHelpers) {

    }

    async preload(widgetSettings: WidgetSettings): Promise<WidgetStatus> {
        let pullCounts: PullCounts = await this._getPullCounts();
        const latestDate: Date = this._getLatestDate(pullCounts);
        const gitClient: GitHttpClient = getGitClient();
        const query: GitPullRequestSearchCriteria = {
            creatorId: "",
            includeLinks: false,
            repositoryId: "",
            reviewerId: "",
            sourceRefName: "",
            sourceRepositoryId: "",
            status: PullRequestStatus.Completed,
            targetRefName: ""
        };
        const repositories: GitRepository[] = await gitClient.getRepositories();
        for (let j = 0; j < repositories.length; j++) {
            let skip = 0, top = 100;
            let _continue = false;
            let _trackedLast = false;
            do {
                const pullRequests: GitPullRequest[] = await gitClient.getPullRequests(repositories[j].id, query, undefined, undefined, 0, 100);
                for (let i = 0; i < pullRequests.length; i++) {
                    const pullRequest = pullRequests[i];
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
                _continue = pullRequests.length === top;
                skip += top;
            } while (_continue && !_trackedLast);
        }
        console.log(pullCounts);
        this._setPullCounts(pullCounts);
        return this.WidgetHelpers.WidgetStatusHelper.Success();
    }
    async load(widgetSettings: WidgetSettings): Promise<WidgetStatus> {
        console.log(await this._getPullCounts());
        return this.WidgetHelpers.WidgetStatusHelper.Success();
    }
    private _getLatestDate(pullCounts: PullCounts): Date {
        const keys = Object.keys(pullCounts);
        let latestDate = new Date();
        latestDate.setFullYear(2000);
        for (let i = 0; i < keys.length; i++) {
            const date: Date = pullCounts[keys[i]].last;
            if (date > latestDate)
                latestDate = date;
        }
        return latestDate;
    }
    private async _getPullCounts(): Promise<PullCounts> {
        const extensionDataService: ExtensionDataService = await VSS.getService<ExtensionDataService>(VSS.ServiceIds.ExtensionData);
        return await extensionDataService.getValue<PullCounts>("counts", { defaultValue: {}, scopeType: "Default", scopeValue: "Current" });
    }
    private async _setPullCounts(pullCounts: PullCounts): Promise<void> {
        const extensionDataService: ExtensionDataService = await VSS.getService<ExtensionDataService>(VSS.ServiceIds.ExtensionData);
        await extensionDataService.setValue<PullCounts>("counts", pullCounts, { defaultValue: {}, scopeType: "Default", scopeValue: "Current" });
    }
    private async _lightbox(widgetSettings: WidgetSettings, lightboxSize: Size): Promise<WidgetStatus> {
        return {
            statusType: WidgetStatusType.Success
        };
    }
    private async _disableWidgetForStakeholders(widgetSettings: WidgetSettings): Promise<boolean> {
        return false;
    }
    private _onDashboardLoaded(): void {

    }
    private _listen<T>(event: string, eventArgs: EventArgs<T>): void {

    }
}
