import chai from 'chai'
const assert = chai.assert
/**
 * The class PerfectoDeviceSteps provides methods for working with a device,
 * with cucumber steps annotations.
 * <p>
 * Example: Working with a device.
 *
 * <pre>
 * Scenario:
 * Given I go to the device home screen
 * Then I open browser to webpage "https://community.perfectomobile.com/"
 * Then I should see text "GETTING STARTED"
 * Then I take a screenshot and save to PRIVATE:dir1/dir2/name.png
 * </pre>
 *
 * @author shanil
 * @see <a href=
 *      "https://github.com/PerfectoCode/Quantum/wiki/BDD-Implementation">BDD
 *      Implementation</a>
 *
 */
module.exports = function () {
    'use strict'

    /**
     * Rotates the device to landscape mode.
     */
    this.Then(/^I rotate the device to landscape$/, function () {
        browser.perfRotateDevice('landscape', 'state')
    })

    /**
     * Rotates the device to portrait mode.
     */
    this.Then(/^I rotate the device to portrait$/, function () {
        browser.perfRotateDevice('portrait', 'state')
    })

    /**
     * Rotates the device to its next state.
     */
    this.Then(/^I rotate the device$/, function () {
        browser.perfRotateDevice('next', 'operation')
    })

    /**
     * Sets the device location using latitude,longitude coordinates (decimal
     * degrees) format. This enables testing a location-aware app that uses Location
     * Services, without moving the device from place to place to generate location
     * data.
     * <p>
     * Confirm that the "Allow mock locations" setting is enabled. Go to: Settings,
     * Developer options, Allow mock locations.
     * <p>
     * Example: 43.642659,-79.387050
     *
     * @param coordinates
     *            the location coordinates to set
     */
    this.Then(/^I set the device location to the coordinates "([^"]*)"$/, function (coordinates) {
        browser.perfSetLocation(coordinates, 'coordinates')
    })

    /**
     * Sets the device location using address (Google Geocoding) format. This
     * enables testing a location-aware app that uses Location Services, without
     * moving the device from place to place to generate location data.
     * <p>
     * Confirm that the "Allow mock locations" setting is enabled. Go to: Settings,
     * Developer options, Allow mock locations.
     * <p>
     * Example: 1600 Amphitheatre Parkway, Mountain View, CA
     *
     * @param address
     *            the location address to set
     */
    this.Then(/^I set the device location to the address "([^"]*)"$/, function (address) {
        browser.perfSetLocation(address, 'address')
    })
    /**
     * Checks the device location using latitude,longitude coordinates (decimal
     * degrees) format. Stops the test in case of failure.
     * <p>
     * Example: 43.642659,-79.387050
     *
     * @param coordinates
     *            the location coordinates to check
     */
    this.Then(/^The device coordinates must be "([^"]*)"$/, function (coordinates) {
        browser.perfAssertLocation(coordinates)
    })

    /**
     * Verifies the device location using latitude,longitude coordinates (decimal
     * degrees) format. The test will continue to run in case of failure.
     * <p>
     * Example: 43.642659,-79.387050
     *
     * @param coordinates
     *            the location coordinates to verify
     * @return <code>true</code> if the location is verified, <code>false</code>
     *         otherwise
     */
    this.Then(/^The device coordinates should be "([^"]*)"$/, function (coordinates) {
        browser.perfVerifyLocation(coordinates)
    })

    /**
     * Resets the device location. This command should be used after the setting the
     * location to stop setting the device location.
     * <p>
     * This operation returns the device to its current location.
     */
    this.Then(/^I reset the device location$/, function () {
        browser.perfResetLocation()
    })

    /**
     * Brings the device to its idle / home screen. This is done by navigating the
     * device back to the home screen.
     * <p>
     * For iOS and Android devices, the device is unlocked and returned to its
     * default rotate orientation.
     * <p>
     * Use this command at the beginning of a script, to ensure a known starting
     * point for the user.
     */
    this.Then(/^I go to the device home screen$/, function () {
        browser.perfGoToHomeScreen()
    })

    /**
     * Performs the swipe gesture to the left.
     */
    this.Then(/^I swipe left$/, function () {
        browser.perfSwipe('60%,50%', '10%,50%')
    })

    /**
     * Performs the swipe gesture to the right.
     */
    this.Then(/^I swipe right$/, function () {
        browser.perfSwipe('40%,50%', '90%,50%')
    })

    /**
     * Performs the scroll up gesture.
     */
    this.Then(/^I scroll up$/, function () {
        browser.perfSwipe('50%,40%', '50%,60%')
    })

    /**
     * Performs the scroll down gesture.
     */
    this.Then(/^I scroll down$/, function () {
        browser.perfSwipe('50%,60%', '50%,40%')
    })

    /**
     * Locks the device screen for the duration set in seconds, and unlocks the
     * device.
     *
     * @param seconds
     *            the lock screen duration
     */
    this.Then(/^I lock the device for "([^"]*)" seconds$/, function (seconds) {
        browser.lockDevice(seconds)
    })

    /**
     * Sets the device timezone.
     *
     * @param timezone
     *            the new timezone Id
     */
    this.Then(/^I set timezone to "([^"]*)"$/, function (timezone) {
        browser.perfSetTimezone(timezone)
    })

    /**
     * Checks the device timezone. Stops the test in case of failure.
     *
     * @param timezone
     *            the new timezone Id to check
     */
    this.Then(/^The device timezone must be "([^"]*)"$/, function (timezone) {
        console.log('he device timezone must be  ')
        browser.assertTimezone(timezone)
    })

    /**
     * Verifies the device timezone. The test will continue to run in case of
     * failure.
     *
     * @param timezone
     *            the timezone Id to verify
     * @return <code>true</code> if the timezone is verified, <code>false</code>
     *         otherwise
     */
    this.Then(/^The device timezone should be "([^"]*)"$/, function (timezone) {
        console.log('he device timezone should be  ')
        return browser.perfVerifyTimezone(timezone)
    })

    /**
     * Resets the device timezone Id to the default.
     */
    this.Then(/^I reset the device timezone$/, function () {
        return browser.perfResetTimezone()
    })

    /**
     * Gets a digital screenshot of the current screen display, and places it in the
     * report.
     */
    this.Then(/^I take a screenshot$/, function () {
        return browser.takeScreenshot()
    })

    /**
     * Gets a digital screenshot of the current screen display, and saves it to the
     * repository.
     *
     * @param repositoryPath
     *            the full repository path, including directory and file name, where
     *            to save the file. Example - PRIVATE:dir1/dir2/name.png
     */
    this.Then(/^I take a screenshot and save to "([^"]*)"$/, function (repositoryPath) {
        return browser.takeScreenshot(repositoryPath, true)
    })

    /**
     * Hides the virtual keyboard display.
     */
    this.Then(/^I hide keyboard$/, function () {
        return browser.hideKeyboard()
    })

    this.Then(/^I press mobile "([^"]*)" key$/, function (keySequence) {
        return browser.pressKey(keySequence)
    })

    /**
     * Performs the touch gesture according to the point coordinates.
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended) for example 50%,50%.
     */
    this.Then(/^I touch on "([^"]*)" point$/, function (point) {
        return browser.touch(point)
    })

    /**
     * Performs the double touch gesture according to the point coordinates.
     *
     * @param point
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended) for example 50%,50%.
     */
    this.Then(/^I double click on "([^"]*)" point$/, function (point) {
        return browser.doubleTouch(point)
    })

    /**
     * Performs the double touch gesture according to the point coordinates.
     *
     * @param locator
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended) for example 50%,50%.
     */
    this.Then(/^I double click on "([^"]*)"$/, function (locator) {
        let myElement = $(locator)

        let location = myElement.getLocation()
        let size = myElement.size

        // determine location to click and convert to an appropriate string
        let xToClick = location.getX() + (size.getWidth() / 2)
        let yToClick = location.getY() + (size.getHeight() / 2)
        let clickLocation = xToClick + ',' + yToClick

        browser.perfDoubleTouch(clickLocation)
    })

    /**
     * Performs the lo touch gesture according to the point coordinates.
     *
     * @param locator
     *            write in format of x,y. can be in pixels or
     *            percentage(recommended) for example 50%,50%.
     */
    this.Then(/^I tap on "([^"]*)" for "([^"]*)" seconds$/, function (locator, seconds) {
        let myElement = $(locator)

        let location = myElement.getLocation()
        let size = myElement.size

        // determine location to click and convert to an appropriate string
        let xToClick = location.getX() + (size.getWidth() / 2)
        let yToClick = location.getY() + (size.getHeight() / 2)
        let clickLocation = xToClick + ',' + yToClick

        browser.perfLongTouch(clickLocation, seconds)
    })

    /**
     * Generate Har file. The HAR file will be included in the Reporting artifacts
     * for the automation report.
     *
     */
    this.Then(/^Start generate Har file$/, function () {
        browser.perfGenerateHAR()
    })

    /**
     * Stop generatimg Har file.
     *
     */
    this.Then(/^Stop generate Har file$/, function () {
        browser.perfStopGenerateHAR()
    })

    /**
     * Add Comment to Report
     *
     */
    this.Then(/^Add report comment "([^"]*)"$/, function (comment) {
        browser.perfReportComment(comment)
    })

    /**
     * Picks the previous value of the specific pickerwheel
     * @param locator - The pickerwheel element must be this specific
     * type ("XCUIElementTypePickerWheel"), not “XCUIElementTypePicker”
     * or any other parent/child of the pickerwheel.
     */
    this.Then(/^I validate "([^"]*)" has the value "([^"]*)"$/, function (locator, value) {
        assert.equals($(locator).getAttribute('value'), value, `The value did not match`)

        // Assert.assertEquals(new QAFExtendedWebElement(locator).getAttribute("value").replaceAll("[^\\x00-\\x7F]", ""), value.replaceAll("[^\\x00-\\x7F]", ""),"The value did not match.");
    })
}
