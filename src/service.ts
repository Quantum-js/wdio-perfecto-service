/* eslint-disable no-unexpected-multiline */
/* eslint-disable @typescript-eslint/no-var-requires */

import logger from '@wdio/logger'
import _ from 'lodash'
import {
  Messages
} from '../perfecto-service'
import NewTimer from './util/NewTimer'
import { messages } from '@cucumber/messages'
import { ITestCaseHookParameter } from '@cucumber/cucumber/lib/support_code_library_builder/types'
import { Frameworks } from '@wdio/types'


const Reporting = require('perfecto-reporting')
const log = logger('wdio-perfecto-service')

function getAppParams(by: string, app: string) {
  const params: any = {}
  params[by] = app
  return params
}


// export type Browser = WebdriverIO.BrowserObject & WebdriverIO.MultiRemoteBrowserObject;
function parseFailureJsonFile(actualMessage: string): Messages | undefined {
  if (actualMessage === '') return undefined
  const failureReasons: Array<Messages> =
    browser.config.perfectoOpts?.failureReasons || []
    // browser.config as PerfectoOptsConfig).perfectoOpts?.failureReasons || []
  for (const i in failureReasons) {
    const messages: Messages = failureReasons[i]
    if (
      messages.StackTraceErrors === null ||
      messages.StackTraceErrors === undefined
    ) {
      log.info(
        'Failure Reasons JSON file has wrong formmat, please read here https://developers.perfectomobile.com/pages/viewpage.action?pageId=31103917: '
      )
      return undefined
    }

    for (const i in messages.StackTraceErrors) {
      log.info(messages.StackTraceErrors[i])
      log.info(actualMessage)
      if (actualMessage.includes(messages.StackTraceErrors[i])) {
        return messages
      }
    }
  }

  return undefined
}


    // The function forces 'this' to be the element, instead of TS default of this class.
function waitUntilOverwrite(this: any, 
    _origFunction: any,
    condition: () => boolean | Promise<boolean>,
    {
      timeout = browser.options.waitforTimeout,
      interval = browser.options.waitforInterval,
      timeoutMsg
    }: any
  ) {
  if (typeof condition !== 'function') {
    throw new Error('Condition is not a function')
  }

  /**
   * ensure that timeout and interval are set properly
   */
  if (typeof timeout !== 'number') {
    timeout = browser.options.waitforTimeout as number
  }

  if (typeof interval !== 'number') {
    interval = browser.options.waitforInterval as number
  }

  const fn = condition.bind(this)
  const timer = new NewTimer(
    interval as number,
    timeout as number,
    fn,
    true
  )
  return (timer as any).catch((e: Error) => {
    if (e.message === 'timeout') {
      if (typeof timeoutMsg === 'string') {
        throw new Error(timeoutMsg)
      }
      throw new Error(`waitUntil condition timed out after ${timeout}ms`)
    }

    throw new Error(
      `waitUntil condition failed with the following reason: ${
        (e && e.message) || e
      }`
    )
  })
}


export class perfectoService {

  private _browser?:  WebdriverIO.BrowserObject & WebdriverIO.MultiRemoteBrowserObject

  constructor(
    private _options: WebdriverIO.ServiceOption,
    private _capabilities: WebDriver.DesiredCapabilities,
    // | WebDriver.Capabilities
    // | WebDriver.DesiredCapabilities,
    private _config: WebdriverIO.Config
  ) {}

  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfectoect place to define custom commands.
   * @param _capabilities  list of capabilities details
   * @param _specs         specs to be run in the worker process
   * @param browser       instance of created browser/device session
   */
  before(_capabilities: WebDriver.DesiredCapabilities, _specs: string[], browser:  WebdriverIO.BrowserObject | WebdriverIO.MultiRemoteBrowserObject ) : void{
    this._browser = browser

    this._browser.overwriteCommand('waitUntil', waitUntilOverwrite)
    this._browser.overwriteCommand('waitUntil', waitUntilOverwrite, true)
    
    /**
     * add perfecto commands
     */


    /**
     * Report commands
     */
    this._browser.addCommand(
      'verify',
      function (assertFnc: (arg0: any) => void, message: string): boolean {
        try {
          // browser.debug();
          assertFnc(message)
          // console.log('assertFnc', assertFnc)
          // console.log('message', message)

          browser.reportAssert(message, true)
          return true
        } catch (err) {
          console.log('verify in catch' + err.toString()) // browser.debug();

          // browser.failedOnVerify++
          // browser.failMessages.push(err)
          browser.reportAssert(err.toString(), false)
          return false
        }
      }
    )

    this._browser.addCommand(
      'assert',
      function (assertFnc: (arg0: any) => void, message: string): boolean {
        // TODOb add try 
        assertFnc(message)
        browser.reportAssert(message, true)
        return true
      }
    )

    this._browser.addCommand(
      'assert',
      function (message: string, status: boolean): void {
        browser.reportingClient.reportiumAssert(message, status)
      }
    )

    this._browser.addCommand(
      'reportComment',
      function (message: string): void {
        const params = {
          text: message
        }
        browser.execute('mobile:comment', params)
      }
    )

    /**
     * Device Utils
     */

    this._browser.addCommand(
      'startApp',
      function (by: string, app: string): void {
        browser.execute('mobile:application:open', getAppParams(by, app))
      }
    )
    // by = 'name' or 'identifier'
    this._browser.addCommand(
      'closeApp',
      function (by: string, app: string, ignoreExceptions = false): void {
        try {
          browser.execute('mobile:application:close', getAppParams(by, app))
        } catch (err) {
          if (!ignoreExceptions) {
            throw err
          }
        }
      }
    )
    this._browser.addCommand(
      'installApp',
      function (
        filePath: string,
        shouldInstrument: boolean,
        shouldSensorInstrument: boolean
      ): void {
        const params: any = {
          file: filePath
        }
        if (shouldInstrument) {
          params.instrument = 'instrument'
        }
        if (shouldSensorInstrument) {
          params.sensorInstrument = 'sensor'
        }
        browser.execute('mobile:application:install', params)
      }
    )

    // by = 'name' or 'identifier'
    this._browser.addCommand(
      'cleanApp',
      function (by: string, app: string): void {
        browser.execute('mobile:application:clean', getAppParams(by, app))
      }
    )
    // by = 'name' or 'identifier'
    this._browser.addCommand(
      'uninstallApp',
      function (by: string, app: string): void {
        browser.execute('mobile:application:uninstall', getAppParams(by, app))
      }
    )
    this._browser.addCommand('UninstallAllApps', function (): void {
      browser.execute('mobile:application:reset', {})
    })
    this._browser.addCommand(
      'getAppInfo',
      function (property: string): string {
        const params = {
          property: property
        }
        const result: any = browser.execute('mobile:application:info', params)
        log.info('GetAppInfo - ${result}')
        return result.value
      }
    )

    this._browser.addCommand(
      'verifyAppInfo',
      function (propertyName: string, propertyValue: any) {
        const message = `${propertyName} should be ${propertyValue}`
        const assertMethod = () =>
          expect(propertyValue).toEqual(
            browser.getAppInfo(propertyName).toString()
          )
        //const assertMethod = () => assert.equal(propertyValue, browser.GetAppInfo(propertyName), message)
        return browser.verify(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'assertAppInfo',
      function (propertyName: string, propertyValue: any) {
        const message = `${propertyName} must be ${propertyValue}`
        const assertMethod = () =>
          expect(propertyValue).toEqual(
            browser.getAppInfo(propertyName).toString()
          )
        //const assertMethod = () => assert.equal(propertyValue, browser.GetAppInfo(propertyName), message)
        return browser.assert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'waitForPresentTextVisual',
      function (text: string, timeout: number): void {
        const message = `Text: ${text} should be present after ${timeout} seconds`
        const assertMethod = () =>
          expect('true').toEqual(
            browser.findText(text, timeout).toString()
          )
        //onst assertMethod = () =>assert.equal(browser.FindText(text, timeout), 'true', `Text: ${text} should be present after ${seconds} seconds`)
        browser.assert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'waitForPresentImageVisual',
      function (
        img: string,
        timeout: number,
        threshold = 90,
        needleBound = 25
      ): void {
        const message = `Image: ${img} should be visible after ${timeout} seconds`
        const assertMethod = () =>
          expect('true').toEqual(
            browser.findImage(img, timeout, threshold, needleBound)
          )
        //onst assertMethod = () =>assert.equal(browser.FindText(text, timeout), 'true', `Text: ${text} should be present after ${seconds} seconds`)
        browser.assert(assertMethod, message)
        //assert.equal(browser.FindImage(img, timeout, threshold, needleBound), 'true', `Image: ${img} should be visible after ${seconds} seconds`)
      }
    )
    // pass external parameters
    // TODO : test vars
    this._browser.addCommand(
      'findImage',
      function (
        img: string,
        timeout: number,
        threshold = 90,
        needleBound = 25
      ): string {
        const params = {
          content: img,
          measurement: 'accurate',
          source: 'primary',
          threshold: threshold,
          timeout: timeout,
          match: 'bounded',
          'imageBounds.needleBound': needleBound
        }

        //params['imageBounds.needleBound'] = needleBound

        const result: any = browser.execute('mobile:checkpoint:image', params)
        log.info('FindImage - ${result}')
        return result.value
      }
    )
    // TODO: check passing seconds 60, 180 - getting threading errors
    this._browser.addCommand(
      'assertVisualImage',
      function (
        img: string,
        timeout: number,
        threshold = 90,
        needleBound = 25
      ): boolean {
        const message = `Image: ${img} must be visible after ${timeout} seconds`
        const assertMethod = () =>
          expect('true').toEqual(
            browser.findImage(img, timeout, threshold, needleBound)
          )

        //const assertMethod = () => assert.equal(browser.FindImage(img, timeout, threshold, needleBound), 'true', message)
        return browser.assert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'verifyVisualImage',
      function (
        img: string,
        timeout: any,
        threshold = 90,
        needleBound = 25
      ): boolean {
        const message = `Image: ${img} should be visible after ${timeout} seconds`
        // const assertMethod = () => assert.equal(browser.FindImage(img, timeout, threshold, needleBound), 'true', message)
        const assertMethod = () =>
          expect('true').toEqual(
            browser.findImage(img, timeout, threshold, needleBound)
          )
        return browser.verify(assertMethod, message)
      }
    )
    /**
     * Visual Text Checkpoint based on the text sent in and a threshold of 100
     *
     * @param text
     *            - Text to compare
     * @param timeout
     *            - timeout amount to search
     * @return true if found or false if not found
     */
    this._browser.addCommand(
      'findText',
      function (text: string, timeout: number): string {
        const params: any = {
          content: text,
          threshold: '100'
        }

        if (!_.isEmpty(timeout)) {
          params.timeout = timeout
        }
        const result: any = browser.execute('mobile:checkpoint:text', params)
        log.info('FindText - ${result}')
        return result.value
      }
    )
    // TODO: check verify options
    this._browser.addCommand(
      'assertVisualText',
      function (text: string): boolean {
        const message = `Text: ${text} must be present`
        const assertMethod = () =>
          expect('true').toEqual(browser.findText(text, 180))

        //                const assertMethod = () => assert.equal(browser.FindText(text, 180), 'true', message)
        return browser.assert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'verifyVisualText',
      function (text: string): boolean {
        const message = `Text: ${text} should be present`
        const assertMethod = () =>
          expect('true').toEqual(browser.findText(text, 180))
        return browser.verify(assertMethod, message)
      }
    )

    /**
     * Clicks on a single or sequence of physical device keys. Mouse-over the device
     * keys to identify them, then input into the Keys parameter according to the
     * required syntax.
     * <p>
     * Common keys include: LEFT, RIGHT, UP, DOWN, OK, BACK, MENU, VOL_UP, VOL_DOWN,
     * CAMERA, CLEAR.
     * <p>
     * The listed keys are not necessarily supported by all devices. The available
     * keys depend on the device.
     *
     * @param keySequence
     *            the single or sequence of keys to click
     */
    this._browser.addCommand(
      'pressKey',
      function (keySequence: string): void {
        const params = {
          keySequence: keySequence
        }
        browser.execute('mobile:presskey', params)
      }
    )

    /**
     * orms the swipe gesture according to the start and end coordinates.
     * <p>
     * Example swipe left:<br/>
     * start: 60%,50% end: 10%,50%
     *
     * @param start
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     * @param end
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     */
    this._browser.addCommand(
      'swipe',
      function (start: string, end: string): void {
        const params = {
          start: start,
          end: end
        }
        browser.execute('mobile:touch:swipe', params)
      }
    )

    /**
     * orms the tap gesture according to location coordinates with durations in
     * seconds.
     * <p>
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     *
     * @param seconds
     *            The duration, in seconds, for orming the touch operation.
     */
    this._browser.addCommand(
      'longTouch',
      function (point: string, seconds = 2): void {
        const params = {
          location: point,
          operation: 'single',
          duration: seconds
        }
        browser.execute('mobile:touch:tap', params)
      }
    )

    /**
     * orms the touch gesture according to the point coordinates.
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     */
    this._browser.addCommand('touch', function (point: string): void {
      const params = {
        location: point // 50%,50%
      }

      browser.execute('mobile:touch:tap', params)
    })

    /**
     * orms the double touch gesture according to the point coordinates.
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     */
    this._browser.addCommand(
      'doubleTouch',
      function (point: string): void {
        const params = {
          location: point, // 50%,50%
          operation: 'double'
        }
        browser.execute('mobile:touch:tap', params)
      }
    )

    /**
     * Hides the virtual keyboard display.
     *
     */
    this._browser.addCommand('hideKeyboard', function (): void {
      const params = {
        mode: 'off'
      }
      browser.execute('mobile:keyboard:display', params)
    })

    /**
     * Rotates the device to landscape, portrait, or its next state.
     *
     * @param restValue
     *            the 'next' operation, or the 'landscape' or 'portrait' state.
     * @param by
     *            the 'state' or 'operation'
     */
    // TODO: need additional description.
    this._browser.addCommand(
      'rotateDevice',
      function (by: string | number, restValue: string): void {
        const params: any = {}
        params[by] = restValue
        browser.execute('mobile:handset:rotate', params)
      }
    )

    // by = 'address' or 'coordinates'
    this._browser.addCommand(
      'setLocation',
      function (by: string | number, location: string): void {
        const params: any = {}
        params[by] = location

        browser.execute('mobile:location:set', params)
      }
    )

    this._browser.addCommand(
      'assertLocation',
      function (location: string): boolean {
        const deviceLocation = browser.getDeviceLocation()
        const message = `Device Location ${deviceLocation.toString()} must be equal ${location}`
        // const assertMethod = () => assert.equal(deviceLocation, location, message)
        const assertMethod = () => expect(location).toEqual(deviceLocation)
        return browser.assert(assertMethod, message)
      }
    )

    this._browser.addCommand(
      'verifyLocation',
      function (location: string): boolean {
        const deviceLocation = browser.getDeviceLocation()
        const message = `Device Location ${deviceLocation.toString()} should be equal ${location}`
        const assertMethod = () => expect(location).toEqual(deviceLocation)
        return browser.verify(assertMethod, message)
      }
    )

    this._browser.addCommand('getDeviceLocation', function (): string {
      return (browser.execute('mobile:location:get', {}) as unknown) as string
    })

    this._browser.addCommand('resetLocation', function (): void {
      browser.execute('mobile:location:reset', {})
    })

    this._browser.addCommand('goToHomeScreen', function (): void {
      const params = {
        target: 'All'
      }
      browser.execute('mobile:handset:ready', params)
    })

    this._browser.addCommand(
      'lockDevice',
      function (sec: number): void {
        const params = {
          timeout: sec
        }
        browser.execute('mobile:screen:lock', params)
      }
    )

    this._browser.addCommand(
      'setTimezone',
      function (timezone: string): void {
        const params = {
          timezone: timezone
        }

        browser.execute('mobile:timezone:set', params)
      }
    )

    this._browser.addCommand('getTimezone', function (): string {
      return (browser.execute('mobile:timezone:get', {}) as unknown) as string
    })

    this._browser.addCommand(
      'assertTimezone',
      function (timezone: string): boolean {
        const deviceTimezone = browser.getTimezone()
        const message = `Device timezone ${deviceTimezone} must be equal ${timezone}`
        const assertMethod = () => expect(timezone).toEqual(deviceTimezone)
        return browser.assert(assertMethod, message)
      }
    )

    this._browser.addCommand(
      'verifyTimezone',
      function (timezone: any) {
        const deviceTimezone = browser.getTimezone()
        const message = `Device timezone ${deviceTimezone} should be equal ${timezone}`
        const assertMethod = () => expect(timezone).toEqual(deviceTimezone)
        return browser.verify(assertMethod, message)
      }
    )

    this._browser.addCommand('resetTimezone', function (): void {
      browser.execute('mobile:timezone:reset', {})
    })

    this._browser.addCommand(
      'takeScreenshot',
      function (repositoryPath: string, shouldSave: boolean): void {
        const params: any = {}
        if (shouldSave) {
          params.key = repositoryPath
        }
        browser.execute('mobile:screen:image', params)
      }
    )

    // by = 'name' or 'identifier'
    this._browser.addCommand(
      'startImageInjection',
      function (
        repositoryFile: string,
        by: string | number,
        app: string
      ): void {
        const params: any = {}
        params['repositoryFile'] = repositoryFile
        params[by] = app
        browser.execute('mobile:image.injection:start', params)
      }
    )
    this._browser.addCommand('stopImageInjection', function (): void {
      browser.execute('mobile:image.injection:stop', {})
    })

    this._browser.addCommand(
      'setFingerprint',
      function (
        by: string | number,
        identifier: string,
        resultAuth: string,
        errorType: string
      ): void {
        const params: any = {
          resultAuth: resultAuth
        }
        params[by] = identifier

        if (!_.isEmpty(errorType)) {
          params.errorType = errorType
        }

        browser.execute('mobile:fingerprint:set', params)
      }
    )

    this._browser.addCommand(
      'setSensorAuthentication',
      function (
        by: string,
        identifier: string,
        resultAuth: string,
        errorType: string
      ): void {
        const params: any = {}
        params[by] = identifier
        params.resultAuth = resultAuth
        params.errorType = errorType

        browser.execute('mobile:sensorAuthentication:set', params)
      }
    )

    this._browser.addCommand('generateHAR', function (): void {
      const params = {
        generateHarFile: 'true'
      }
      browser.execute('mobile:vnetwork:start', params)
    })

    this._browser.addCommand('stopGenerateHAR', function (): void {
      browser.execute('mobile:vnetwork:stop', {})
    })

    this._browser.addCommand(
      'audioInject',
      function (filePath: string): void {
        const params = {
          key: filePath,
          wait: 'nowait'
        }
        browser.execute('mobile:audio:inject', params)
      }
    )

    this._browser.addCommand('verifyAudioReceived', function (): void {
      // The below settings have been working with best and consistent results for
      // different devices. In case these settings does not work for you then try
      // changing the configurations.
      const params = {
        volume: -100,
        duration: 1,
        timeout: 45
      }

      const audioCheckpointStatus: boolean = (browser.execute(
        'mobile:checkpoint:audio',
        params
      ) as unknown) as boolean
      browser.reportAssert(
        'Audio checkpoint status ',
        audioCheckpointStatus
      )
    })

    this._browser.addCommand(
      'getDeviceProperty',
      function (property: string): string {
        const params = {
          property: property
        }
        const result: any = browser.execute('mobile:handset:info', params)
        log.info('getDeviceProperty - ${result}')
        return result.value
      }
    )
  }

  // beforeTest (test: any) {
  //     /**
  //      * Date:    20200714
  //      * Remark:  Sauce Unified Platform doesn't support updating the context yet.
  //      */
  //     if (!this._isServiceEnabled || this._isRDC || this._isUP || !this._browser) {
  //         return
  //     }

  //     /**
  //      * in jasmine we get Jasmine__TopLevel__Suite as title since service using test
  //      * framework hooks in order to execute async functions.
  //      * This tweak allows us to set the real suite name for jasmine jobs.
  //      */
  //     /* istanbul ignore if */
  //     if (this._suiteTitle === 'Jasmine__TopLevel__Suite') {
  //         this._suiteTitle = test.fullName.slice(0, test.fullName.indexOf(test.description) - 1)
  //     }

  //     if (this._browser && !this._isUP && !this._isJobNameSet) {
  //         this._browser.execute('sauce:job-name=' + this._suiteTitle)
  //         this._isJobNameSet = true
  //     }

  //     const fullTitle = (
  //         /**
  //          * Jasmine
  //          */
  //         test.fullName ||
  //         /**
  //          * Mocha
  //          */
  //         `${test.parent} - ${test.title}`
  //     )
  //     this._browser.execute('sauce:context=' + fullTitle)
  // }

  // afterSuite (suite: any) {
  //     if (Object.prototype.hasOwnProperty.call(suite, 'error')) {
  //         ++this._failures
  //     }
  // }

  // afterTest (test: any, context: any, results: any) {
  //     /**
  //      * If the test failed push the stack to Sauce Labs in separate lines
  //      * This should not be done for UP because it's not supported yet and
  //      * should be removed when UP supports `sauce:context`
  //      */
  //     const { error } = results
  //     if (error && !this._isUP){
  //         const lines = error.stack.split(/\r?\n/).slice(0, this._maxErrorStackLength)
  //         lines.forEach((line:string) => (this._browser as WebdriverIO.Browser).execute('sauce:context=' + line))
  //     }

  //     /**
  //      * remove failure if test was retried and passed
  //      * > Mocha only
  //      */
  //     if (test._retriedTest && results.passed) {
  //         --this._failures
  //         return
  //     }

  //     /**
  //      * don't bump failure number if test was retried and still failed
  //      * > Mocha only
  //      */
  //     if (test._retriedTest && !results.passed && test._currentRetry < test._retries) {
  //         return
  //     }

  //     if (!results.passed) {
  //         ++this._failures
  //     }
  // }

  transformResponse(response: any, _requestOptions: any): any {
    const sBody = JSON.stringify(response.body)
    if (sBody.includes('no_such_element')) {
      //console.log("\n\n" + sBody);
      if (sBody.split('localizedMessage').length > 1) {
        const message = sBody
          .split('localizedMessage')[1]
          .split(',')[0]
          .split('\n')[0]
          .substr(3)
        response.body = {
          value: {
            error: 'no such element',
            message: message
          }
        }
        response.statusCode = 404
        response.statusMessage = 'Not Found'
      }
    }
    return response
  }

 
     /**
     * Cucumber Hooks
     *
     * Runs before a Cucumber Feature.
     * @param {String}                   uri      path to feature file
     * @param {GherkinDocument.IFeature} feature  Cucumber feature object
     */
    // beforeFeature: function (uri, feature) {
    // },

  /**
   * For CucumberJS
   */
  /**
     *
     * Runs before a Cucumber Feature.
     * @param _uri      path to feature file
     * @param _feature  Cucumber feature object
     */
 beforeFeature?(_uri: string, _feature: messages.GherkinDocument.IFeature): void {
  // beforeFeature(): void {
    const perfectoOpts = browser.config.perfectoOpts
    const tags = perfectoOpts?.executionTags
    const customFields: any = []

    if (perfectoOpts?.customFields !== undefined) {
      for (const [key, value] of Object.entries(perfectoOpts?.customFields)) {
        console.log(`${key}: ${value}`)
        customFields.push(new Reporting.Model.CustomField(key, value))
      }
    }

    // const perfectoExecutionContext: any = new Reporting.Perfecto.PerfectoExecutionContext(
    //   {
    //     webdriver: {
    //       executeScript: (command: any, params: any) => {
    //         return browser.execute(command, params)
    //       }
    //     },
    //     tags: tags,
    //     customFields: customFields
    //   }
    // )
    // const client : any = new Reporting.Perfecto.PerfectoReportingClient(
    //   perfectoExecutionContext
    // )
    browser.reportingClient = new Reporting.Perfecto.PerfectoReportingClient(
      new Reporting.Perfecto.PerfectoExecutionContext({
        webdriver: {
          executeScript: (command: any, params: any) => {
            return browser.execute(command, params)
          }
        },
        tags: tags,
        customFields: customFields
      })
    )
  }
   /**
     *
     * Runs before a Cucumber Scenario.
     * @param {ITestCaseHookParameter} world world object containing information on pickle and test step
     */
 beforeScenario?(world : ITestCaseHookParameter): void {

  // beforeScenario?(
  //   _uri: string,
  //   _feature: CucumberHookObject,
  //   scenario: CucumberHookObject
  // ): void {
    const tags = []
    const scenario = world.pickle
    const scenarioTags = scenario.tags || []
    for (let i = 0; i < scenarioTags.length; i++) {
      tags.push((scenarioTags[i]).name)
    }
    const testContext: any = {}
    testContext.tags = tags
    browser.reportingClient.testStart(
      scenario.name,
      testContext
    )
  }

  // /**
  //  *
  //  * Runs before a Cucumber Scenario.
  //  * @param {ITestCaseHookParameter} world  world object containing information on pickle and test step
  //  * @param {Object}                 result results object containing scenario results
  //  * @param {boolean}                result.passed   true if scenario has passed
  //  * @param {string}                 result.error    error stack if scenario failed
  //  * @param {number}                 result.duration duration of scenario in milliseconds
  //  */
  // afterScenario (world, result): void {


  // }
  /**
   *
   * Runs before a Cucumber Scenario.
   * @param {ITestCaseHookParameter} world  world object containing information on pickle and test step
   * @param {Object}                 result results object containing scenario results
   * @param {boolean}                result.passed   true if scenario has passed
   * @param {string}                 result.error    error stack if scenario failed
   * @param {number}                 result.duration duration of scenario in milliseconds
   */
  afterScenario?(world: ITestCaseHookParameter, result: Frameworks.PickleResult): void {
    if (result.passed) {
      browser.reportingClient.testStop({
        status: Reporting.Constants.results.passed
      })
    } else {
      const actualExceptionMessage: string = result.error || '' //?.stack || ''
      const msg = 'An error occurred' //result.exception?.message || 'An error occurred'
      const message: Messages | undefined = parseFailureJsonFile(
        actualExceptionMessage
      )

      if (typeof message !== 'undefined') {
        const customFields: any = []

        if (message.CustomFields !== undefined) {
          for (const [key, value] of Object.entries(message.CustomFields)) {
            console.log(`${key}: ${value}`)
            customFields.push(new Reporting.Model.CustomField(key, value))
          }
        }

        const testContext: any = {}
        testContext.tags = message.Tags
        testContext.customFields = customFields
        browser.reportingClient.testStop(
          {
            status: Reporting.Constants.results.failed,
            message: msg + '/n/n' + actualExceptionMessage,
            failureReason: message.CustomError
          },
          testContext
        )
      // } else {
      //   browser.reportingClient.testStop({
      //     status: Reporting.Constants.results.failed,
      //     message: msg + '/n/n' + actualExceptionMessage
      //   })
      }
    }
  }

  /**
   *
   * Runs before a Cucumber Step.
   * @param {Pickle.IPickleStep} step     step data
   * @param {IPickle}            scenario scenario pickle
   */
  beforeStep (step: messages.Pickle.PickleStep, _scenario: messages.Pickle) {
    browser.reportingClient.stepStart(
      `${step.argument} ${step.text}`
    )
  }

  // /**
  //  * Runs after a Cucumber step
  //  */
  // afterStep(step: StepData, context: any, result: { error?: any, result?: any, passed: boolean, duration: number }): void {
  //     log.info('*********** After step. Status= ' + result.passed)
  // }

  after(result: number, _caps: any, _specs: string[]): void {
    //async after(result, capabilities, specs) : {
    log.info(
      '\n\nReport: ' +
        browser.capabilities.testGridReportUrl
    )
  }
}

// beforeFeature?(uri: string, feature: CucumberHookObject, scenarios: CucumberHookObject[]): void;
// beforeScenario?(uri: string, feature: CucumberHookObject, scenario: CucumberHookObject, sourceLocation: SourceLocation, context?: World): void;
// beforeStep?(step: StepData, context: World): void;
// afterStep?(step: StepData, context: World, result: { error?: any, result?: any, passed: boolean, duration: number }): void;
// afterScenario?(uri: string, feature: CucumberHookObject, scenario: CucumberHookObject, result: CucumberHookResult, sourceLocation: SourceLocation, context?: World): void;
// afterFeature?(uri: string, feature: CucumberHookObject, scenarios: CucumberHookObject[]): void;
