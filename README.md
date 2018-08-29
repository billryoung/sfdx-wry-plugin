sfdx-wry-plugin
===============

Utilities for SFDX JSON data files

[![Version](https://img.shields.io/npm/v/sfdx-wry-plugin.svg)](https://npmjs.org/package/sfdx-wry-plugin)
[![CircleCI](https://circleci.com/gh/billryoung/sfdx-wry-plugin/tree/master.svg?style=shield)](https://circleci.com/gh/billryoung/sfdx-wry-plugin/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/billryoung/sfdx-wry-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-wry-plugin/branch/master)
[![Codecov](https://codecov.io/gh/billryoung/sfdx-wry-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/billryoung/sfdx-wry-plugin)
[![Greenkeeper](https://badges.greenkeeper.io/billryoung/sfdx-wry-plugin.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/billryoung/sfdx-wry-plugin/badge.svg)](https://snyk.io/test/github/billryoung/sfdx-wry-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-wry-plugin.svg)](https://npmjs.org/package/sfdx-wry-plugin)
[![License](https://img.shields.io/npm/l/sfdx-wry-plugin.svg)](https://github.com/billryoung/sfdx-wry-plugin/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
sfdx plugins:install sfdx-wry-plugin
<!-- usage -->
```sh-session
$ npm install -g sfdx-wry-plugin
$ sfdx-wry-plugin COMMAND
running command...
$ sfdx-wry-plugin (-v|--version|version)
sfdx-wry-plugin/0.0.1 linux-x64 node-v8.10.0
$ sfdx-wry-plugin --help [COMMAND]
USAGE
  $ sfdx-wry-plugin COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx-wry-plugin wry:file:replace [FILE]`](#sfdx-wry-plugin-wryfilereplace-file)
* [`sfdx-wry-plugin wry:hello:org [FILE]`](#sfdx-wry-plugin-wryhelloorg-file)

## `sfdx-wry-plugin wry:file:replace [FILE]`

Replaces RecordType and UserRole references with Id values

```
USAGE
  $ sfdx-wry-plugin wry:file:replace [FILE]

OPTIONS
  -f, --force                                     Force overwrite output directory (not supported yet)
  -i, --inputdir=inputdir                         Directory containing JSON data files

  -o, --outputdir=outputdir                       Target directory for new versions of data files (default:
                                                  $inputdir.out)

  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org

  --apiversion=apiversion                         override the api version used for api requests made by this command

  --json                                          format output as json

  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
  $ sfdx wry:file:replace --targetusername myScratchOrg@example.com --inputdir dataFiles --outputdir dataFiles.replaced  

     Copying dataFiles/* to dataFiles.replaced/*
     Account.json: Replacing $R{RecordType.Account.Vendor} with 0125C000000IGVIQA4
     Account.json: Replacing $R{RecordType.Account.Customer} with 0125C000000IGVSQA4
     NewUser.json: Replacing $R{UserRole.CEO} with 00E5C000000UZSmUAO
     QAUser.json: Replacing $R{UserRole.MarketingTeam} with 00E5C000000UZSxUAO
  
  $ sfdx wry:file:replace -u myScratchOrg@example.com -i data  
     Copying data/* to data.out/*
     Account.json: Replacing $R{RecordType.Account.Vendor} with 0125C000000IGVIQA4
     Account.json: Replacing $R{RecordType.Account.Customer} with 0125C000000IGVSQA4
     NewUser.json: Replacing $R{UserRole.CEO} with 00E5C000000UZSmUAO
     QAUser.json: Replacing $R{UserRole.MarketingTeam} with 00E5C000000UZSxUAO
```

_See code: [src/commands/wry/file/replace.ts](https://github.com/billryoung/sfdx-wry-plugin/blob/v0.0.1/src/commands/wry/file/replace.ts)_

## `sfdx-wry-plugin wry:hello:org [FILE]`

Prints a greeting and your org id(s)!

```
USAGE
  $ sfdx-wry-plugin wry:hello:org [FILE]

OPTIONS
  -f, --force                                      example boolean flag
  -n, --name=name                                  name to print
  -u, --targetusername=targetusername              username or alias for the target org; overrides default target org
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --apiversion=apiversion                          override the api version used for api requests made by this command
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   logging level for this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src/commands/wry/hello/org.ts](https://github.com/billryoung/sfdx-wry-plugin/blob/v0.0.1/src/commands/wry/hello/org.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
