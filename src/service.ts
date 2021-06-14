/* eslint-disable no-unexpected-multiline */
/* eslint-disable @typescript-eslint/no-var-requires */

import logger from '@wdio/logger'
import {
  CucumberHookObject,
  StepData,
  CucumberHookResult
} from '@wdio/cucumber-framework'
import _ from 'lodash'
import {
  PerfectoOptsConfig,
  Messages,
  PerfectoCapabilities,
  PerfectoBrowser,
  Capabilities,
  Browser
} from './types'
import NewTimer from './util/NewTimer'

const Reporting = require('perfecto-reporting')
const log = logger('wdio-perfecto-service')

function getAppParams(by: string, app: string) {
  const params: any = {}
  params[by] = app
  return params
}

function parseFailureJsonFile(actualMessage: string): Messages | undefined {
  if (actualMessage === '') return undefined
  const failureReasons: Array<Messages> =
    (browser.config as PerfectoOptsConfig).perfectoOpts?.failureReasons || []
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


export default class perfectoService implements WebdriverIO.ServiceInstance {
  private _browser?: Browser
  // | WebdriverIO.BrowserObject
  // | WebdriverIO.MultiRemoteBrowser
  // | PerfectoBrowser

  constructor(
    private _options: PerfectoOptsConfig,
    private _capabilities: Capabilities,
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
  before(_capabilities: Capabilities, _specs: string[], browser: Browser) {
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
      'perfectoVerify',
      function (assertFnc: (arg0: any) => void, message: string): boolean {
        try {
          // browser.debug();
          assertFnc(message)
          // console.log('assertFnc', assertFnc)
          // console.log('message', message)

          browser.perfectoReportAssert(message, true)
          return true
        } catch (err) {
          console.log('verify in catch' + err.toString()) // browser.debug();

          // browser.failedOnVerify++
          // browser.failMessages.push(err)
          browser.perfectoReportAssert(err.toString(), false)
          return false
        }
      }
    )

    this._browser.addCommand(
      'perfectoAssert',
      function (assertFnc: (arg0: any) => void, message: string): boolean {
        assertFnc(message)
        browser.perfectoReportAssert(message, true)
        return true
      }
    )

    this._browser.addCommand(
      'perfectoReportAssert',
      function (message: string, status: boolean): void {
        browser.reportingClient.reportiumAssert(message, status)
      }
    )

    this._browser.addCommand(
      'perfectoReportComment',
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
      'perfectoStartApp',
      function (by: string, app: string): void {
        browser.execute('mobile:application:open', getAppParams(by, app))
      }
    )
    // by = 'name' or 'identifier'
    this._browser.addCommand(
      'perfectoCloseApp',
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
      'perfectoInstallApp',
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
      'perfectoCleanApp',
      function (by: string, app: string): void {
        browser.execute('mobile:application:clean', getAppParams(by, app))
      }
    )
    // by = 'name' or 'identifier'
    this._browser.addCommand(
      'perfectoUninstallApp',
      function (by: string, app: string): void {
        browser.execute('mobile:application:uninstall', getAppParams(by, app))
      }
    )
    this._browser.addCommand('perfectoUninstallAllApps', function (): void {
      browser.execute('mobile:application:reset', {})
    })
    this._browser.addCommand(
      'perfectoGetAppInfo',
      function (property: string): string {
        const params = {
          property: property
        }
        const result: any = browser.execute('mobile:application:info', params)
        log.info('perfectoGetAppInfo - ${result}')
        return result.value
      }
    )

    this._browser.addCommand(
      'perfectoVerifyAppInfo',
      function (propertyName: string, propertyValue: any) {
        const message = `${propertyName} should be ${propertyValue}`
        const assertMethod = () =>
          expect(propertyValue).toEqual(
            browser.perfectoGetAppInfo(propertyName).toString()
          )
        //const assertMethod = () => assert.equal(propertyValue, browser.perfectoGetAppInfo(propertyName), message)
        return browser.perfectoVerify(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'perfectoAssertAppInfo',
      function (propertyName: string, propertyValue: any) {
        const message = `${propertyName} must be ${propertyValue}`
        const assertMethod = () =>
          expect(propertyValue).toEqual(
            browser.perfectoGetAppInfo(propertyName).toString()
          )
        //const assertMethod = () => assert.equal(propertyValue, browser.perfectoGetAppInfo(propertyName), message)
        return browser.perfectoAssert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'perfectoWaitForPresentTextVisual',
      function (text: string, timeout: number): void {
        const message = `Text: ${text} should be present after ${timeout} seconds`
        const assertMethod = () =>
          expect('true').toEqual(
            browser.perfectoFindText(text, timeout).toString()
          )
        //onst assertMethod = () =>assert.equal(browser.perfectoFindText(text, timeout), 'true', `Text: ${text} should be present after ${seconds} seconds`)
        browser.perfectoAssert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'perfectoWaitForPresentImageVisual',
      function (
        img: string,
        timeout: number,
        threshold = 90,
        needleBound = 25
      ): void {
        const message = `Image: ${img} should be visible after ${timeout} seconds`
        const assertMethod = () =>
          expect('true').toEqual(
            browser.perfectoFindImage(img, timeout, threshold, needleBound)
          )
        //onst assertMethod = () =>assert.equal(browser.perfectoFindText(text, timeout), 'true', `Text: ${text} should be present after ${seconds} seconds`)
        browser.perfectoAssert(assertMethod, message)
        //assert.equal(browser.perfectoFindImage(img, timeout, threshold, needleBound), 'true', `Image: ${img} should be visible after ${seconds} seconds`)
      }
    )
    // pass external parameters
    // TODO : test vars
    this._browser.addCommand(
      'perfectoFindImage',
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
        log.info('perfectoFindImage - ${result}')
        return result.value
      }
    )
    // TODO: check passing seconds 60, 180 - getting threading errors
    this._browser.addCommand(
      'perfectoAssertVisualImage',
      function (
        img: string,
        timeout: number,
        threshold = 90,
        needleBound = 25
      ): boolean {
        const message = `Image: ${img} must be visible after ${timeout} seconds`
        const assertMethod = () =>
          expect('true').toEqual(
            browser.perfectoFindImage(img, timeout, threshold, needleBound)
          )

        //const assertMethod = () => assert.equal(browser.perfectoFindImage(img, timeout, threshold, needleBound), 'true', message)
        return browser.perfectoAssert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'perfectoVerifyVisualImage',
      function (
        img: string,
        timeout: any,
        threshold = 90,
        needleBound = 25
      ): boolean {
        const message = `Image: ${img} should be visible after ${timeout} seconds`
        // const assertMethod = () => assert.equal(browser.perfectoFindImage(img, timeout, threshold, needleBound), 'true', message)
        const assertMethod = () =>
          expect('true').toEqual(
            browser.perfectoFindImage(img, timeout, threshold, needleBound)
          )
        return browser.perfectoVerify(assertMethod, message)
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
      'perfectoFindText',
      function (text: string, timeout: number): string {
        const params: any = {
          content: text,
          threshold: '100'
        }

        if (!_.isEmpty(timeout)) {
          params.timeout = timeout
        }
        const result: any = this.execute('mobile:checkpoint:text', params)
        log.info('perfectoFindText - ${result}')
        return result.value
      }
    )
    // TODO: check verify options
    this._browser.addCommand(
      'perfectoAssertVisualText',
      function (text: string): boolean {
        const message = `Text: ${text} must be present`
        const assertMethod = () =>
          expect('true').toEqual(browser.perfectoFindText(text, 180))

        //                const assertMethod = () => assert.equal(browser.perfectoFindText(text, 180), 'true', message)
        return browser.perfectoAssert(assertMethod, message)
      }
    )
    this._browser.addCommand(
      'perfectoVerifyVisualText',
      function (text: string): boolean {
        const message = `Text: ${text} should be present`
        const assertMethod = () =>
          expect('true').toEqual(browser.perfectoFindText(text, 180))
        return browser.perfectoVerify(assertMethod, message)
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
      'perfectoPressKey',
      function (keySequence: string): void {
        const params = {
          keySequence: keySequence
        }
        this.execute('mobile:presskey', params)
      }
    )

    /**
     * perfectoorms the swipe gesture according to the start and end coordinates.
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
      'perfectoSwipe',
      function (start: string, end: string): void {
        const params = {
          start: start,
          end: end
        }
        this.execute('mobile:touch:swipe', params)
      }
    )

    /**
     * perfectoorms the tap gesture according to location coordinates with durations in
     * seconds.
     * <p>
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     *
     * @param seconds
     *            The duration, in seconds, for perfectoorming the touch operation.
     */
    this._browser.addCommand(
      'perfectoLongTouch',
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
     * perfectoorms the touch gesture according to the point coordinates.
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     */
    this._browser.addCommand('perfectoTouch', function (point: string): void {
      const params = {
        location: point // 50%,50%
      }

      browser.execute('mobile:touch:tap', params)
    })

    /**
     * perfectoorms the double touch gesture according to the point coordinates.
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended).
     */
    this._browser.addCommand(
      'perfectoDoubleTouch',
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
    this._browser.addCommand('perfectoHideKeyboard', function (): void {
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
      'perfectoRotateDevice',
      function (by: string | number, restValue: string): void {
        const params: any = {}
        params[by] = restValue
        browser.execute('mobile:handset:rotate', params)
      }
    )

    // by = 'address' or 'coordinates'
    this._browser.addCommand(
      'perfectoSetLocation',
      function (by: string | number, location: string): void {
        const params: any = {}
        params[by] = location

        browser.execute('mobile:location:set', params)
      }
    )

    this._browser.addCommand(
      'perfectoAssertLocation',
      function (location: string): boolean {
        const deviceLocation = browser.perfectoGetDeviceLocation()
        const message = `Device Location ${deviceLocation.toString()} must be equal ${location}`
        // const assertMethod = () => assert.equal(deviceLocation, location, message)
        const assertMethod = () => expect(location).toEqual(deviceLocation)
        return browser.perfectoAssert(assertMethod, message)
      }
    )

    this._browser.addCommand(
      'perfectoVerifyLocation',
      function (location: string): boolean {
        const deviceLocation = browser.perfectoGetDeviceLocation()
        const message = `Device Location ${deviceLocation.toString()} should be equal ${location}`
        const assertMethod = () => expect(location).toEqual(deviceLocation)
        return browser.perfectoVerify(assertMethod, message)
      }
    )

    this._browser.addCommand('perfectoGetDeviceLocation', function (): string {
      return (browser.execute('mobile:location:get', {}) as unknown) as string
    })

    this._browser.addCommand('perfectoResetLocation', function (): void {
      browser.execute('mobile:location:reset', {})
    })

    this._browser.addCommand('perfectoGoToHomeScreen', function (): void {
      const params = {
        target: 'All'
      }
      browser.execute('mobile:handset:ready', params)
    })

    this._browser.addCommand(
      'perfectoLockDevice',
      function (sec: number): void {
        const params = {
          timeout: sec
        }
        browser.execute('mobile:screen:lock', params)
      }
    )

    this._browser.addCommand(
      'perfectoSetTimezone',
      function (timezone: string): void {
        const params = {
          timezone: timezone
        }

        browser.execute('mobile:timezone:set', params)
      }
    )

    this._browser.addCommand('perfectoGetTimezone', function (): string {
      return (browser.execute('mobile:timezone:get', {}) as unknown) as string
    })

    this._browser.addCommand(
      'perfectoAssertTimezone',
      function (timezone: string): boolean {
        const deviceTimezone = browser.perfectoGetTimezone()
        const message = `Device timezone ${deviceTimezone} must be equal ${timezone}`
        const assertMethod = () => expect(timezone).toEqual(deviceTimezone)
        return browser.perfectoAssert(assertMethod, message)
      }
    )

    this._browser.addCommand(
      'perfectoVerifyTimezone',
      function (timezone: any) {
        const deviceTimezone = browser.perfectoGetTimezone()
        const message = `Device timezone ${deviceTimezone} should be equal ${timezone}`
        const assertMethod = () => expect(timezone).toEqual(deviceTimezone)
        return browser.perfectoVerify(assertMethod, message)
      }
    )

    this._browser.addCommand('perfectoResetTimezone', function (): void {
      browser.execute('mobile:timezone:reset', {})
    })

    this._browser.addCommand(
      'perfectoTakeScreenshot',
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
      'perfectoStartImageInjection',
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
    this._browser.addCommand('perfectoStopImageInjection', function (): void {
      browser.execute('mobile:image.injection:stop', {})
    })

    this._browser.addCommand(
      'perfectoSetFingerprint',
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
      'perfectoSetSensorAuthentication',
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

    this._browser.addCommand('perfectoGenerateHAR', function (): void {
      const params = {
        generateHarFile: 'true'
      }
      browser.execute('mobile:vnetwork:start', params)
    })

    this._browser.addCommand('perfectoStopGenerateHAR', function (): void {
      browser.execute('mobile:vnetwork:stop', {})
    })

    this._browser.addCommand(
      'perfectoAudioInject',
      function (filePath: string): void {
        const params = {
          key: filePath,
          wait: 'nowait'
        }
        browser.execute('mobile:audio:inject', params)
      }
    )

    this._browser.addCommand('perfectoVerifyAudioReceived', function (): void {
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
      browser.perfectoReportAssert(
        'Audio checkpoint status ',
        audioCheckpointStatus
      )
    })

    this._browser.addCommand(
      'perfectoGetDeviceProperty',
      function (property: string): string {
        const params = {
          property: property
        }
        const result: any = browser.execute('mobile:handset:info', params)
        log.info('perfectoGetDeviceProperty - ${result}')
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
   * For CucumberJS
   */
  beforeFeature(): void {
    const perfectoOpts = (browser.config as PerfectoOptsConfig).perfectoOpts
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
    ((browser as unknown) as PerfectoBrowser).reportingClient = new Reporting.Perfecto.PerfectoReportingClient(
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

  beforeScenario?(
    _uri: string,
    _feature: CucumberHookObject,
    scenario: CucumberHookObject
  ): void {
    const tags = []
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < scenario.tags.length; i++) {
      tags.push(scenario.tags[i].name)
    }
    const testContext: any = {}
    testContext.tags = tags
    ;((browser as unknown) as PerfectoBrowser).reportingClient.testStart(
      scenario.name,
      testContext
    )
  }

  afterScenario?(
    _uri: string,
    _feature: CucumberHookObject,
    _scenario: CucumberHookObject,
    result: CucumberHookResult
  ): void {
    if (result.status === 'passed') {
      ((browser as unknown) as PerfectoBrowser).reportingClient.testStop({
        status: Reporting.Constants.results.passed
      })
    } else if (result.status === 'failed') {
      const actualExceptionMessage: string = result.exception?.stack || ''
      const msg: string = result.exception?.message || 'An error occurred'
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
        testContext.customFields = customFields(
          (browser as unknown) as PerfectoBrowser
        ).reportingClient.testStop(
          {
            status: Reporting.Constants.results.failed,
            message: msg + '/n/n' + actualExceptionMessage,
            failureReason: message.CustomError
          },
          testContext
        )
      } else {
        ((browser as unknown) as PerfectoBrowser).reportingClient.testStop({
          status: Reporting.Constants.results.failed,
          message: msg + '/n/n' + actualExceptionMessage
        })
      }
    }
  }

  /**
   * Runs before a Cucumber step
   */
  beforeStep(step: StepData): void {
    ((browser as unknown) as PerfectoBrowser).reportingClient.stepStart(
      `${step.step.step.keyword} ${step.step.step.text}`
    )
  }
  // /**
  //  * Runs after a Cucumber step
  //  */
  // afterStep(step: StepData, context: any, result: { error?: any, result?: any, passed: boolean, duration: number }): void {
  //     log.info('*********** After step. Status= ' + result.passed)
  // }

  after(_result: number, _caps: any, _specs: string[]): void {
    //async after(result, capabilities, specs) : {
    log.info(
      '\n\nReport: ' +
        (browser.capabilities as PerfectoCapabilities).testGridReportUrl
    )
  }
}

// beforeFeature?(uri: string, feature: CucumberHookObject, scenarios: CucumberHookObject[]): void;
// beforeScenario?(uri: string, feature: CucumberHookObject, scenario: CucumberHookObject, sourceLocation: SourceLocation, context?: World): void;
// beforeStep?(step: StepData, context: World): void;
// afterStep?(step: StepData, context: World, result: { error?: any, result?: any, passed: boolean, duration: number }): void;
// afterScenario?(uri: string, feature: CucumberHookObject, scenario: CucumberHookObject, result: CucumberHookResult, sourceLocation: SourceLocation, context?: World): void;
// afterFeature?(uri: string, feature: CucumberHookObject, scenarios: CucumberHookObject[]): void;
