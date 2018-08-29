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
  `$ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
  Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  My hub org id is: 00Dxx000000001234
  `,
  `$ sfdx hello:org --name myname --targetusername myOrg@example.com
  Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  `
  ];

    public static args = [{name: 'file'}];

    protected static flagsConfig = {
        // flag with a value (-n, --name=VALUE)
        force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')}),
        inputdir: flags.string({char: 'i', description: messages.getMessage('inputdirDescription')}),
        outputdir: flags.string({char: 'o', description: messages.getMessage('inputdirDescription')})
    };


    //sfdx options
    protected static requiresUsername = true;
    protected static supportsDevhubUsername = false;
    protected static requiresProject = false;

    
    public async run(): Promise<core.AnyJson> {

        //get command line flags
        const inputdirArg = this.flags.inputdir;
        const outputdirArg = this.flags.outputdir;
        //TODO this.flags.force
        
        // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
        const conn = this.org.getConnection();
      
        //declare a map to use for all text replacements
        let replaceMap = new Map<string, string>();
    
        //query record types
        const recordTypeQuery = 'Select Id, SobjectType, DeveloperName from RecordType where IsActive=true order by SObjectType, DeveloperName';
        const recordTypeResult = await conn.query<Organization>(recordTypeQuery);
        for(let entry of recordTypeResult.records) {
            const key = "RecordType."+entry.SobjectType+"."+entry.DeveloperName;
            replaceMap[key] = entry.Id;
            //console.log("key='"+key+"'\tvalue="+replaceMap[key]);
        }
      
        //query Roles
        const userRoleQuery = 'select Id, DeveloperName from UserRole order by DeveloperName';
        const userRoleResult = await conn.query<Organization>(userRoleQuery);
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
        
                const oldFileStats = fs.statSync(oldFilePath);
        
        
                if(oldFileStats.isDirectory()) {
                    processdir(oldFilePath, newFilePath);
                }
                else if(filename.endsWith(".json") || filename.endsWith(".csv")) {

                    fs.readFile(oldFilePath, 'utf8', (err,data) => {
                        if (err) { throw err; }

                        const newData = data.replace(/\$R{(.*)}/g, function(x,y) {
                            const newValue = replaceMap[y];
                            console.log("replace:\t"+x+"\t'"+y+"'\t"+newValue);
                            return newValue;
                        });
                
                
                        fs.open(newFilePath, 'wx', (err, fd) => {
                            if (err) {
                                if (err.code === 'EEXIST') {
                                    console.error('myfile already exists');
                                }
                               throw err;
                            }
                    
                            fs.writeFile(newFilePath, newData, 'utf8', (err) => {
                                if (err) { throw err; }
                                console.log("Processed:\t"+oldFilePath+"\tto\t"+newFilePath);
                            }); //writeFile
                        }); //open for write
                   }); //readFile
                } //if ends with JSON
                else {
            
                    fs.copyFile(oldFilePath, newFilePath, fs.constants.COPYFILE_EXCL, (err) => {
                        if (err) { throw err; }
                        console.log("Copied:\t"+oldFilePath+"\tto\t"+newFilePath);
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
