WDIO Perfecto Labs Service
=======================

***

> A WebdriverIO service that provides execution on real mobile devices & desktop browsers with the  Perfecto Lab, and [DigitalZoom Reports](https://developers.perfectomobile.com/display/PD/DigitalZoom+Reporting).
 
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
To obtain your security token - click [here](https://developers.perfectomobile.com/display/PD/Security+Token)

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
Your Perfecto Lab username.

Type: `String`

### securityToken
Your securityToken 

Type: `String`

## perfectoOpts
Add tags & custom fields to optimize the reports - enables filtering and analysis options. 
See [here](https://developers.perfectomobile.com/display/PD/Basic+Test+Result+Concepts) for info on the concept. The syntax required is below. 

```js
// wdio.conf.js
export.config = {
  // ...
  
  perfectoOpts:{
      executionTags:['Tag1','Tag2'],
      customFields:{
          customField1: example,
          customField2: true
      }
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



Type: `Boolean` default false

## Commands

The below commands have been modified to work with the Perfecto platform. 
The complete list of Perfecto commands, proprietary extensions to Selenium/Appium see [here](https://developers.perfectomobile.com/display/PD/Perfecto+Commands)

### ```waitForVisible``` Command
Override  WDIO ```waitForVisible``` command. Takes the first element that matches the selector and wait for it to be visible. For original command use ```browser._waitForVisible``` 
### ```waitForEnabled``` Command
Override  WDIO ```waitForEnabled``` command. Takes the first element that matches the selector and wait for it to be enabled. For original command use ```browser._waitForEnabled``` 
### ```waitForSelected``` Command
Override  WDIO ```waitForSelected``` command. Takes the first element that matches the selector and wait for it to be selected. For original command use ```browser._waitForSelected``` 
### ```waitForText``` Command
Override  WDIO ```waitForText``` command. Takes the first element that matches the selector and wait for it to be text. For original command use ```browser._waitForText``` 
### ```waitForValue``` Command
Override  WDIO ```waitForValue``` command. Takes the first element that matches the selector and wait for it to be selected. For original command use ```browser._waitForValue``` 
### ```setValueImmediate``` Command 
Sends the entire string in one event to optimize performance and reliability. 
### Usage
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
