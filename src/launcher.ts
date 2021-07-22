import logger from '@wdio/logger'
import { PerfectoServiceConfig } from './types'
import type { Services, Capabilities, Options } from '@wdio/types'

const log = logger('wdio-perfecto-service')
export default class PerfectoLauncher implements Services.ServiceInstance {
  //private _api: SauceLabs
  //private _sauceConnectProcess?: SauceConnectInstance

  constructor(
    private _options: PerfectoServiceConfig,
    private _capabilities: unknown,
    private _config: Options.Testrunner
  ) {
    //this._api = new SauceLabs(this._config as unknown as SauceLabsOptions)
  }

  /**
   * modify config and launch sauce connect
   */
  onPrepare(
    config: Options.Testrunner,
    capabilities: Capabilities.RemoteCapabilities) : void {

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

    if (Array.isArray(capabilities)) {
      for (let capability of capabilities) {
          capability = capability  as any as PerfectoCapabilities
          capability.securityToken = capability?['securityToken'] || this._options.securityToken
      }
    } else {
        for (const browserName of Object.keys(capabilities)) {
            const caps = capabilities[browserName].capabilities
            caps['securityToken'] = caps?['securityToken'] || this._options.securityToken
            
    }
    // log.info(Array.isArray(capabilities))
    // if (Array.isArray(capabilities)) {
    //   capabilities.forEach((capability) => {
    //     capability.securityToken =
    //       capability?.securityToken || this._options.securityToken
    //     log.info(this._options)
    //     log.info(this)
    //   })

    }
  }
}

export interface PerfectoCapabilities extends Capabilities.DesiredCapabilities{
  /**
   * Used to record test names for jobs and make it easier to find individual tests.
   */
  securityToken? : string
  testGridReportUrl?: string
 
}
// declare global {
//   namespace Capabilities {
//     interface DesiredCapabilities extends PerfectoCapabilities {}
//   }
// }
