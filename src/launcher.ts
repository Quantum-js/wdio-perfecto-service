import logger from '@wdio/logger'
import { PerfectoServiceConfig } from './types'

const log = logger('wdio-perfecto-service')
export default class PerfectoLauncher {
  //private _api: SauceLabs
  //private _sauceConnectProcess?: SauceConnectInstance

  constructor(
    private _options: PerfectoServiceConfig,
    private _capabilities:
      | WebDriver.Capabilities[]
      | WebdriverIO.MultiRemoteCapabilities,
    private _config: WebdriverIO.Config
  ) {
    //this._api = new SauceLabs(this._config as unknown as SauceLabsOptions)
  }

  /**
   * modify config and launch sauce connect
   */
  onPrepare(config: WebdriverIO.Config, capabilities: WebDriver.Capabilities) {
    log.info('PerfectoLaunchService  onPrepare ')

    // this.perfectoConnectOpts = Object.assign({
    //     securityToken: config.securityToken
    // }, config.perfectoConnectOpts)

    //   const cucumberSpecs = getTaggedFeatureSpecs((config.specs as string[]), config.cucumberOpts?.tagExpression)
    //   config.specs = cucumberSpecs
    log.info('config.specs', config.specs)
    config.protocol = 'http'
    config.path = '/nexperience/perfectomobile/wd/hub'
    // config.host = 'localhost'
    //config.port = this.perfectoConnectOpts.port || 80
    config.port = config.port || 80

    // config.implicitTimeout = config.implicitTimeout || 500

    //   if (Array.isArray(capabilities)) {
    //     capabilities.forEach(capability => {
    //         capability['browserstack.local'] = true
    //     })
    // } else if (typeof capabilities === 'object') {
    //     capabilities['browserstack.local'] = true
    // } else {
    //     throw TypeError('Capabilities should be an object or Array!')
    // }
    log.info(Array.isArray(capabilities))
    if (Array.isArray(capabilities)) {
      capabilities.forEach((capability) => {
        capability.securityToken =
          capability?.securityToken || this._options.securityToken
        log.info(this._options)
        log.info(this)
      })
      //   } else {
      //       Object.keys(capabilities).forEach((browser) => {
      //         const caps :  WebDriver.DesiredCapabilities =   (capabilities as WebdriverIO.MultiRemoteCapabilities)[browser].capabilities;
      //         (capabilities as WebdriverIO.MultiRemoteCapabilities)[browser].capabilities.securityToken =  (capabilities as WebdriverIO.MultiRemoteCapabilities)[browser].capabilities.securityToken || this._options.securityToken
      //         caps.securityToken
      //     })
      //   for (const browserName of Object.keys(capabilities)) {

      //     (capabilities as WebdriverIO.MultiRemoteCapabilities)[browserName].capabilities.securityToken = this._options.securityToken

      // }
    }
  }
}
