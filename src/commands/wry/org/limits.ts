import {core, flags, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';

//import { Connection, ConnectionOptions, RequestInfo } from 'jsforce';


//const request = require('request');


// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-wry-plugin', 'limits');

export default class Stats extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
  `$ sfdx wry:org:limits --targetusername myScratchOrg@example.com
ConcurrentAsyncGetReportInstances: 200 of 200
ConcurrentSyncReportRuns: 20 of 20
DailyAnalyticsDataflowJobExecutions: 40 of 40
DailyApiRequests: 14419 of 15000
...
`,
`$ sfdx wry:org:limits -u myScratchOrg@example.com -l MassEmail,DailyApiRequests,SingleEmail
MassEmail: 10 of 10
DailyApiRequests: 14408 of 15000
SingleEmail: 15 of 15 
`
  ];

    public static args = [];

    protected static flagsConfig = {
        // flag with a value (-n, --name=VALUE)
        limits: flags.string({char: 'l', description: messages.getMessage('limitsDescription')})
    };


    //sfdx options
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    
    public async run(): Promise<AnyJson> {

        const limitsToCheckArg = this.flags.limits || '';
        let limitsToCheck = limitsToCheckArg.split(',');
        
        //get salesforce connection
        //this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();

        //https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_limits.htm
        const limitsResultVar = await conn.request('/limits') as unknown as LimitsResult;

        //you can drill through the variables, like:
        //this.ux.log("limits="+limitsResultVar.DailyApiRequests.Max);
        
        if(limitsToCheckArg.length==0 || limitsToCheck.length==0 || limitsToCheckArg == 'ALL') {
            limitsToCheck = [];
            for (let key in limitsResultVar) {
                limitsToCheck.push(key);
            }
        }
        
        this.ux.log("Limit: REMAINING of MAXIMUM");
        for (let key of limitsToCheck) {
            if(typeof limitsResultVar[key] === 'undefined') {
                this.ux.log('Error: unknown limit: '+key);
            }
            else {
                this.ux.log(key+": "+limitsResultVar[key].Remaining+" of "+limitsResultVar[key].Max);
            }
        }
        
        //https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_limits.htm
        interface LimitsResult {
            ConcurrentAsyncGetReportInstances: LimitEntry;
            ConcurrentSyncReportRuns: LimitEntry;
            DailyApiRequests: LimitEntry;
            DailyAsyncApexExecutions: LimitEntry;
            DailyBulkApiRequests: LimitEntry;
            DailyDurableGenericStreamingApiEvents: LimitEntry;
            DailyDurableStreamingApiEvents: LimitEntry;
            DailyGenericStreamingApiEvents: LimitEntry;
            DailyStreamingApiEvents: LimitEntry;
            DailyWorkflowEmails: LimitEntry;
            DataStorageMB: LimitEntry;
            DurableStreamingApiConcurrentClients: LimitEntry;
            FileStorageMB: LimitEntry;
            HourlyAsyncReportRuns: LimitEntry;
            HourlyDashboardRefreshes: LimitEntry;
            HourlyDashboardResults: LimitEntry;
            HourlyDashboardStatuses: LimitEntry;
            HourlyODataCallout: LimitEntry;
            HourlySyncReportRuns: LimitEntry;
            HourlyTimeBasedWorkflow: LimitEntry;
            MassEmail: LimitEntry;
            SingleEmail: LimitEntry;
            StreamingApiConcurrentClients: LimitEntry;
        }
        interface LimitEntry {
            Max: number;
            Remaining: number;
        }
      

        // Return an object to be displayed with --json
        return { 'message': 'TODO' };
    } //end run method
} //end Stats class
