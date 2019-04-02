WDIO Perfecto Labs Service
=======================

***

> A WebdriverIO service that provides integration into Perfecto Lab, and [DigitalZoom Reports](https://developers.perfectomobile.com/display/PD/DigitalZoom+Reporting).
 
This service support cucumber version wdio version 4 and "wdio-cucumber-framework": "0.3.1".

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
  implicitTimeout: 500,

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

### implicitTimeout
Default timeout (in ms) for findElement or findElements commands.

Type: `number`

Default: `500`
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

## Development

All commands can be found in the package.json. The most important are:

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
