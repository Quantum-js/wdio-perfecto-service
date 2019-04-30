import Reporting from 'perfecto-reporting'
import _ from 'lodash'
import chai from 'chai'
import Integer from 'integer'

// const expect = chai.expect
const assert = chai.assert
// const should = chai.should()

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
        browser.failed = 0
        browser.failMessage = ''
        browser.featureTags = []
        browser.scenarioTags = []

        // browser.timeouts('implicit', browser.options.implicitTimeout)

        /**
         * update browser commands
         */
        // recommended to use  instead of setValue
        browser.addCommand('setValueImmediate', function (selector, value) {
            let elemId = $(selector).value.ELEMENT
            browser.setImmediateValue(elemId, value)
        })
        browser._waitForVisible = browser.waitForVisible
        browser.waitForVisible = function (selector, ms, reverse) {
            reverse = typeof reverse === 'boolean' ? reverse : false
            /*!
             * ensure that ms is set properly
             */
            if (typeof ms !== 'number') {
                ms = this.options.waitforTimeout
            }
            const isReversed = reverse ? '' : 'not '
            const errorMsg = `element ("${selector}") still ${isReversed}visible after ${ms}ms`
            this.waitUntil(function () {
                let isVisible = $(selector).isVisible()
                return isVisible !== reverse

            }, ms, errorMsg)
        }
        browser._waitForEnabled = browser.waitForEnabled
        browser.waitForEnabled = function (selector, ms, reverse) {
            reverse = typeof reverse === 'boolean' ? reverse : false
            /*!
             * ensure that ms is set properly
             */
            if (typeof ms !== 'number') {
                ms = this.options.waitforTimeout
            }
            const isReversed = reverse ? '' : 'not '
            const errorMsg = `element ("${selector}") still ${isReversed}enabled after ${ms}ms`
            this.waitUntil(function () {
                let isEnabled = $(selector).isEnabled()
                return isEnabled !== reverse

            }, ms, errorMsg)
        }
        browser._waitForSelected = browser.waitForSelected
        browser.waitForSelected = function (selector, ms, reverse) {
            reverse = typeof reverse === 'boolean' ? reverse : false
            /*!
             * ensure that ms is set properly
             */
            if (typeof ms !== 'number') {
                ms = this.options.waitforTimeout
            }
            const isReversed = reverse ? '' : 'not '
            const errorMsg = `element ("${selector}") still ${isReversed}selected after ${ms}ms`
            this.waitUntil(function () {
                let isSelected = $(selector).isSelected()
                return isSelected !== reverse

            }, ms, errorMsg)
        }
        browser._waitForText = browser.waitForText
        browser.waitForText = function (selector, ms, reverse) {
            reverse = typeof reverse === 'boolean' ? reverse : false
            /*!
             * ensure that ms is set properly
             */
            if (typeof ms !== 'number') {
                ms = this.options.waitforTimeout
            }
            const isReversed = reverse ? '' : 'not '
            const errorMsg = `element ("${selector}") still ${isReversed}text after ${ms}ms`
            this.waitUntil(function () {
                let text = $(selector).getText()
                return (text !== '') !== reverse

            }, ms, errorMsg)
        }
        browser._waitForValue = browser.waitForValue
        browser.waitForValue = function (selector, ms, reverse) {
            reverse = typeof reverse === 'boolean' ? reverse : false
            /*!
             * ensure that ms is set properly
             */
            if (typeof ms !== 'number') {
                ms = this.options.waitforTimeout
            }
            const isReversed = reverse ? '' : 'not '
            const errorMsg = `element ("${selector}") still ${isReversed}value after ${ms}ms`
            this.waitUntil(function () {
                let value = $(selector).getValue()
                return (value !== '') !== reverse

            }, ms, errorMsg)
        }

        /**
         * add perfecto commands
         */

        /**
         * Report commands
         */
        browser.addCommand('perfVerify', function (assertFnc, message) {
            try {
                // browser.debug();
                assertFnc(message)
                // console.log('assertFnc', assertFnc)
                // console.log('message', message)

                browser.perfReportAssert(message, true)
                return true
            } catch (err) {
                console.log('verify in catch' + err.toString()) // browser.debug();

                browser.failedOnVerify++
                browser.failMessages.push(err)
                browser.perfReportAssert(err.toString(), false)
                return false
            }
        })

        browser.addCommand('perfAssert', function (assertFnc, message) {

            assertFnc(message)
            browser.perfReportAssert(message, true)
            return true
        })

        browser.addCommand('perfReportAssert', function (message, status) {
            browser.reportingClient.reportiumAssert(message, status)
        })

        browser.addCommand('perfReportComment', function (message) {
            let params = {
                text: message
            }
            browser.execute('mobile:comment', params)
        })

        /**
         * Device Utils
         */
        browser.addCommand('perfInstallApp', function (filePath, shouldInstrument, shouldSensorInstrument) {
            let params = {
                file: filePath
            }
            if (shouldInstrument) {
                params.instrument = 'instrument'
            }
            if (shouldSensorInstrument) {
                params.sensorInstrument = 'sensor'
            }
            browser.execute('mobile:application:install', params)
        })

        browser.addCommand('perfStartApp', function (app, by) {
            browser.execute('mobile:application:open', getAppParams(app, by))
        })
        // by = 'name' or 'identifier'
        browser.addCommand('perfCloseApp', function (app, by, ignoreExceptions = false) {
            try {
                browser.execute('mobile:application:close', getAppParams(app, by))
            } catch (err) {
                if (!ignoreExceptions) {
                    throw err
                }
            }
        })
        // by = 'name' or 'identifier'
        browser.addCommand('perfCleanApp', function (app, by) {
            browser.execute('mobile:application:clean', getAppParams(app, by))
        })
        // by = 'name' or 'identifier'
        browser.addCommand('perfUninstallApp', function (app, by) {
            browser.execute('mobile:application:uninstall', getAppParams(app, by))
        })
        browser.addCommand('perfUninstallAllApps', function () {
            browser.execute('mobile:application:reset', {})
        })
        browser.addCommand('perfGetAppInfo', function (property) {
            let params = {
                property: property
            }
            return browser.execute('mobile:application:info', params).value
        })

        browser.addCommand('perfVerifyAppInfo', function (propertyName, propertyValue) {
            let message = `${propertyName} should be ${propertyValue}`
            let assertMethod = () => assert.equal(propertyValue, browser.perfGetAppInfo(propertyName), message)
            return browser.perfVerify(assertMethod, message)
        })
        browser.addCommand('perfAssertAppInfo', function (propertyName, propertyValue) {
            let message = `${propertyName} must be ${propertyValue}`
            let assertMethod = () => assert.equal(propertyValue, browser.perfGetAppInfo(propertyName), message)
            return browser.perfAssert(assertMethod, message)
        })
        browser.addCommand('perfWaitForPresentTextVisual', function (text, seconds) {
            assert.equal(browser.perfFindText(text, seconds), 'true', `Text: ${text} should be present after ${seconds} seconds`)
        })
        browser.addCommand('perfWaitForPresentImageVisual', function (img, seconds, threshold = 90, needleBound = 25) {
            assert.equal(browser.perfFindImage(img, seconds, threshold, needleBound), 'true', `Image: ${img} should be visible after ${seconds} seconds`)
        })
        // pass external parameters
        // TODO : test vars
        browser.addCommand('perfFindImage', function (img, timeout, threshold = 90, needleBound = 25) {

            let params = {
                content: img,
                measurement: 'accurate',
                source: 'primary',
                threshold: threshold,
                timeout: timeout,
                match: 'bounded'
            }

            params['imageBounds.needleBound'] = needleBound

            let result = browser.execute('mobile:checkpoint:image', params)
            return result.value
        })
        // TODO: check passing seconds 60, 180 - getting threading errors
        browser.addCommand('perfAssertVisualImage', function (img, seconds, threshold = 90, needleBound = 25) {
            let message = `Image: ${img} must be visible after ${seconds} seconds`
            let assertMethod = () => assert.equal(browser.perfFindImage(img, seconds, threshold, needleBound), 'true', message)
            return browser.perfAssert(assertMethod, message)
        })
        browser.addCommand('perfVerifyVisualImage', function (img, seconds, threshold = 90, needleBound = 25) {
            let message = `Image: ${img} must be visible after ${seconds} seconds`
            let assertMethod = () => assert.equal(browser.perfFindImage(img, seconds, threshold, needleBound), 'true', message)
            return browser.perfAssert(assertMethod, message)
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
        browser.addCommand('perfFindText', function (text, timeout) {
            let params = {
                content: text,
                threshold: '100'
            }

            if (!_.isEmpty(timeout)) {
                params.timeout = timeout
            }
            return browser.execute('mobile:checkpoint:text', params).value
        })
        // TODO: check verify options
        browser.addCommand('perfAssertVisualText', function (text) {
            let message = `Text: ${text} must be present`
            let assertMethod = () => assert.equal(browser.perfFindText(text, 180), 'true', message)
            return browser.perfAssert(assertMethod, message)
        })
        browser.addCommand('perfVerifyVisualText', function (text) {
            let message = `Text: ${text} should be present`
            let assertMethod = () => assert.equal(browser.perfFindText(text, 180), 'true', message)
            return browser.perfVerify(assertMethod, message)
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
        browser.addCommand('perfPressKey', function (keySequence) {
            let params = {
                keySequence: keySequence
            }
            browser.execute('mobile:presskey', params)
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
        browser.addCommand('perfSwipe', function (start, end) {
            let params = {
                start: start,
                end: end
            }
            browser.execute('mobile:touch:swipe', params)
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
        browser.addCommand('perfLongTouch', function (point, seconds = 2) {
            let params = {
                location: point,
                operation: 'single',
                duration: seconds
            }
            browser.execute('mobile:touch:tap', params)
        })

        /**
         * Performs the touch gesture according to the point coordinates.
         *
         * @param point
         *            write in format of x,y. can be in pixels or
         *            percentage(recommended).
         */
        browser.addCommand('perfTouch', function (point) {
            let params = {
                location: point // 50%,50%
            }

            browser.execute('mobile:touch:tap', params)
        })

        /**
         * Performs the double touch gesture according to the point coordinates.
         *
         * @param point
         *            write in format of x,y. can be in pixels or
         *            percentage(recommended).
         */
        browser.addCommand('perfDoubleTouch', function (point) {
            let params = {
                location: point, // 50%,50%
                operation: 'double'
            }
            browser.execute('mobile:touch:tap', params)
        })

        /**
         * Hides the virtual keyboard display.
         *
         */
        browser.addCommand('perfHideKeyboard', function () {
            let params = {
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
        browser.addCommand('perfRotateDevice', function (restValue, by) {
            let params = {}
            params[by] = restValue
            browser.execute('mobile:handset:rotate', params)
        })

        // by = 'address' or 'coordinates'
        browser.addCommand('perfSetLocation', function (location, by) {
            let params = {}
            params[by] = location

            browser.execute('mobile:location:set', params)
        })

        browser.addCommand('perfAssertLocation', function (location) {
            let deviceLocation = browser.perfGetDeviceLocation()
            let message = `Device Location ${deviceLocation.toString()} must be equal ${location}`
            let assertMethod = () => assert.equal(deviceLocation, location, message)
            return browser.perfAssert(assertMethod, message)
        })

        browser.addCommand('perfVerifyLocation', function (location) {
            let deviceLocation = this.perfGetDeviceLocation()
            let message = `Device Location ${deviceLocation.toString()} should be equal ${location}`
            let assertMethod = () => assert.equal(deviceLocation, location, message)
            return browser.perfVerify(assertMethod, message)
        })

        browser.addCommand('perfGetDeviceLocation', function () {
            return browser.execute('mobile:location:get', {}).value
        })

        browser.addCommand('perfResetLocation', function () {
            browser.execute('mobile:location:reset', {})
        })

        browser.addCommand('perfGoToHomeScreen', function () {
            let params = {
                target: 'All'
            }
            browser.execute('mobile:handset:ready', params)
        })

        browser.addCommand('perfLockDevice', function (sec) {
            let params = {
                timeout: sec
            }
            browser.execute('mobile:screen:lock', params)
        })

        browser.addCommand('perfSetTimezone', function (timezone) {
            let params = {
                timezone: timezone
            }

            browser.execute('mobile:timezone:set', params)
        })

        browser.addCommand('perfGetTimezone', function () {
            return browser.execute('mobile:timezone:get', {}).value
        })

        browser.addCommand('perfAssertTimezone', function (timezone) {
            let deviceTimezone = browser.perfGetTimezone()
            let message = `Device timezone ${deviceTimezone} must be equal ${timezone}`
            let assertMethod = () => assert.equal(deviceTimezone, timezone, message)
            return browser.perfAssert(assertMethod, message)
        })

        browser.addCommand('perfVerifyTimezone', function (timezone) {
            let deviceTimezone = browser.perfGetTimezone()
            let message = `Device timezone ${deviceTimezone} should be equal ${timezone}`
            let assertMethod = () => assert.equal(deviceTimezone, timezone, message)
            return browser.perfVerify(assertMethod, message)
        })

        browser.addCommand('perfResetTimezone', function () {
            browser.execute('mobile:timezone:reset', {})
        })

        browser.addCommand('perfTakeScreenshot', function (repositoryPath, shouldSave) {
            let params = {}
            if (shouldSave) {
                params.key = repositoryPath
            }
            browser.execute('mobile:screen:image', params)
        })

        // by = 'name' or 'identifier'
        browser.addCommand('perfStartImageInjection', function (repositoryFile, app, by) {
            let params = {}
            params.repositoryFile = repositoryFile
            params[by] = app
            browser.execute('mobile:image.injection:start', params)
        })
        browser.addCommand('perfStopImageInjection', function () {
            browser.execute('mobile:image.injection:stop', {})
        })

        browser.addCommand('perfSetFingerprint', function (by, identifier, resultAuth, errorType) {
            let params = {}
            params[by] = identifier
            params.resultAuth = resultAuth

            if (!_.isEmpty(errorType)) {
                params.errorType = errorType
            }

            browser.execute('mobile:fingerprint:set', params)
        })

        browser.addCommand('perfSetSensorAuthentication', function (by, identifier, resultAuth, errorType) {
            let params = {}
            params[by] = identifier
            params.resultAuth = resultAuth
            params.errorType = errorType

            browser.execute('mobile:sensorAuthentication:set', params)
        })

        browser.addCommand('perfGenerateHAR', function () {
            let params = {
                generateHarFile: 'true'
            }
            browser.execute('mobile:vnetwork:start', params)
        })

        browser.addCommand('perfStopGenerateHAR', function () {
            browser.execute('mobile:vnetwork:stop', {})
        })

        browser.addCommand('perfAudioInject', function (filePath) {
            let params = {
                key: filePath,
                wait: 'nowait'
            }
            browser.execute('mobile:audio:inject', params)
        })

        browser.addCommand('perfVerifyAudioReceived', function () {
            // The below settings have been working with best and consistent results for
            // different devices. In case these settings does not work for you then try
            // changing the configurations.
            let params = {
                volume: -100,
                duration: 1,
                timeout: 45
            }

            let audioCheckpointStatus = browser.execute('mobile:checkpoint:audio', params)
            browser.perfReportAssert('Audio checkpoint status ', audioCheckpointStatus)
        })

        browser.addCommand('perfGetDeviceProperty', function (property) {
            let params = {
                property: property
            }
            return browser.execute('mobile:handset:info', params).value
        })
        /**
         * This function will calculate the location of the element on the device and
         * manually tap the point location of the middle of the element. This function
         * accounts that there may be a header to offset from.
         *
         * @param selector
         *            - selector to find the element to be clicked
         * @param addressBar
         *            - navigation bar that takes up the top half of the device outside
         *            of the webview
         */
        browser.addCommand('perfTouchObject', function (selector, addressBar) {
            let bannerY = browser.perfGetOffset(addressBar)
            let scaleFactor = browser.perfGetScale()
            // Gets the rectangle of the element we want to click
            let rect = browser.getElementRect(browser.getElement(selector))

            // calculates the middle x value using the rectangle and multiplying the scale
            let x = (rect.getX() + (rect.getWidth() / 2)) * scaleFactor
            // calculates the middle y value using the rectangle, adding the offset
            // and multiplying the scale
            let y = (rect.getY() + (rect.getHeight() / 2) + bannerY) * scaleFactor
            // Touch the device at the point calculated
            browser.touch(x + ',' + y)
        })

        /**
         * Slides the provided object to the left
         *
         * @param selector
         *            object to slide
         */
        browser.addCommand('perfSlideObjectLeft', function (selector) {
            // uses 0.5 to get the middle of the Y
            let y = 0.5
            // Since we are sliding left, we want to start on the right side of the element
            // and end on the left side
            let startX = (2.0 / 3.0)
            let endX = (1.0 / 3.0)
            // This calls the slide object using the constant values we set for
            // the default left slide
            browser.slideObject(selector, startX, endX, y)
        })

        /**
         *
         * Slides the provided object
         *
         * @param selector
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
        browser.addCommand('perfSlideObject', function (selector, xStartMult, xEndMult, yStartMult, yEndMult = yStartMult) {
            // Gets the current scale of the device
            let scaleFactor = browser.perfGetScale()
            // Gets the rectangle of the object to use the x,y and width, height
            let rect = browser.getElementRect(browser.getElement(selector))
            // Gets point to start y
            let startY = Math.round(((rect.getY() + (rect.getHeight() * yStartMult))) * scaleFactor)
            // Gets point to stop y
            let endY = Math.round((rect.getY() + (rect.getHeight() * yEndMult)) * scaleFactor)
            // Gets the point to start x
            let startX = Math.round((rect.getX() + (rect.getWidth() * xStartMult)) * scaleFactor)
            // gets the point to stop y
            let endX = Math.round((rect.getX() + ((rect.getWidth()) * xEndMult)) * scaleFactor)
            // swipes using the points provided
            browser.swipe(startX + ',' + startY, endX + ',' + endY)
        })

        /**
         * Gets the current application sacale for the device
         *
         * @return integer value of scale
         */
        browser.addCommand('perfGetScale', function () {
            // Gets the resolution of the current device
            let deviceRes = browser.perfGetDeviceProperty('resolution')
            // Gets the width of the root application viewport
            let appWidth = browser.getElement('xpath=/*/*').getSize().getWidth()
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
        browser.addCommand('perfGetOffset', function (addressBar, context = 'NATIVE_APP') {
            // Stores the current context so we can switch to it at the end
            let curContext = browser.getContext()
            // Switch to native context
            browser.context(context)
            // Gets the rectangle of the welement to get the x,y and width height
            let view = browser.getElementRect(browser.getElement(addressBar))
            browser.context(curContext) // Switch back to the original context
            // this gets the application size of the area above the viewport
            // we will use this to offset the element
            return (view.getY() + view.getHeight())
        })
    }

    beforeFeature (feature) {
        console.log(`Before Feature:  ${feature.getName()}`)

        let taggs = feature.getTags().map(function (tag) {
            return tag.getName()
        })
        browser.featureTags.push(taggs)

        let customFields = browser.options.perfectoOpts.customFields
        customFields = Object.keys(customFields).map(data => new Reporting.Model.CustomField(data, customFields[data]))

        let reportingClient = new Reporting.Perfecto.PerfectoReportingClient(new Reporting.Perfecto.PerfectoExecutionContext({

            webdriver: {
                executeScript: (command, params) => { browser.execute(command, params) }
            },
            // Job method accepts a JSON list with three optional properties
            job: new Reporting.Model.Job({
                jobName: jobName,
                buildNumber: Number(jobNumber),
                branch: jobBranch
            }), // optional
            project: new Reporting.Model.Project(projectName, 'v0.1'), // optional
            tags: browser.options.perfectoOpts.executionTags,
            customFields: customFields
        }))
        browser.reportingClient = reportingClient
    }

    beforeScenario (scenario) {
        console.log(`Before Scenario:  ${scenario.getName()}`)

        browser.failed = 0
        browser.failedOnVerify = 0
        browser.failMessages = []
        browser.scenarioTags = []

        //browser.setTimeout({ 'implicit': global.IMPLICIT_TIMEOUT })

        browser.scenarioTags.push(browser.featureTags)
        let taggs = scenario.getTags().map(function (tag) {
            return tag.getName()
        })
        browser.scenarioTags = browser.scenarioTags.concat(taggs)
        let testContext = new Reporting.Perfecto.PerfectoTestContext(browser.scenarioTags.toString().split(','))
        browser.reportingClient.testStart(scenario.getName(), testContext)
    }
    beforeStep (stepResult) {
        //   console.log(`Scenario:  ${stepResult.getScenario()}`)
        console.log(`Before step:  ${stepResult.getKeyword()} ${stepResult.getName()}`)

        if (browser.failed === 0) {
            console.log("start step " + stepResult.getName())
            browser.reportingClient.stepStart(`${stepResult.getKeyword()} ${stepResult.getName()}`)
        }
    }
    beforeCommand (command, args) {
        console.log(`Issuing Command: ${command} -- Args: ${args.join(';')}`)
    }
    afterCommand (command, args, result, error) {
        console.log(' Result - Command: ' + command + '::' + ((!_.isEmpty(result) && !result) ? ('FAILURE: ' + error.message) : 'SUCCESS'))
    }
    afterStep (stepResult) {
        console.log(`After step:  ${stepResult.getStep().getKeyword()} ${stepResult.getStep().getName()}`)
        console.log(`Step Status: ${stepResult.getStatus()}`)
        console.log(`Failure Execption: ${stepResult.getFailureException()}`)
        // console.log('Failure Execption stack: ' + stepResult.getFailureException().stack);

        let isPassed = stepResult.getStatus()
        if (isPassed === 'failed') {
            browser.failed++
            browser.failMessage = stepResult.getFailureException()
            browser.failMessages.push(stepResult.getFailureException())
            browser.perfReportAssert(browser.failMessage.message, false)
        };

        if (isPassed === 'undefined') {
            browser.failed++
            browser.failMessage = {
                AssertionError: `undefined step ${stepResult.getStep().getName()}`,
                message: `undefined step ${stepResult.getStep().getName()}`
            }
            browser.failMessages.push(browser.failMessage)
            browser.reportingClient.reportiumAssert(browser.failMessage.message, false)
        };
        // if(browser.failed==0) {
        //     browser.reportingClient.stepEnd(`${stepResult.getStep().getKeyword()} ${stepResult.getStep().getName()}`);
        // }
    }
    afterScenario (scenarioResult) {
        console.debug(`After Scenario: ${scenarioResult.getName()}`)

        const context = new Reporting.Perfecto.PerfectoTestContext([])
        if (browser.failed !== 0 || browser.failedOnVerify !== 0) {
            browser.reportingClient.testStop({
                status: Reporting.Constants.results.failed,
                // message: browser.failMessage.stack
                message: (_.map(_.reverse(browser.failMessages), (el) => { return el + '\n' }).join(''))

            }, context)
        } else {
            browser.reportingClient.testStop({
                status: Reporting.Constants.results.passed
            })
        }
        browser.pause(2000)
    }

    afterFeature (feature) {
        console.debug(`After feature: ${feature.getName()}`)
        let session = browser.session()
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
