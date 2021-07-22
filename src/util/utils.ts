/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import logger from '@wdio/logger'
import { Messages } from '../types'

const log = logger('wdio-perfecto-service')

// export type Browser = WebdriverIO.BrowserObject & WebdriverIO.MultiRemoteBrowserObject;
export function parseFailureJsonFile(actualMessage: string): Messages | undefined {
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