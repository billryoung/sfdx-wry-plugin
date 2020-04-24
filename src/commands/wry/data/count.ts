import {core, flags, SfdxCommand} from '@salesforce/command';
import {AnyJson} from '@salesforce/ts-types';

//import { Connection, ConnectionOptions, RequestInfo } from 'jsforce';


//const request = require('request');


// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-wry-plugin', 'count');

export default class Stats extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
  `$ sfdx wry:data:count --targetusername myScratchOrg@example.com -o Account,Opportunity,User
Account: 14 records
Account.Vendor: 2 records
Account.Customer: 12 records
Opportunity: 38 records
User: 5 records
  `,
`$ sfdx wry:data:count -u myScratchOrg@example.com -o ALL
Account: 14 records
Account.Vendor: 2 records
Account.Customer: 12 records
Opportunity: 38 records
User: 5 records
  `
  ];

    public static args = [];

    protected static flagsConfig = {
        // flag with a value (-n, --name=VALUE)
        objects: flags.string({char: 'o', description: messages.getMessage('objectsDescription')})
    };


    //sfdx options
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    
    public async run(): Promise<AnyJson> {

        //command line args
        const objectsToCheckArg = this.flags.objects || '';
        let objectsToCheck = objectsToCheckArg.split(',');
        
        //get salesforce connection
        //this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();

        //record type collections
        const objectsWithRecordTypes = new Array<string>();
        const recordTypeIdToName = new Map<string, string>();
        
        //query all the record types
        const recordTypeQuery = 'Select Id, SobjectType, DeveloperName from RecordType where IsActive=true order by SObjectType, DeveloperName';
        const recordTypeResult = await conn.query<RecordType>(recordTypeQuery);
        for(let entry of recordTypeResult.records) {
            objectsWithRecordTypes.push( entry.SobjectType );
            recordTypeIdToName.set(entry.Id, entry.DeveloperName);
        }
        
        
        //if there aren't a list of objects, go find them
        if(objectsToCheckArg.length==0 || objectsToCheck.length==0 || objectsToCheckArg == 'ALL') {
            objectsToCheck = [];

            //https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_describe.htm
            const sobjectsResultVar = await conn.request('/sobjects') as unknown as sobjectsResult;

            const excludeList : string[] = ['CollaborationGroupRecord', 'FeedItem'];
            
            for(let entry of sobjectsResultVar.sobjects) {
                //this.ux.log(entry.name+': '+entry.queryable);
                if(entry.queryable && entry.layoutable && entry.retrieveable && entry.triggerable  && !excludeList.includes(entry.name)) {
                    objectsToCheck.push( entry.name );
                }  
            }
        }

        //sort list of objects to check
        objectsToCheck.sort((a,b) => a>b);
        this.ux.log(`Checking ${objectsToCheck.length} objects...`);
        
        //declare collections for query results - one overall and one details per record type
        const countMap = new Map<string, number>();
        const rtCountMap = new Map<string, Map<string,number>>();

        //check each object
        for(let objectToCheck of objectsToCheck) {
        
            if(objectsWithRecordTypes.includes(objectToCheck)) {
                rtCountMap.set(objectToCheck, new Map<string,number>());
                
                const query = `select RecordTypeId, count(Id) record_count from ${objectToCheck} group by RecordTypeId`;
                const queryResult = await conn.query<CountQuery>(query);
                let counter = 0;
                for(let entry of queryResult.records) {
                    if(entry.record_count>0) {
                        countMap.set(objectToCheck, entry.record_count);
                        counter += entry.record_count;
                    
                        let rtdn = recordTypeIdToName.get( entry.RecordTypeId );
                        if(rtdn == null) {
                            rtdn = '--MASTER--';
                        }
                        //this.ux.log(objectToCheck+': '+entry.record_count+' records '+entry.RecordTypeId+"\t"+recordTypeIdToName[entry.RecordTypeId]+"\t"+rtdn);
                    
                        rtCountMap.get(objectToCheck).set(rtdn, entry.record_count);    
                    }
                }
                
                if(counter>0) {
                    countMap.set(objectToCheck, counter);
                }
            }
            else {
                const query = `select count(Id) record_count from ${objectToCheck}`;
                const queryResult = await conn.query<CountQuery>(query);
            
                for(let entry of queryResult.records) {
                    if(entry.record_count>0) {
                        countMap.set(objectToCheck, entry.record_count);
                    }
                }
            }
        }

        
        //sort objects by count
        objectsToCheck.sort((a,b) => countMap.get(a) < countMap.get(b));
        
        for(let objectToCheck of objectsToCheck) {
            if(typeof countMap.get(objectToCheck) != 'undefined') {
            this.ux.log(objectToCheck+': '+countMap.get(objectToCheck));
            
            if(objectsWithRecordTypes.includes(objectToCheck)) {
                
                rtCountMap.get(objectToCheck).forEach((value: number, key: string) => {
                    this.ux.log(objectToCheck+"."+key+": "+value);
                });
            }
        }
            }
                
                
        //define types we query for
        interface RecordType {
            Id: string;
            SobjectType: string;
            DeveloperName: string;
        }
        
        //define types we query for
        interface CountQuery {
            Id: string;
            RecordTypeId: string;
            record_count: number;
        }
        
        //https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_describeGlobal.htm
        interface sobjectsResult {
            sobjects: Array<sobjectsEntry>;
        }
        interface sobjectsEntry {
            name: string;
            queryable: boolean;
            layoutable: boolean;
            retrieveable: boolean;
            custom: boolean;
            triggerable: boolean;
        }
      

        // Return an object to be displayed with --json
        return { 'message': 'TODO' };
    } //end run method
} //end Stats class
