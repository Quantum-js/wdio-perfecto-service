/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-function */
import { hasWdioSyncSupport, runFnInFiberContext } from '@wdio/utils'

const TIMEOUT_ERROR = 'timeout'
const NOOP = () => {}

/**
 * Promise-based Timer. Execute fn every tick.
 * When fn is resolved — timer will stop
 * @param {Number} delay - delay between ticks
 * @param {Number} timeout - after that time timer will stop
 * @param {Function} fn - function that returns promise. will execute every tick
 * @param {Boolean} leading - should be function invoked on start
 * @return {promise} Promise-based Timer.
 */
class NewTimer {
  private _conditionExecutedCnt = 0
  private _resolve: Function = NOOP
  private _reject: Function = NOOP

  private _startTime?: number
  private _ticks = 0
  private _lastError?: Error

  constructor(
    private _delay: number,
    private _timeout: number,
    private _fn: Function,
    private _leading = false
  ) {
    /**
     * only wrap waitUntil condition if:
     *  - wdio-sync is installed
     *  - function name is not async
     *  - we run with the wdio testrunner
     */
    if (
      hasWdioSyncSupport &&
      !_fn.name.includes('async') &&
      Boolean(global.browser)
    ) {
      this._fn = () => runFnInFiberContext(_fn)()
    }

    const retPromise = new Promise<boolean>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })

    this._start()

    return retPromise as any
  }

  private _start() {
    this._startTime = Date.now()
    if (this._leading) {
      this._tick()
    } else {
      browser.pause(this._delay)
      this._tick()
    }
  }

  private _tick() {
    const result = this._fn()

    if (typeof result.then !== 'function') {
      if (!result) {
        return this._checkCondition(new Error('return value was never truthy'))
      }

      return this._checkCondition(undefined, result)
    }

    result.then(
      (res: any) => this._checkCondition(undefined, res),
      (err: Error) => this._checkCondition(err)
    )
  }

  private _checkCondition(err?: Error, res?: any) {
    ++this._conditionExecutedCnt
    this._lastError = err

    // resolve timer only on truthy values
    if (res) {
      this._resolve(res)
      return
    }

    // autocorrect timer
    let diff = Date.now() - (this._startTime || 0) - this._ticks++ * this._delay
    let delay = Math.max(0, this._delay - diff)

    // check if we have time to one more tick
    if (this._hasTime(delay)) {
      browser.pause(delay)
      this._tick()
    } else {
      const reason = this._lastError || new Error(TIMEOUT_ERROR)
      this._reject(reason)
    }
  }

  private _hasTime(delay: number) {
    return Date.now() - (this._startTime || 0) + delay <= this._timeout
  }

  private _wasConditionExecuted() {
    return this._conditionExecutedCnt > 0
  }
}

export default NewTimer
