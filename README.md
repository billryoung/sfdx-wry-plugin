sfdx-wry-plugin
===============

Utilities for SFDX JSON data files

[![Version](https://img.shields.io/npm/v/sfdx-wry-plugin.svg)](https://npmjs.org/package/sfdx-wry-plugin)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/billryoung/sfdx-wry-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-wry-plugin/branch/master)
[![Codecov](https://codecov.io/gh/billryoung/sfdx-wry-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/billryoung/sfdx-wry-plugin)
[![Known Vulnerabilities](https://snyk.io/test/github/billryoung/sfdx-wry-plugin/badge.svg)](https://snyk.io/test/github/billryoung/sfdx-wry-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-wry-plugin.svg)](https://npmjs.org/package/sfdx-wry-plugin)
[![License](https://img.shields.io/npm/l/sfdx-wry-plugin.svg)](https://github.com/billryoung/sfdx-wry-plugin/blob/master/package.json)

<!-- toc -->
* [Install](#install)
* [Docs](#docs)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Install
<!-- install -->
sfdx plugins:install sfdx-wry-plugin

# Docs
<!-- docs -->
Replaces symbolic references in JSON Files to scratch org specific ID values.  It does this for both RecordType and UserRole values.  

# Usage
<!-- usage -->
```sh-session
$ npm install -g sfdx-wry-plugin
$ sfdx-wry-plugin COMMAND
running command...
$ sfdx-wry-plugin (-v|--version|version)
sfdx-wry-plugin/0.0.2 linux-x64 node-v8.10.0
$ sfdx-wry-plugin --help [COMMAND]
USAGE
  $ sfdx-wry-plugin COMMAND
...
```
<!-- usagestop -->

# Commands
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

_See code: [src/commands/wry/file/replace.ts](https://github.com/billryoung/sfdx-wry-plugin/blob/v0.0.2/src/commands/wry/file/replace.ts)_

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

_See code: [src/commands/wry/hello/org.ts](https://github.com/billryoung/sfdx-wry-plugin/blob/v0.0.2/src/commands/wry/hello/org.ts)_
<!-- commandsstop -->
