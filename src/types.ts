// /// <reference types="expect-webdriverio"/>

// import { Config } from '@wdio/sync'
// import { List } from 'lodash'

// export type Capabilities = WebDriver.Capabilities &
//   WebdriverIO.MultiRemoteCapabilities &
//   PerfectoCapabilities

// export type Browser = WebdriverIO.BrowserObject &
//   WebdriverIO.MultiRemoteBrowserObject &
//   PerfectoBrowser
  
// export interface PerfectoCapabilities extends WebDriver.Capabilities {
//   testGridReportUrl?: string
// }

// export interface PerfectoOptsConfig {
//   perfectoOpts?: perfectoOpts
// }

// export interface perfectoOpts {
//   /**
//    * Execution Tags to optimize the reports
//    */
//   executionTags?: string[]
//   /**
//    * customFields to optimize the reports
//    */
//   customFields?: any

//   /**
//    * FailureR eason Config file location
//    */
//   failureReasons?: Array<Messages>

//   overwriteWaitUntil?: boolean
// }

// export interface PerfectoServiceConfig {
//   securityToken?: string
// }
// export interface PerfectoBrowser {
//   verify(assertFnc: any, message: string): boolean
//   assert(assertFnc: any, message: string): boolean

//   startApp(by: string, app: string): void
//   closeApp(by: string, app: string, ignoreExceptions: boolean): void
//   reportAssert(message: string, status: boolean): void
//   installApp(
//     filePath: string,
//     shouldInstrument: boolean,
//     shouldSensorInstrument: boolean
//   ): void
//   cleanApp(by: string, app: string): void
//   uninstallApp(by: string, app: string): void
//   uninstallAllApps(): void
//   getAppInfo(property: string): string
//   verifyAppInfo(propertyName: string, propertyValue: any): void

//   assertAppInfo(propertyName: string, propertyValue: any): any
//   waitForPresentTextVisual(text: string, timeout: number): void
//   waitForPresentImageVisual(
//     img: string,
//     timeout: number,
//     threshold: number,
//     needleBound: number
//   ): void

//   findImage(
//     img: string,
//     timeout: number,
//     threshold?: number,
//     needleBound?: number
//   ): string

//   assertVisualImage(
//     img: string,
//     timeout: number,
//     threshold: number,
//     needleBound: number
//   ): boolean
//   verifyVisualImage(
//     img: string,
//     timeout: number,
//     threshold: number,
//     needleBound: number
//   ): boolean

//   findText(text: string, timeout: number): string
//   // TODO: check verify options
//   assertVisualText(text: string): boolean
//   verifyVisualText(text: string): boolean

//   pressKey(keySequence: string): void

//   swipe(start: string, end: string): void
//   longTouch(point: string, seconds: number): void
//   touch(point: string): void
//   doubleTouch(point: string): void
//   hideKeyboard(): void
//   rotateDevice(by: string | number, restValue: string): void
//   setLocation(by: string | number, location: string): void
//   assertLocation(location: string): void
//   verifyLocation(location: string): boolean
//   getDeviceLocation(): string
//   resetLocation(): void
//   goToHomeScreen(): void
//   lockDevice(sec: number): void
//   setTimezone(timezone: string): void
//   getTimezone(): string

//   assertTimezone(timezone: string): boolean
//   verifyTimezone(timezone: string): boolean
//   resetTimezone(): void

//   takeScreenshot(repositoryPath: string, shouldSave: boolean): void
//   startImageInjection(
//     repositoryFile: string,
//     by: string | number,
//     app: string
//   ): void
//   stopImageInjection(): void

//   setFingerprint(
//     by: string | number,
//     identifier: string,
//     resultAuth: string,
//     errorType: string
//   ): void

//   setSensorAuthentication(
//     by: string,
//     identifier: string,
//     resultAuth: string,
//     errorType: string
//   ): void

//   generateHAR(): void
//   stopGenerateHAR(): void
//   audioInject(filePath: string): void

//   verifyAudioReceived(): void
//   getDeviceProperty(property: string): string
//   // TouchObject(selector: string, addressBar: string): void;
//   // SlideObjectLeft(selector: string) : void;

//   // SlideObject(selector: string, xStartMult: number, xEndMult: number, yStartMult: number, yEndMult: number) : void;
//   // GetScale() : number;
//   // GetOffset(addressBar: string, context? : string) : number;
//   // SetPickerWheel(locator: string, direction: any, value: { replaceAll: (arg0: string, arg1: string) => any }, offset: number): void;
//   // PickerwheelGet(locator: string) : any;
//   // PickerwheelStep(locator: string , direction: any, offset: number) : void;

//   reportingClient?: any
// }

// export interface Messages {
//   StackTraceErrors: List<string>
//   CustomFields: List<string>
//   Tags: List<string>
//   CustomError: string
//   JsonFile: string
// }
