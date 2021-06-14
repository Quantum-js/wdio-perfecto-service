/// <reference types="expect-webdriverio"/>

import { List } from 'lodash'

export type Capabilities = WebDriver.Capabilities &
  WebdriverIO.MultiRemoteCapabilities &
  PerfectoCapabilities

export type Browser = WebdriverIO.BrowserObject &
  WebdriverIO.MultiRemoteBrowserObject &
  PerfectoBrowser
  
export interface PerfectoCapabilities {
  testGridReportUrl?: string
}

export interface PerfectoOptsConfig {
  perfectoOpts?: perfectoOpts
}

export interface perfectoOpts {
  /**
   * Execution Tags to optimize the reports
   */
  executionTags?: string[]
  /**
   * customFields to optimize the reports
   */
  customFields?: any

  /**
   * FailureR eason Config file location
   */
  failureReasons?: Array<Messages>

  overwriteWaitUntil?: boolean
}

export interface PerfectoServiceConfig {
  securityToken?: string
}
export interface PerfectoBrowser {
  perfectoVerify(assertFnc: any, message: string): boolean
  perfectoAssert(assertFnc: any, message: string): boolean

  perfectoStartApp(by: string, app: string): void
  perfectoCloseApp(by: string, app: string, ignoreExceptions: boolean): void
  perfectoReportAssert(message: string, status: boolean): void
  perfectoInstallApp(
    filePath: string,
    shouldInstrument: boolean,
    shouldSensorInstrument: boolean
  ): void
  perfectoCleanApp(by: string, app: string): void
  perfectoUninstallApp(by: string, app: string): void
  perfectoUninstallAllApps(): void
  perfectoGetAppInfo(property: string): string
  perfectoVerifyAppInfo(propertyName: string, propertyValue: any): void

  perfectoAssertAppInfo(propertyName: string, propertyValue: any): any
  perfectoWaitForPresentTextVisual(text: string, timeout: number): void
  perfectoWaitForPresentImageVisual(
    img: string,
    timeout: number,
    threshold: number,
    needleBound: number
  ): void

  perfectoFindImage(
    img: string,
    timeout: number,
    threshold?: number,
    needleBound?: number
  ): string

  perfectoAssertVisualImage(
    img: string,
    timeout: number,
    threshold: number,
    needleBound: number
  ): boolean
  perfectoVerifyVisualImage(
    img: string,
    timeout: number,
    threshold: number,
    needleBound: number
  ): boolean

  perfectoFindText(text: string, timeout: number): string
  // TODO: check verify options
  perfectoAssertVisualText(text: string): boolean
  perfectoVerifyVisualText(text: string): boolean

  perfectoPressKey(keySequence: string): void

  perfectoSwipe(start: string, end: string): void
  perfectoLongTouch(point: string, seconds: number): void
  perfectoTouch(point: string): void
  perfectoDoubleTouch(point: string): void
  perfectoHideKeyboard(): void
  perfectoRotateDevice(by: string | number, restValue: string): void
  perfectoSetLocation(by: string | number, location: string): void
  perfectoAssertLocation(location: string): void
  perfectoVerifyLocation(location: string): boolean
  perfectoGetDeviceLocation(): string
  perfectoResetLocation(): void
  perfectoGoToHomeScreen(): void
  perfectoLockDevice(sec: number): void
  perfectoSetTimezone(timezone: string): void
  perfectoGetTimezone(): string

  perfectoAssertTimezone(timezone: string): boolean
  perfectoVerifyTimezone(timezone: string): boolean
  perfectoResetTimezone(): void

  perfectoTakeScreenshot(repositoryPath: string, shouldSave: boolean): void
  perfectoStartImageInjection(
    repositoryFile: string,
    by: string | number,
    app: string
  ): void
  perfectoStopImageInjection(): void

  perfectoSetFingerprint(
    by: string | number,
    identifier: string,
    resultAuth: string,
    errorType: string
  ): void

  perfectoSetSensorAuthentication(
    by: string,
    identifier: string,
    resultAuth: string,
    errorType: string
  ): void

  perfectoGenerateHAR(): void
  perfectoStopGenerateHAR(): void
  perfectoAudioInject(filePath: string): void

  perfectoVerifyAudioReceived(): void
  perfectoGetDeviceProperty(property: string): string
  // perfectoTouchObject(selector: string, addressBar: string): void;
  // perfectoSlideObjectLeft(selector: string) : void;

  // perfectoSlideObject(selector: string, xStartMult: number, xEndMult: number, yStartMult: number, yEndMult: number) : void;
  // perfectoGetScale() : number;
  // perfectoGetOffset(addressBar: string, context? : string) : number;
  // perfectoSetPickerWheel(locator: string, direction: any, value: { replaceAll: (arg0: string, arg1: string) => any }, offset: number): void;
  // perfectoPickerwheelGet(locator: string) : any;
  // perfectoPickerwheelStep(locator: string , direction: any, offset: number) : void;

  reportingClient?: any
}

export interface Messages {
  StackTraceErrors: List<string>
  CustomFields: List<string>
  Tags: List<string>
  CustomError: string
  JsonFile: string
}
