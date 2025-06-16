/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: animate.js
 * Description: Handles UI 'Animator' classes and 'Timer' classes.
 *
 * Author: Logan
 */

'use strict'

import { adtLen, clamp } from "./globals.js"
import { playSound } from "./sounds.js"

export const Animators = {}
export const Timers = [] // global memory

function tLen(a) { // same as adtlen but considers length of each value (meant for goals or arrays within adts)
    let result = 0

    for (let i = 0; i < adtLen(a); i++) result += a[i].length

    return result
}

export class Animator {
    // base properties
    name // string ref.
    type
    playing = false
    interval
    duration
    clearTime
    callback
    ended = false

    // frame properties
    times = -1
    timesGoal = 0
    flashing
    endSet = -1

    // tween properties
    object
    properties
    startProps = {}
    time

    // typeout properties
    textObj
    textGoals
    typeSound
    lineTarg

    // shared properties
    start

    tick() { // per each 'tick' of the animator
        if (!this.playing) return

        if (this.type.includes("frame")) { // goes from 0 - a goal number of ticks within a set time frame
            this.times++
            if (this.type == "flashframe") this.flashing = (!this.flashing)
    
            // reached our goal, end
            if (this.times >= this.timesGoal) {
                this.stop()
                return
            }
        }
        else if (this.type == "tween") { // tweens properties of a object from point A to B
            this.time = (performance.now() - this.start)

            const div = clamp((this.time / this.duration), 0, 1) // get the divisor for the tween based on the current time/progress and the duration of the tween
            for (let p in this.properties) {
                let v

                const pP = this.properties[p]
                const sP = this.startProps[p]

                v = sP + ((pP - sP) * div) // simple linear function to determine value for this tick

                this.object[p] = v // very important we don't round any results.. it will lead to glitchy effects.
            }

            // reached our goal, end
            if (this.time >= this.duration) {
                this.stop() 
                return
            }
        }
        else if (this.type == "typeout") {
            // force stop if goal(s) are missing
            if (!this.textGoals) {
                this.stop(true)
                return
            }

            if (this.times == -1) this.times = 0 // since 'this.times' is used in both frame and typeout it needs to be reset from -1 to 0 here

            const strs = this.textObj.strs
            const targGoal = this.textGoals[this.lineTarg]

            if (!targGoal) { // once again just in case we have a *specific* missing goal, force stop
                this.stop(true)
                return
            }

            if (!strs[this.lineTarg]) strs[this.lineTarg] = "" // another 'just in case', haha

            if (!strs[this.lineTarg].includes(targGoal)) {
                const ch = targGoal[this.times] // character to add

                if (!ch) {
                    this.stop(true)
                    return
                }
                else {
                    strs[this.lineTarg] += ch // add it to the string
                    if (this.typeSound && ((strs[this.lineTarg].length % 2) == 0)) playSound(this.typeSound, true) // play sound if we have one
                    this.times++
                }

            }
            else { // move to next line
                this.lineTarg++
                this.times = 0

                if (this.lineTarg >= adtLen(this.textGoals)) this.stop() // reached our goal, end
            }
        }
    }

    play(customInt) { // start the animator
        if (this.playing) {
            if (this.type == "typeout") {
                this.stop(true)
            }
            else {
                return
            }
        }

        this.playing = true
        this.ended = false

        let dur = customInt

        const t = (this.type == "tween") // convenience
        const to = (this.type == "typeout")

        if (to) this.textGoals = this.textObj.goals

        if (!dur) {
            // set dur if not custom
            if (this.type.includes("frame")) {
                dur = (this.duration / this.timesGoal)
            }
            else if (this.type == "tween") {
                dur = 1
            }
            else if (to) {
                dur = (this.duration / tLen(this.textGoals))
            }
            else {
                dur = this.duration // default duration
            }
        }

        if (t || (to)) {
            this.start = performance.now()

            if (t) {
                for (let p in this.properties) { // Log our starting properties so we can properly tween from them
                    if (!this.startProps[p]) this.startProps[p] = this.object[p]
                }
            }
        }

        this.interval = setInterval(this.tick.bind(this), dur)
    }

    stop(force) { // (forcibly*) stop the animator
        this.playing = false
        if (this.interval) clearInterval(this.interval)

        setTimeout(() => { // Reset everything we need to
            // convenience variables
            const t = (this.type == "tween")
            const to = (this.type == "typeout")


            if (this.type.includes("frame")) {
                this.times = this.endSet
            }
            else if (t || to) {
                if (t) {
                    for (let p in this.properties) this.object[p] = this.properties[p] // ensure the object is set to the final property value in case it is under or over
                    this.time = 0
                    this.startProps = {}
                }
                else {
                    this.times = this.endSet
                    this.lineTarg = 0
                    this.textGoals = null

                    if (force) this.textObj.strs = {} // issue encountered, clear strs
                }
                
                this.start = this.endSet
            }

            this.ended = true
            if (this.callback && !force) this.callback(true) // run the callback if we ended naturally
        }, ((!force) && this.clearTime) || 1)
    }

    constructor(n, t, d = 1000, ct = 1, dat, cb) {
        if (!t) {
            console.error(`Animator: New animator of name '${n || "Unknown"}' failed to create; missing or unknown type '${t}'.`)
            return
        }

        this.name = n
        this.type = t

        this.duration = d
        this.clearTime = ct

        this.callback = cb

        // set necessary properties based on type
        if (this.type.includes("frame")) {
            this.timesGoal = dat.goal
            this.times = -1
            if (dat.endSet != undefined) this.endSet = dat.endSet

            if (this.type == "flashframe") this.flashing = false
        }
        else if (this.type == "tween") {    
            this.properties = dat.prop
            this.object = dat.obj
        }
        else if (this.type == "typeout") {
            this.times = 0
            this.lineTarg = 0
            this.textObj = dat.obj
            this.typeSound = dat.snd
        }

        // bind the functions to the class (fixes a ref error)
        this.tick = this.tick.bind(this)
        this.stop = this.stop.bind(this)

        // if a name doesn't exist, we don't want to store this.
        if (n) Animators[n] = this
    }
}

export class Timer { // Used for Fighter class primarily; can be used for other stuff though
    name // string ref.
    active = false // is timer active
    began = 0 // time when timer began
    duration = 0 // duration of timer (in ms)
    lastDur = 0 // previous duration (typically default)

    check() { // if the timer is active and the duration has passed, return true        
        return (this.active && ((performance.now() - this.began) > this.duration))
    }

    start(d) { // begin the timer
        this.active = true
        this.began = performance.now()

        if (d) {
            this.lastDur = this.duration
            this.duration = d
        }
    }

    stop() { // stop the timer
        this.active = false
        if (this.lastDur > 0) {
            this.duration = this.lastDur
            this.lastDur = 0
        }
    }

    constructor(n = "timer", d = 1000, a) {
        if (a) this.start()

        this.name = n
        this.duration = d

        Timers.push(this)
    }
}

export default { Animator }