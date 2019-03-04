WDIO Perfecto Labs Service
=======================

***

> A WebdriverIO service. It updates the job metadata ('name', 'passed', 'tags', 'public', 'build', 'custom-data').

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
  exTags

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

### executionTags
executionTags 

Type: `Array`

### customFields
customFields 

Type: `Array` of CustomField object

### fastWeb
fastWeb 

Type: `Boolean` default falseo

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
