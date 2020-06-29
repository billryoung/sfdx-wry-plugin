import {core, flags, SfdxCommand} from '@salesforce/command';
import fs = require('fs');

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-wry-plugin', 'replace');

export default class Replace extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [
  `$ sfdx wry:file:replace --targetusername myScratchOrg@example.com --inputdir dataFiles --outputdir dataFiles.replaced  
  Copying dataFiles/* to dataFiles.replaced/*
  Account.json: Replacing $R{RecordType.Account.Vendor} with 0125C000000IGVIQA4
  Account.json: Replacing $R{RecordType.Account.Customer} with 0125C000000IGVSQA4
  NewUser.json: Replacing $R{UserRole.CEO} with 00E5C000000UZSmUAO
  QAUser.json: Replacing $R{UserRole.MarketingTeam} with 00E5C000000UZSxUAO
  `,
`$ sfdx wry:file:replace -u myScratchOrg@example.com -i data  
  Copying data/* to data.out/*
  Account.json: Replacing $R{RecordType.Account.Vendor} with 0125C000000IGVIQA4
  Account.json: Replacing $R{RecordType.Account.Customer} with 0125C000000IGVSQA4
  NewUser.json: Replacing $R{UserRole.CEO} with 00E5C000000UZSmUAO
  QAUser.json: Replacing $R{UserRole.MarketingTeam} with 00E5C000000UZSxUAO  
  `
  ];

    public static args = [];

    protected static flagsConfig = {
        // flag with a value (-n, --name=VALUE)
        force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')}),
        inputdir: flags.string({char: 'i', description: messages.getMessage('inputdirDescription')}),
        outputdir: flags.string({char: 'o', description: messages.getMessage('outputdirDescription')})
    };


    //sfdx options
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    
    public async run(): Promise<core.AnyJson> {
 
        //get command line flags
        const inputdirArg = this.flags.inputdir;
        const outputdirArg = this.flags.outputdir  || inputdirArg+'.out';
        //TODO this.flags.force
        
        // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();
      
        //declare a map to use for all text replacements
        let replaceMap = new Map<string, string>();
    
        //query record types
        const recordTypeQuery = 'Select Id, SobjectType, DeveloperName from RecordType where IsActive=true order by SObjectType, DeveloperName';
        const recordTypeResult = await conn.query<RecordType>(recordTypeQuery);
        for(let entry of recordTypeResult.records) {
            const key = "RecordType."+entry.SobjectType+"."+entry.DeveloperName;
            replaceMap[key] = entry.Id;
            //console.log("key='"+key+"'\tvalue="+replaceMap[key]);
        }
      
        //query Roles
        const userRoleQuery = 'select Id, DeveloperName from UserRole order by DeveloperName';
        const userRoleResult = await conn.query<UserRole>(userRoleQuery);
        for(let entry of userRoleResult.records) {
            const key = "Role."+entry.DeveloperName;  
            replaceMap[key] = entry.Id;
            //console.log("key='"+key+"'\tvalue="+replaceMap[key]);
        }
    
        //define a method to process from an incoming directory and output to another - recursive
        function processdir(inputdir : string, outputdir : string) {
      
            fs.mkdirSync(outputdir);
      
            const filenames = fs.readdirSync(inputdir);
            for(let filename of filenames) {

                const oldFilePath = inputdir+"/"+filename;
                const newFilePath = outputdir+"/"+filename;
                //const oldFilePath = url.resolve(inputdir, filename);
                //const newFilePath = url.resolve(outputdir, filename);
        
                const oldFileStats = fs.statSync(oldFilePath);
        
        
                if(oldFileStats.isDirectory()) {
                    processdir(oldFilePath, newFilePath);
                }
                //else if(filename.endsWith(".json") || filename.endsWith(".csv")) {
                else if(filename.endsWith(".json")) {
                    console.log("Processing:\t"+oldFilePath+"\tto\t"+newFilePath);
                    
                    fs.readFile(oldFilePath, 'utf8', (err,data) => {
                        if (err) { throw err; }

                        let objectType = null;
                        if(null!=objectType) {
                            console.log(oldFilePath+": sObjectType=\""+objectType+"\"");
                        }
                        
                        let newData = data.replace(/\$R{(.*)}/g, function(x,y) {
                            const newValue = replaceMap[y];
                            console.log(oldFilePath+": replace:R: \""+y+"\": "+newValue);
                            return newValue;
                        });
                        
                        if(null!=objectType) {
                            newData = newData.replace(/"RecordType"[\s\S]*?attributes[\s\S]*?"type"[\s\S]*?"DeveloperName"[\s\S]*?:[\s\S]*?"(.*)"[\s\S]*?}/gm, function(x,y) {
                                const replaceKey = "RecordType."+objectType+"."+y;
                                const recordTypeId = replaceMap[replaceKey];
                                const newValue = "\"RecordTypeId\": \""+recordTypeId+"\"";
                                //console.log("replace2: x='"+x+" y='"+y+"' "+newValue);
                                console.log(oldFilePath+": replace:RTDN: \""+replaceKey+"\": "+recordTypeId);
                            
                                return newValue;
                            });
                        }
                
                        fs.open(newFilePath, 'wx', (err, fd) => {
                            if (err) {
                                if (err.code === 'EEXIST') {
                                    console.error('myfile already exists');
                                }
                               throw err;
                            }
                    
                            fs.writeFile(newFilePath, newData, 'utf8', (err) => {
                                if (err) { throw err; }
                                //console.log("Processed: "+oldFilePath+"\tto\t"+newFilePath);
                            }); //writeFile
                        }); //open for write
                   }); //readFile
                } //if ends with JSON
                else {
                    console.log("Copying: "+oldFilePath+" to "+newFilePath);
                    
                    fs.copyFile(oldFilePath, newFilePath, fs.constants.COPYFILE_EXCL, (err) => {
                        if (err) { throw err; }
                        //console.log("Copied:\t"+oldFilePath+"\tto\t"+newFilePath);
                    });
                } //end if/else on type of file processing
            } //for loop of filenames
        } //end processdir function
      
        processdir(inputdirArg, outputdirArg);
      
      
        //define types we query for
        interface RecordType {
            Id: string;
            SobjectType: string;
            DeveloperName: string;
        }
      
        interface UserRole {
            Id: string;
            DeveloperName: string;
        }


        // Return an object to be displayed with --json
        return { 'message': 'TODO' };
    } //end run method
} //end Replace class
