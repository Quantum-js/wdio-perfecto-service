import Reporting from 'perfecto-reporting'
import _ from 'lodash'
import chai from 'chai'
import Integer from 'integer'

// const expect = chai.expect
const assert = chai.assert
// const should = chai.should()
const WAITFOR_TIMEOUT = 10000

const projectName = process.env.PROJECT_NAME || global.projectName || ''
const jobName = process.env.JOB_NAME || global.jobName || ''
const jobNumber = process.env.BUILD_NUMBER || global.jobNumber || 0
const jobBranch = process.env.JOB_BRANCH || global.jobBranch || ''

function getAppParams (app, by) {
    let params = {}
    params[by] = app
    return params
}

class PerfectoService {
    before () {
        require('@babel/register')
        global.browser.failed = 0
        global.browser.failMessage = ''
        global.browser.featureTags = []
        global.browser.scenarioTags = []

        /**
         * update global.browser commands
         */
        // recommended to use  instead of setValue
        global.browser.addCommand('setValueImmediate', function (locator, value) {
            let elemId = $(locator).value.ELEMENT
            global.browser.setImmediateValue(elemId, value)
        })

        global.browser.addCommand('waitUntil', function (condition, timeout = WAITFOR_TIMEOUT, timeoutMsg, interval = 1000) {
            const startTime = new Date()
            console.log('startTime' + startTime)
            const retry = (time = 0) => {
                console.log(`******  retry ${time}`)
                console.log('time' + time)
                console.log('timeout' + timeout)
                if (time < timeout) {
                    try {
                        if (!condition()) {
                            throw new Error('condition is false')
                        }
                    } catch (err) {
                        console.log('before pause')
                        this.pause(interval)
                        console.log('after pause')
                        return retry(new Date() - startTime)
                    }
                } else {
                    return false
                }
                return true
            }
            if (!retry()) {
                throw new Error(timeoutMsg)
            }
        }, true)

        // global.browser.addCommand('isExisting', function () {
        //     let returnValue = false
        //     try {
        //         const element = this
        //         returnValue = element.isExisting()
        //     } catch (error) {
        //     }
        //
        //     return returnValue
        // }, true)

        // global.browser.addCommand('waitForVisible', function (waitMs) {
        //     const waitForMethod = () => this.isVisible()
        //     waitUntil(waitForMethod, waitMs, `Element was expected to be visible`)
        // }, true)
        // global.browser.addCommand('waitForNotVisible', function (waitMs) {
        //     const waitForMethod = () => !this.isVisible()
        //     waitUntil(waitForMethod, waitMs, `Element was expected not to be visible`)
        // }, true)
        // global.browser.addCommand('waitForExisting', function (waitMs) {
        //     const waitForMethod = () => this.isExisting()
        //     waitUntil(waitForMethod, waitMs, `Element was expected to be existing`)
        // })
        // global.browser.addCommand('waitForNotExisting', function (locator, waitMs) {
        //     const waitForMethod = () => !this.isExisting()
        //     waitUntil(waitForMethod, waitMs, `Element was expected not to be visible`)
        // }, true)
        //
        // global.browser.addCommand('waitForEnabled', function (waitMs) {
        //     const waitForMethod = () => this.isEnabled()
        //     waitUntil(waitForMethod, waitMs, `Element was expected to be enabled`)
        // }, true)
        // global.browser.addCommand('waitForDisabled', function (waitMs) {
        //     const waitForMethod = () => !this.isEnabled()
        //     waitUntil(waitForMethod, waitMs, `Element was expected not to be enabled`)
        // }, true)
        /**
         * add perfecto commands
         */

        /**
         * Report commands
         */
        global.browser.addCommand('perfReportVerify', function (assertFnc) {
            try {
                // global.browser.debug();
                assertFnc()
                global.browser.perfReportAssert(assertFnc.error_message, true)
                return true
            } catch (err) {
                console.log('verify in catch' + err.toString())
                // global.browser.debug();
                global.browser.failedOnVerify++
                global.browser.failMessages.push(err)
                global.browser.perfReportAssert(err.toString(), false)
                return false
            }
        })

        global.browser.addCommand('perfReportAssert', function (message, status) {
            global.browser.reportingClient.reportiumAssert(message, status)
        })

        global.browser.addCommand('perfReportComment', function (message) {
            let params = {
                text: message
            }
            global.browser.execute('mobile:comment', params)
        })

        /**
         * Device Utils
         */
        global.browser.addCommand('perfInstallApp', function (filePath, shouldInstrument) {
            let params = {
                file: filePath
            }
            if (shouldInstrument) {
                params.instrument = 'instrument'
            }
            global.browser.execute('mobile:application:install', params)
        })

        global.browser.addCommand('prefStartApp', function (app, by) {
            global.browser.execute('mobile:application:open', this.getAppParams(app, by))
        })
        // by = 'name' or 'identifier'
        global.browser.addCommand('perfCloseApp', function (app, by, ignoreExceptions = false) {
            try {
                global.browser.execute('mobile:application:close', this.getAppParams(app, by))
            } catch (err) {
                if (!ignoreExceptions) {
                    throw err
                }
            }
        })
        // by = 'name' or 'identifier'
        global.browser.addCommand('perfCleanApp', function (app, by) {
            global.browser.execute('mobile:application:clean', getAppParams(app, by))
        })
        // by = 'name' or 'identifier'
        global.browser.addCommand('perfUninstallApp', function (app, by) {
            global.browser.execute('mobile:application:uninstall', getAppParams(app, by))
        })
        global.browser.addCommand('perfUninstallAllApps', function () {
            global.browser.execute('mobile:application:reset', {})
        })
        global.browser.addCommand('perfGetApplicationInfo', function (property) {
            let params = {
                property: property
            }
            return global.browser.execute('mobile:application:info', params).value
        })

        global.browser.addCommand('perfVerifyAppInfo', function (propertyName, propertyValue) {
            let assertMethod = () => assert.equal(propertyValue, global.browser.perfGetAppInfo(propertyName), `${propertyName} should be ${propertyValue}`)
            return global.browser.verify(assertMethod)
        })
        global.browser.addCommand('perfAssertAppInfo', function (propertyName, propertyValue) {
            assert.equal(propertyValue, global.browser.perfGetAppInfo(propertyName), `${propertyName} must be ${propertyValue}`)
        })
        global.browser.addCommand('perfWaitForPresentTextVisual', function (text, seconds) {
            assert.equal(global.browser.perfFindText(text, seconds), 'true', `Text: ${text} should be present after ${seconds} seconds`)
        })
        global.browser.addCommand('perfWaitForPresentImageVisual', function (img, seconds) {
            assert.equal(global.browser.perfFindImage(img, seconds), 'true', `Image: ${img} should be visible after ${seconds} seconds`)
        })
        global.browser.addCommand('perfFindImage', function (img, timeout) {
            let context = global.browser.getContext()
            global.browser.switchToContext('VISUAL')
            let params = {
                content: img,
                measurement: 'accurate',
                source: 'primary',
                threshold: '90',
                timeout: timeout,
                match: 'bounded'
            }
            params['imageBounds.needleBound'] = 25

            let result = global.browser.execute('mobile:checkpoint:image', params)
            global.browser.switchToContext(context)
            return result.toString()
        })
        global.browser.addCommand('perfAssertVisualImage', function (img, seconds = 180) {
            return assert.equal(global.browser.perfFindImage(img, seconds), true, `Image: ${img} must be visible after ${seconds} seconds`)
        })
        global.browser.addCommand('perfVerifyVisualImage', function (img) {
            let assertMethod = () => assert.equal(global.browser.perfFindImage(img, 180), true, `Image: ${img} should be visible`)
            return global.browser.verify(assertMethod)
        })
        /**
         * Visual Text Checkpoint based on the text sent in and a threshold of 100
         *
         * @param text
         *            - Text to compare
         * @param timeout
         *            - timeout amount to search
         * @return true if found or false if not found
         */
        global.browser.addCommand('perfFindText', function (text, timeout) {
            let params = {
                content: text,
                threshold: '100'
            }

            if (!_.isEmpty(timeout)) {
                params.timeout = timeout
            }
            return global.browser.execute('mobile:checkpoint:text', params).value
        })
        // TODO: check verify options
        global.browser.addCommand('perfAssertVisualText', function (text) {
            return assert.equal(global.browser.perfFindText(text, 180), true, `Text: ${text} should be present`)
        })
        global.browser.addCommand('perfVerifyVisualText', function (text) {
            let assertMethod = () => assert.equal(global.browser.perfFindText(text, 180), true, `Text: ${text} should be visible`)
            return global.browser.verify(assertMethod)
        })

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
        global.browser.addCommand('perfPressKey', function (keySequence) {
            let params = {
                keySequence: keySequence
            }
            global.browser.execute('mobile:presskey', params)
        })

        /**
         * Performs the swipe gesture according to the start and end coordinates.
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
        global.browser.addCommand('perfSwipe', function (start, end) {
            let params = {
                start: start,
                end: end
            }
            global.browser.execute('mobile:touch:swipe', params)
        })

        /**
         * Performs the tap gesture according to location coordinates with durations in
         * seconds.
         * <p>
         *
         * @param point
         *            write in format of x,y. can be in pixels or
         *            percentage(recommended).
         *
         * @param seconds
         *            The duration, in seconds, for performing the touch operation.
         */
        global.browser.addCommand('perfLongTouch', function (point, seconds = 2) {
            let params = {
                location: point,
                operation: 'single',
                duration: seconds
            }
            global.browser.execute('mobile:touch:tap', params)
        })

        /**
         * Performs the touch gesture according to the point coordinates.
         *
         * @param point
         *            write in format of x,y. can be in pixels or
         *            percentage(recommended).
         */
        global.browser.addCommand('perfTouch', function (point) {
            let params = {
                location: point // 50%,50%
            }

            global.browser.execute('mobile:touch:tap', params)
        })

        /**
         * Performs the double touch gesture according to the point coordinates.
         *
         * @param point
         *            write in format of x,y. can be in pixels or
         *            percentage(recommended).
         */
        global.browser.addCommand('perfDoubleTouch', function (point) {
            let params = {
                location: point, // 50%,50%
                operation: 'double'
            }
            global.browser.execute('mobile:touch:tap', params)
        })

        /**
         * Hides the virtual keyboard display.
         *
         */
        global.browser.addCommand('perfHideKeyboard', function () {
            let params = {
                mode: 'off'
            }
            global.browser.execute('mobile:keyboard:display', params)
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
        global.browser.addCommand('perfRotateDevice', function (restValue, by) {
            let params = {}
            params[by] = restValue
            global.browser.execute('mobile:handset:rotate', params)
        })

        // by = 'address' or 'coordinates'
        global.browser.addCommand('perfSetLocation', function (location, by) {
            let params = {}
            params[by] = location

            global.browser.execute('mobile:location:set', params)
        })

        global.browser.addCommand('perfAssertLocation', function (location) {
            let deviceLocation = global.browser.perfGetDeviceLocation()
            return assert.equal(deviceLocation, location, `Device Location ${deviceLocation.toString()} is not equal ${location}`)
        })

        global.browser.addCommand('perfVerifyLocation', function (location) {
            let deviceLocation = this.perfGetDeviceLocation()
            let assertMethod = () => assert.equal(deviceLocation, location, `Device Location ${deviceLocation.toString()} is not equal ${location}`)
            return this.verify(assertMethod)
        })

        global.browser.addCommand('perfGetDeviceLocation', function () {
            return global.browser.execute('mobile:location:get', {}).value
        })

        global.browser.addCommand('perfResetLocation', function () {
            global.browser.execute('mobile:location:reset', {})
        })

        global.browser.addCommand('perfGoToHomeScreen', function () {
            let params = {
                target: 'All'
            }
            global.browser.execute('mobile:handset:ready', params)
        })

        global.browser.addCommand('perfLockDevice', function (sec) {
            let params = {
                timeout: sec
            }
            global.browser.execute('mobile:screen:lock', params)
        })

        global.browser.addCommand('perfSetTimezone', function (timezone) {
            let params = {
                timezone: timezone
            }

            global.browser.execute('mobile:timezone:set', params)
        })

        global.browser.addCommand('perfGetTimezone', function () {
            return global.browser.execute('mobile:timezone:get', {}).value
        })

        global.browser.addCommand('perfAssertTimezone', function (timezone) {
            let deviceTimezone = global.browser.perfGetTimezone()
            global.browser.deviceTimezone = deviceTimezone
            return assert.equal(deviceTimezone, timezone, `Device timezone ${deviceTimezone} is not equal ${timezone}`)
        })

        global.browser.addCommand('perfVerifyTimezone', function (timezone) {
            let deviceTimezone = this.perfGetTimezone()
            let assertMethod = () => assert.equal(deviceTimezone, timezone, `Device Location ${deviceTimezone} should be equal to ${timezone}`)
            return global.browser.perfReportVerify(assertMethod)
        })

        global.browser.addCommand('perfResetTimezone', function () {
            global.browser.execute('mobile:timezone:reset', {})
        })

        global.browser.addCommand('perfTakeScreenshot', function (repositoryPath, shouldSave) {
            let params = {}
            if (shouldSave) {
                params.key = repositoryPath
            }
            global.browser.execute('mobile:screen:image', params)
        })

        // by = 'name' or 'identifier'
        global.browser.addCommand('perfStartImageInjection', function (repositoryFile, app, by) {
            let params = {}
            params.repositoryFile = repositoryFile
            params[by] = app
            global.browser.execute('mobile:image.injection:start', params)
        })
        global.browser.addCommand('perfStopImageInjection', function () {
            global.browser.execute('mobile:image.injection:stop', {})
        })

        global.browser.addCommand('perfSetFingerprint', function (by, identifier, resultAuth, errorType) {
            let params = {}
            params[by] = identifier
            params.resultAuth = resultAuth

            if (!_.isEmpty(errorType)) {
                params.errorType = errorType
            }

            global.browser.execute('mobile:fingerprint:set', params)
        })

        global.browser.addCommand('perfSetSensorAuthentication', function (by, identifier, resultAuth, errorType) {
            let params = {}
            params[by] = identifier
            params.resultAuth = resultAuth
            params.errorType = errorType

            global.browser.execute('mobile:sensorAuthentication:set', params)
        })

        global.browser.addCommand('perfGenerateHAR', function () {
            let params = {
                generateHarFile: 'true'
            }
            global.browser.execute('mobile:vnetwork:start', params)
        })

        global.browser.addCommand('perfStopGenerateHAR', function () {
            global.browser.execute('mobile:vnetwork:stop', {})
        })

        global.browser.addCommand('perfAudioInject', function (filePath) {
            let params = {
                key: filePath,
                wait: 'nowait'
            }
            global.browser.execute('mobile:audio:inject', params)
        })

        global.browser.addCommand('perfVerifyAudioReceived', function () {
            // The below settings have been working with best and consistent results for
            // different devices. In case these settings does not work for you then try
            // changing the configurations.
            let params = {
                volume: -100,
                duration: 1,
                timeout: 45
            }

            let audioCheckpointStatus = global.browser.execute('mobile:checkpoint:audio', params)
            global.browser.perfReportAssert('Audio checkpoint status ', audioCheckpointStatus)
        })

        global.browser.addCommand('perfGetDeviceProperty', function (property) {
            let params = {
                property: property
            }
            return global.browser.execute('mobile:handset:info', params).value
        })
        /**
         * This function will calculate the location of the element on the device and
         * manually tap the point location of the middle of the element. This function
         * accounts that there may be a header to offset from.
         *
         * @param locator
         *            - locator to find the element to be clicked
         * @param addressBar
         *            - navigation bar that takes up the top half of the device outside
         *            of the webview
         */
        global.browser.addCommand('perfTouchObject', function (locator, addressBar) {
            let bannerY = global.browser.perfGetOffset(addressBar)
            let scaleFactor = global.browser.perfGetScale()
            // Gets the rectangle of the element we want to click
            let rect = global.browser.getElementRect(global.browser.getElement(locator))

            // calculates the middle x value using the rectangle and multiplying the scale
            let x = (rect.getX() + (rect.getWidth() / 2)) * scaleFactor
            // calculates the middle y value using the rectangle, adding the offset
            // and multiplying the scale
            let y = (rect.getY() + (rect.getHeight() / 2) + bannerY) * scaleFactor
            // Touch the device at the point calculated
            global.browser.touch(x + ',' + y)
        })

        /**
         * Slides the provided object to the left
         *
         * @param locator
         *            object to slide
         */
        global.browser.addCommand('perfSlideObjectLeft', function (locator) {
            // uses 0.5 to get the middle of the Y
            let y = 0.5
            // Since we are sliding left, we want to start on the right side of the element
            // and end on the left side
            let startX = (2.0 / 3.0)
            let endX = (1.0 / 3.0)
            // This calls the slide object using the constant values we set for
            // the default left slide
            global.browser.slideObject(locator, startX, endX, y)
        })

        /**
         *
         * Slides the provided object
         *
         * @param locator
         *            object to slide
         * @param xStartMult
         *            - x point to start on
         * @param xEndMult
         *            - y point to end on
         * @param yStartMult
         *            - y point to start on
         * @param yEndMult
         *            - y point to end on
         */
        global.browser.addCommand('perfSlideObject', function (locator, xStartMult, xEndMult, yStartMult, yEndMult = yStartMult) {
            // Gets the current scale of the device
            let scaleFactor = global.browser.perfGetScale()
            // Gets the rectangle of the object to use the x,y and width, height
            let rect = global.browser.getElementRect(global.browser.getElement(locator))
            // Gets point to start y
            let startY = Math.round(((rect.getY() + (rect.getHeight() * yStartMult))) * scaleFactor)
            // Gets point to stop y
            let endY = Math.round((rect.getY() + (rect.getHeight() * yEndMult)) * scaleFactor)
            // Gets the point to start x
            let startX = Math.round((rect.getX() + (rect.getWidth() * xStartMult)) * scaleFactor)
            // gets the point to stop y
            let endX = Math.round((rect.getX() + ((rect.getWidth()) * xEndMult)) * scaleFactor)
            // swipes using the points provided
            global.browser.swipe(startX + ',' + startY, endX + ',' + endY)
        })

        /**
         * Gets the current application sacale for the device
         *
         * @return integer value of scale
         */
        global.browser.addCommand('perfGetScale', function () {
            // Gets the resolution of the current device
            let deviceRes = global.browser.perfGetDeviceProperty('resolution')
            // Gets the width of the root application viewport
            let appWidth = global.browser.getElement('xpath=/*/*').getSize().getWidth()
            // compares the resolution to the application dimensions to find out what the
            // pixel scale is
            return Math.round(Integer.parseInt(deviceRes.split('\\*')[0]) / appWidth)
        })
        /**
         * Gets the offset of the header values to offset y value of the header element
         *
         * @param addressBar
         *            - header element to measure
         * @param context
         *            - context of the element to use
         * @return the y offset of the element
         */
        global.browser.addCommand('perfGetOffset', function (addressBar, context = 'NATIVE_APP') {
            // Stores the current context so we can switch to it at the end
            let curContext = global.browser.getContext()
            // Switch to native context
            global.browser.switchToContext(context)
            // Gets the rectangle of the welement to get the x,y and width height
            let view = global.browser.getElementRect(global.browser.getElement(addressBar))
            global.browser.switchToContext(curContext) // Switch back to the original context
            // this gets the application size of the area above the viewport
            // we will use this to offset the element
            return (view.getY() + view.getHeight())
        })
    }

    beforeFeature (feature) {
        console.log('before feature')
        console.log(`Feature:  ${feature.getName()}`)

        let taggs = feature.getTags().map(function (tag) {
            return tag.getName()
        })
        global.browser.featureTags.push(taggs)

        let customFields = global.browser.options.perfectoOpts.customFields
        customFields = Object.keys(customFields).map(data => new Reporting.Model.CustomField(data, customFields[data]))

        let reportingClient = new Reporting.Perfecto.PerfectoReportingClient(new Reporting.Perfecto.PerfectoExecutionContext({

            webdriver: {
                executeScript: (command, params) => { global.browser.execute(command, params) }
            },
            // Job method accepts a JSON list with three optional properties
            job: new Reporting.Model.Job({
                jobName: jobName,
                buildNumber: Number(jobNumber),
                branch: jobBranch
            }), // optional
            project: new Reporting.Model.Project(projectName, 'v0.1'), // optional
            tags: global.browser.options.perfectoOpts.executionTags,
            customFields: customFields
        }))
        global.browser.reportingClient = reportingClient
    }

    beforeScenario (scenario) {
        browser.failed = 0
        global.browser.failedOnVerify = 0
        global.browser.failMessages = []
        global.browser.scenarioTags = []

        console.log('before scenario')
        console.log(`Scenario:  ${scenario.getName()}`)
        global.browser.scenarioTags.push(global.browser.featureTags)
        let taggs = scenario.getTags().map(function (tag) {
            return tag.getName()
        })
        global.browser.scenarioTags = global.browser.scenarioTags.concat(taggs)
        console.log(' global.browser.scenarioTags' + global.browser.scenarioTags)
        let testContext = new Reporting.Perfecto.PerfectoTestContext(global.browser.scenarioTags.toString().split(','))
        global.browser.reportingClient.testStart(scenario.getName(), testContext)
    }
    beforeStep (stepResult) {
        // console.log('before step');

        console.log(`Scenario:  ${stepResult.getScenario()}`)
        console.log(`Before:  ${stepResult.getKeyword()} ${stepResult.getName()}`)

        if (global.browser.failed === 0) {
            global.browser.reportingClient.stepStart(`${stepResult.getKeyword()} ${stepResult.getName()}`)
        }
    }
    beforeCommand (command, args) {
        console.log(`Issuing Command: ${command} -- Args: ${args.join(';')}`)
    }
    afterCommand (command, args, result, error) {
        console.log(' Result - Command: ' + command + '::' + ((!_.isEmpty(result) && !result) ? ('FAILURE: ' + error.message) : 'SUCCESS'))
    }
    afterStep (stepResult) {
        console.log('after step')
        console.log(`After:  ${stepResult.getStep().getKeyword()} ${stepResult.getStep().getName()}`)
        console.log(`Step Status: ${stepResult.getStatus()}`)
        console.log(`Failure Execption: ${stepResult.getFailureException()}`)
        // console.log('Failure Execption stack: ' + stepResult.getFailureException().stack);

        let isPassed = stepResult.getStatus()
        if (isPassed === 'failed') {
            global.browser.failed++
            global.browser.failMessage = stepResult.getFailureException()
            global.browser.failMessages.push(stepResult.getFailureException())
            global.browser.perfReportAssert(global.browser.failMessage.message, false)
        };

        if (isPassed === 'undefined') {
            global.browser.failed++
            global.browser.failMessage = {
                AssertionError: `undefined step ${stepResult.getStep().getName()}`,
                message: `undefined step ${stepResult.getStep().getName()}`
            }
            global.browser.failMessages.push(global.browser.failMessage)
            global.browser.reportingClient.reportiumAssert(global.browser.failMessage.message, false)
        };
        // if(global.browser.failed==0) {
        //     global.browser.reportingClient.stepEnd(`${stepResult.getStep().getKeyword()} ${stepResult.getStep().getName()}`);
        // }
    }
    afterScenario (scenarioResult) {
        console.log('after scenario')
        console.log(`After: ${scenarioResult.getName()}`)

        const context = new Reporting.Perfecto.PerfectoTestContext([])
        if (global.browser.failed !== 0 || global.browser.failedOnVerify !== 0) {
            global.browser.reportingClient.testStop({
                status: Reporting.Constants.results.failed,
                // message: global.browser.failMessage.stack
                message: (_.map(_.reverse(global.browser.failMessages), (el) => { return el + '\n' }).join(''))

            }, context)
        } else {
            global.browser.reportingClient.testStop({
                status: Reporting.Constants.results.passed
            })
        }
        global.browser.pause(2000)
    }

    afterFeature (feature) {
        console.log('after feature')
        console.log('wdiox after')
        let session = global.browser.session()
        let caps = JSON.parse(JSON.stringify(session)).value
        console.log('')
        console.log(`PERFECTO_REPORT_URL-->>> ${caps.testGridReportUrl}`)
        console.log('')
    }
    onComplete () {
        console.log('wdiox onComplete')
    }
    onError (error) {
        if (error.message.includes('No alert is active') === false) {
            console.log(`!Error! ${error.message}`)
        }
    }
}
module.exports = PerfectoService
