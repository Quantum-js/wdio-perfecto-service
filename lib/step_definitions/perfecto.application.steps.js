import chai from 'chai'

// const expect = chai.expect
const assert = chai.assert
/**
 * The class PerfectoApplicationSteps provides methods for working with applications, with cucumber steps annotations.
 * <p>
 * Contexts used for testing:
 * <ul>
 * <li><b>WEBVIEW</b> context is used to identify DOM based UI Elements.
 * <li><b>NATIVE_APP</b> context is used to identify UI Elements defined with OS-based classes.
 * <li><b>VISUAL</b> context is used to identify UI Elements with Perfecto visual analysis.
 * </ul>
 * <p>
 * Example: Working with a device.
 * <pre>
 * Scenario:
 * 	Given I go to the device home screen
 * 	Then I open browser to webpage "https://community.perfectomobile.com/"
 * 	Then I should see text "GETTING STARTED"
 * 	Then I take a screenshot and save to PRIVATE:dir1/dir2/name.png
 * </pre>
 *
 * @author shanil
 * @see <a href="https://github.com/PerfectoCode/Quantum/wiki/BDD-Implementation">BDD Implementation</a>
 * @see <a href="https://community.perfectomobile.com/series/20208/posts/1072062">Switching contexts</a>
 */

module.exports = function () {
    'use strict'

    /**
     * Opens a native application with the application name.
     *
     * @param name the application name as it is displayed on the device screen
     */

    this.Then(/^I start application by name "([^"]*)"$/, function (name) {
        browser.perfStartApp(name, 'name')
        // Change to app context after open app
        browser.perfSwitchToContext('NATIVE_APP')
    })
    /**
     * Opens a native application with the application id.
     *
     * @param id the identifier of the application
     * @see <a href="https://community.perfectomobile.com/series/21760/posts/995065">Application Identifier</a>
     */
    this.Then(/^I start application by id "([^"]*)"$/, function (id) {
        browser.perfStartApp(id, 'identifier')
        // Change to app context after open app
        browser.perfSwitchToContext('NATIVE_APP')
    })

    /**
     * Closes a native application with the applicaiton name.
     *
     * @param name the application name as it is displayed on the device screen
     */
    this.Then(/^I try to close application by name "([^"]*)"$/, function (name) {
        browser.perfCloseApp(name, 'name', true)
    })

    /**
     * Closes a native application with the applicaiton id.
     *
     * @param id the identifier of the application
     * @see <a href="https://community.perfectomobile.com/series/21760/posts/995065">Application Identifier</a>
     */
    this.Then(/^I try to close application by id "([^"]*)"$/, function (id) {
        browser.perfCloseApp(id, 'identifier')
    })

    /**
     * Closes a native application with the applicaiton name.
     *
     * @param name the application name as it is displayed on the device screen
     */
    this.Then(/^I close application by name "([^"]*)"$/, function (name) {
        browser.perfCloseApp(name, 'name')
    })

    /**
     * Closes a native application with the applicaiton id.
     *
     * @param id the identifier of the application
     * @see <a href="https://community.perfectomobile.com/series/21760/posts/995065">Application Identifier</a>
     */
    this.Then(/^I close application by id "([^"]*)"$/, function (id) {
        browser.perfCloseApp(id, 'identifier')
    })

    /**
     * Cleans the data (including cache) from any application installed on the device and brings the application back to its initial state.
     *
     * @param name the application name as it is displayed on the device screen
     */
    this.Then(/^I clean application by name "([^"]*)"$/, function (name) {
        browser.perfCleanApp(name, 'name')
    })

    /**
     * Cleans the data (including cache) from any application installed on the device and brings the application back to its initial state.
     *
     * @param id the identifier of the application
     * @see <a href="https://community.perfectomobile.com/series/21760/posts/995065">Application Identifier</a>
     */
    this.Then(/^I clean application by id "([^"]*)"$/, function (id) {
        browser.perfCleanApp(id, 'identifier')
    })

    /**
     * Removes a single application on the device.
     *
     * @param name the application name as it is displayed on the device screen
     */
    this.Then(/^I uninstall application by name "([^"]*)"$/, function (name) {
        browser.perfUninstallApplication(name, 'name')
    })

    /**
     * Removes a single application on the device.
     *
     * @param id the identifier of the application
     * @see <a href="https://community.perfectomobile.com/series/21760/posts/995065">Application Identifier</a>
     */
    this.Then(/^I uninstall application by id "([^"]*)"$/, function (id) {
        browser.perfUninstallApp(id, 'identifier')
    })

    /**
     * Installs a single application on the device.
     * <p>
     * To use, specify the local path to the application or the application repository key.
     * If the application repository key is specified, the application must first be uploaded to the Perfecto Lab repository.
     * <p>
     * To do this, log in to the Perfecto Lab interface and use the Repository manager.
     * Supported file formats include APK files for Android, IPA for iOS and COD for BlackBerry Devices.
     *
     * @param application the local or repository path, including directory and file name, where to locate the application
     */
    this.Then(/^I install application "([^"]*)"$/, function (application) {
        browser.perfInstallApp(application)
    })

    /**
     * Installs a single application on the device, with instrumentation.
     * <p>
     * To use, specify the local path to the application or the application repository key.
     * If the application repository key is specified, the application must first be uploaded to the Perfecto Lab repository.
     * <p>
     * To do this, log in to the Perfecto Lab interface and use the Repository manager.
     * Supported file formats include APK files for Android, IPA for iOS and COD for BlackBerry Devices.
     *
     * @param application the local or repository path, including directory and file name, where to locate the application
     */
    this.Then(/^I install instrumented application "([^"]*)"$/, function (application) {
        browser.perfInstallApp(application, true)
    })

    /**
     * Uninstalls all applications on the device, returning the device to its initial state. It does not affect applications pre-installed on the device.
     */
    this.Then(/^I uninstall all applications$/, function () {
        browser.perfUninstallAllApps()
    })

    /**
     * Verifies the application version. The test will continue to run in case of failure.
     *
     * @param version the application version to verify
     * @return <code>true</code> if the version is verified, <code>false</code> otherwise
     */
    this.Then(/^application version should be "([^"]*)"$/, function (version) {
        return browser.perfVerifyAppInfo('version', version)
    })

    /**
     * Checks the application version. Stops the test in case of failure.
     *
     * @param version the application version to check
     */
    this.Then(/^application version must be "([^"]*)"$/, function (version) {
        return browser.perfAssertAppInfo('version', version)
    })

    /**
     * Verifies the application orientation. The test will continue to run in case of failure.
     *
     * @param orientation the application orientation to verify, landscape or portrait
     * @return <code>true</code> if the orientation is verified, <code>false</code> otherwise
     */
    this.Then(/^application orientation should be "([^"]*)"$/, function (orientation) {
        return browser.perfVerifyAppInfo('orientation', orientation)
    })

    /**
     * Checks the application orientation. Stops the test in case of failure.
     *
     * @param orientation the application orientation to check, landscape or portrait
     */
    this.Then(/^application orientation must be "([^"]*)"$/, function (orientation) {
        return browser.perfAssertAppInfo('orientation', orientation)
    })

    /**
     * Clicks on a native or web element.
     *
     * Identify the object using the <i>Object Repository</i> or an XPath expression.
     *
     * @param locator the object identifier
     * @see <a href="https://github.com/PerfectoCode/Quantum/wiki/Object%20Repository">Object Repository</a>
     */
    this.Then(/^I click on "([^"]*)"$/, function (locator) {
        $(locator).click()
    })

    /**
     * Clear element.
     *
     * Identify the edit field object using the <i>Object Repository</i> or an XPath expression.
     *
     * @param locator the object identifier
     * @see <a href="https://github.com/PerfectoCode/Quantum/wiki/Object%20Repository">Object Repository</a>
     */
    this.Then(/^I clear "([^"]*)"$/, function (locator) {
        $(locator).clear()
    })

    /**
     * Sets the text of a application element. Use the text parameter to specify the text to set.
     *
     * Identify the edit field object using the <i>Object Repository</i> or an XPath expression.
     *
     * @param text the text to insert in the edit field
     * @param locator the object identifier
     * @see <a href="https://github.com/PerfectoCode/Quantum/wiki/Object%20Repository">Object Repository</a>
     */
    this.Then(/^I enter "([^"]*)" to "([^"]*)"$/, function (text, locator) {
        $(locator).keys(value)
    })

    /**
     * Verifies whether an element exists in the application. The test will continue to run in case of failure.
     *
     * @param locator the object identifier
     * @return <code>true</code> if the element exists, <code>false</code> otherwise
     */
    // TODO verify????
    this.Then(/^"([^"]*)" should exist$/, function (locator) {
        return $(locator).isExisting()
    })

    /**
     * Checks whether an element exists in the application. Stops the test in case of failure.
     *
     * @param locator the object identifier
     */
    this.Then(/^"([^"]*)" must exist$/, function (locator) {
        return $(locator).isExisting()
    })

    /**
     * Verifies that the text appears on the device screen, using visual analysis. The test will continue to run in case of failure.
     *
     * @param text the text to verify
     * @return <code>true</code> if the text exists, <code>false</code> otherwise
     */
    this.Then(/^I should see text "([^"]*)"$/, function (text) {
        return browser.perfVerifyVisualText(text)
    })

    /**
     * Checks that the text appears on the device screen, using visual analysis. Stops the test in case of failure.
     *
     * @param text the text to check
     */
    this.Then(/^I must see text "([^"]*)"$/, function (text) {
        return browser.perfAssertVisualText(text)
    })

    /**
     * Verifies that the image appears on the device screen, using visual analysis. The test will continue to run in case of failure.
     *
     * @param img the image to check
     */
    this.Then(/^I must see image "([^"]*)"$/, function (img) {
        return browser.perfAssertVisualImage(img)
    })

    /**
     * Checks that the image appears on the device screen, using visual analysis. Stops the test in case of failure.
     * <p>
     * To use, the image must first be uploaded to the Perfecto Lab repository.
     * <p>
     * To do this, log in to the Perfecto Lab interface and use the Repository manager.
     *
     * @param img the repository path, including directory and file name, where to locate the image
     * @see <a href="https://community.perfectomobile.com/posts/912493">Perfecto Lab Repository</a>
     */
    this.Then(/^I should see image "([^"]*)"$/, function (img) {
        return browser.perfVerifyVisualImage(img)
    })

    /**
     * Switch to context.
     *
     * @see <a href="https://community.perfectomobile.com/series/20208/posts/1072062">Switching contexts</a>
     */
    this.Then(/^I switch to "([^"]*)" context$/, function (context) {
        return browser.perfSwitchToContext(context)
    })

    /**
     * Switch to native context (NATIVE_APP).
     *
     * @see <a href="https://community.perfectomobile.com/series/20208/posts/1072062">Switching contexts</a>
     */
    this.Then(/^I switch to native context$/, function () {
        return browser.perfSwitchToContext('NATIVE_APP')
    })

    /**
     * Switch to web context (WEBVIEW).
     *
     * @see <a href="https://community.perfectomobile.com/series/20208/posts/1072062">Switching contexts</a>
     */
    this.Then(/^I switch to webview context$/, function () {
        return browser.perfSwitchToContext('WEBVIEW')
    })

    /**
     * Switch to visual context (VISUAL).
     *
     * @see <a href="https://community.perfectomobile.com/series/20208/posts/1072062">Switching contexts</a>
     */
    this.Then(/^I switch to visual context$/, function () {
        return browser.perfSwitchToContext('VISUAL')
    })

    /**
     * Waits the specified duration before performing the next script step.
     *
     * @param seconds the wait duration
     */
    // TODO - implement
    this.Then(/^I wait for "([^"]*)" seconds$/, function (seconds) {
        return browser.wait([seconds])
    })

    /**
     * Waits for the element to appear on the device screen.
     * <p>
     * Identify the element using the <i>Object Repository</i> or an XPath expression.
     *
     * @param seconds the wait duration
     * @param locator the object identifier
     */
    this.Then(/^I wait for "([^"]*)" seconds for "([^"]*)" to appear$/, function (seconds, locator) {
        return $(locator).waitForExist(seconds * 1000)
    })

    /**
     * Waits for the text to appear on the device screen, using visual analysis.
     *
     * @param seconds the wait duration
     * @param text the text to wait for to appear
     */
    this.Then(/^I wait for "([^"]*)" seconds to see the text "([^"]*)"$/, function (seconds, text) {
        return browser.perfWaitForPresentTextVisual(text, seconds)
    })

    /**
     * Waits for the image to appear on the device screen, using visual analysis.
     *
     * @param seconds the wait duration
     * @param image the image to wait for to appear
     */
    this.Then(/^I wait for "([^"]*)" seconds to see the image "([^"]*)"$/, function (seconds, image) {
        return browser.perfWaitForPresentImageVisual(image, seconds)
    })

    /**
     * Opens the browser application and browses to the specified location.
     * <p>
     * This is done with a direct native command to the device OS, and not with navigation.
     *
     * @param url the specified URL
     */
    this.Then(/^I open browser to webpage "([^"]*)"$/, function (url) {
        return browser.url(url)
    })

    /**
     * Start image injection to the device camera to application using application name.
     *
     * @param repositoryFile the image repository file location
     * @param name the application name as it is displayed on the device screen
     */
    this.Then(/^I start inject "([^"]*)" image to application name "([^"]*)"$/, function (repositoryFile, name) {
        browser.switchToContext('NATIVE_APP')
        browser.perfStartImageInjection(repositoryFile, name, 'name')
    })

    /**
     * Start image injection to the device camera to application using application name.
     *
     * @param repositoryFile the image repository file location
     * @param id the identifier of the application
     * @see <a href="https://community.perfectomobile.com/series/21760/posts/995065">Application Identifier</a>
     */
    this.Then(/^I start inject "([^"]*)" image to application id "([^"]*)"$/, function (repositoryFile, id) {
        browser.perfSwitchToContext('NATIVE_APP')
        browser.perfStartImageInjection(repositoryFile, id, 'id')
    })

    /**
     * Stop image injection.
     *
     */
    this.Then(/^I stop image injection$/, function () {
        browser.perfStopImageInjection()
    })

    /**
     * Send fingerprint with success result to application with the applicaiton id.
     *
     * @param id the identifier of the application
     */
    this.Then(/^I set fingerprint with success result to application by id "([^"]*)"$/, function (id) {
        return browser.perfSetFingerprint('identifier', id, 'success')
    })

    /**
     * Send fingerprint with success result to application with the applicaiton name.
     *
     * @param name the name of the application
     */
    this.Then(/^I set fingerprint with success result to application by name "([^"]*)"$/, function (name) {
        return browser.perfSetFingerprint('name', name, 'success')
    })

    /**
     * Send fingerprint with fail result to application with the applicaiton id.
     *
     * @param errorType indicates why the authentication failed. May be authFailed, userCancel, userFallback, systemCancel, or lockout
     * @param id the identifier of the application
     */
    this.Then(/^I set fingerprint with error type "([^"]*)" result to application by id "([^"]*)"$/, function (errorType, id) {
        browser.perfSetFingerprint('identifier', id, 'fail', errorType)
    })

    /**
     * Send fingerprint with fail result to application with the applicaiton name.
     *
     * @param errorType indicates  why the authentication failed. May be authFailed, userCancel, userFallback, systemCancel, or lockout
     * @param name the name of the application
     */
    this.Then(/^I set fingerprint with error type "([^"]*)" result to application by name "([^"]*)"$/, function (errorType, name) {
        browser.perfSetFingerprint('name', name, 'fail', errorType)
    })
    /**
     * Send fingerprint with success result to application with the applicaiton id.
     *
     * @param id the identifier of the application
     */
    this.Then(/^I set sensor authentication with success result to application by id "([^"]*)"$/, function (id) {
        return browser.perfSetSensorAuthentication('identifier', id, 'success')
    })

    /**
     * Send fingerprint with success result to application with the applicaiton name.
     *
     * @param name the name of the application
     */
    this.Then(/^I set sensor authentication with success result to application by name "([^"]*)"$/, function (name) {
        return browser.perfSetSensorAuthentication('name', name, 'success')
    })

    /**
     * Send fingerprint with fail result to application with the applicaiton id.
     *
     * @param errorType indicates why the authentication failed. May be authFailed, userCancel, userFallback, systemCancel, or lockout
     * @param id the identifier of the application
     */
    this.Then(/^I set sensor authentication with error type "([^"]*)" result to application by id "([^"]*)"$/, function (errorType, id) {
        browser.perfSetSensorAuthentication('identifier', id, 'fail', errorType)
    })
    /**
     * Send fingerprint with fail result to application with the applicaiton name.
     *
     * @param errorType indicates  why the authentication failed. May be authFailed, userCancel, userFallback, systemCancel, or lockout
     * @param name the name of the application
     */
    this.Then(/^I set sensor authentication with error type "([^"]*)" result to application by name "([^"]*)"$/, function (errorType, name) {
        browser.perfSetSensorAuthentication('name', name, 'fail', errorType)
    })

    /**
     * This step will inject an audio from the given path into the device.
     *
     * @param audioFilePath
     *            - example: PUBLIC:Audio\\play25s1.wav
     */
    this.Then(/^I inject an audio from "([^"]*)" into the device$/, function (audioFilePath) {
        browser.perfAudioInject(audioInjectParams)
    })
    this.Then(/^I set sensor authentication with error type "([^"]*)" result to application by name "([^"]*)"$/, function (errorType, name) {
        browser.perfSetSensorAuthentication('name', name, 'fail', errorType)
    })

    /**
     * This step will verify that the audio was played. Audio checkpoint will only
     * ensure that the audio was played and not the content of audio.
     */
    this.Then(/^I verify the audio is received$/, function () {
        browser.perfVerifyAudioReceived()
    })
}
