WDIO Perfecto Labs Service
=======================

***

> A WebdriverIO service that provides integration into Perfecto Lab, and [DigitalZoom Reports](https://developers.perfectomobile.com/display/PD/DigitalZoom+Reporting).
 
This service supports these versions of WDIO and Cucumber: 
    
    "cucumber": "3.0.0",
    "wdio-cucumber-framework": "0.3.1",
    "webdriverio": "^4.14.1"

## Installation
The easiest way is to keep `wdio-perfecto-service` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-perfecto-service": "~0.1.0"
  }
}
```

You can simple do it by:

```bash
npm install wdio-perfecto-service --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](http://webdriver.io/guide/getstarted/install.html)

## Configuration

In order to use the service you need to set `user` and `securityToken` in your `wdio.conf.js` file. It will automatically
use Perfecto Lab to run your integration tests. 

```js
// wdio.conf.js
export.config = {
  // ...
  services: ['perfecto'],
  user: process.env.PERFECTO_USERNAME,
  securityToken: process.env.PERFECTO_SECURITY_TOKEN,

  // ...
};
```

## Config Options

### user
Your Perfecto Lab Labs username.

Type: `String`

### securityToken
Your securityToken 

Type: `String`

## perfectoOpts

```js
// wdio.conf.js
export.config = {
  // ...
  
  perfectoOpts:{
      executionTags:['Tag1','Tag2'],
      customFields:{
          customField1: example,
          customField2: true
      },
      fastWeb:false
  },

  // ...
};
```
### executionTags
executionTags 

Type: `Array`

### customFields
customFields 

Type: `Array` of CustomField object

### fastWeb
fastWeb 

Type: `Boolean` default false

## Commands

All commands can be found in the package.json. The most important are:

### ```waitForVisible``` Command
Override  WDIO ```waitForVisible``` command. If more then one element with selector exists, wait for only one element to be visible. For original command use ```browser._waitForVisible``` 
### ```waitForEnabled``` Command
Override  WDIO ```waitForEnabled``` command. Wait for one element to be enabled. For original command use ```browser._waitForEnabled``` 
### ```waitForSelected``` Command
Override  WDIO ```waitForSelected``` command. Wait for one element to be selected. For original command use ```browser._waitForSelected``` 
### ```waitForText``` Command
Override  WDIO ```waitForText``` command. Wait for one element to be text. For original command use ```browser._waitForText``` 
### ```waitForValue``` Command
Override  WDIO ```waitForValue``` command. Wait for one element to be selected. For original command use ```browser._waitForValue``` 
### ```setValueImmediate``` Command
Send a sequence of key strokes to an element in one go.

####Usage
browser.setValueImmediate(selector, value)

  
# Development
Watch changes:

```sh
$ npm run watch
```

Run tests (there are non yet, please help to get unit test - see [here](https://github.com/webdriverio/wdio-perfecto-service/issues/1)):

```sh
$ npm test
```

Build package:

```sh
$ npm build
```

----

For more information on WebdriverIO see the [homepage](http://webdriver.io).
