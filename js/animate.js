// Passionyte 2025

'use strict'

import { playSound } from "./sounds.js"

export const Animators = {}

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

    // tween properties
    object
    properties
    startProps = {}
    time

    // typeout properties
    textObj
    textGoal
    typeSound

    // shared properties
    start

    tick() { // per each 'tick' of the animator
        if (!this.playing) return

        if (this.type.includes("frame")) { // goes from 0 - a goal number of ticks within a set time frame
            this.times++
            if (this.type == "flashframe") this.flashing = (!this.flashing)
    
            if (this.times >= this.timesGoal) this.stop() // reached our goal, end
        }
        else if (this.type == "tween") { // tweens properties of a object from point A to B
            this.time = (performance.now() - this.start)

            for (let p in this.properties) {
                const div = (this.duration / this.time) // get the divisor for the tween based on the current time/progress and the duration of the tween
                let v

                const pP = this.properties[p]
                const sP = this.startProps[p]

                if (pP < sP) { // tween down
                    v = ((pP + sP) - (sP / div))
                }
                else { // tween up
                    v = (sP + (pP / div))
                }

                this.object[p] = v
            }

            if (this.time >= this.duration) this.stop() // reached our goal, end
        }
        else if (this.type == "typeout") {
            if (!this.textObj.str.includes(this.textGoal)) { // Don't run if we have exceeded the length or we still need to yield)
                this.textObj.str += this.textGoal[this.times]
                if (this.typeSound) playSound(this.typeSound, true)
                this.times++
            }
            else {
                this.stop(true) // end of typeout, end
            }
        }
    }

    play(customInt) { // start the animator
        if (this.playing) return

        this.playing = true
        this.ended = false

        let dur = customInt

        const t = (this.type == "tween") // convenience

        if (!dur) dur = ((this.type.includes("frame")) && (this.duration / this.timesGoal)) || ((t) && 1) || ((this.type == "typeout") && (this.duration / this.textGoal.length)) || this.duration // determine the duration of the interval
        
        if (t || (this.type == "typeout")) {
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

        setTimeout(() => { // Reset everything we need to
            if (this.interval) clearInterval(this.interval)

            // convenience variables
            const t = (this.type == "tween")
            const to = (this.type == "typeout")

            if (this.type.includes("frame") || to) {
                this.times = -1
            }
            else if (t || to) {
                if (t) {
                    for (let p in this.properties) this.object[p] = this.properties[p] // ensure the object is set to the final property value in case it is under or over
                    this.time = 0
                    this.startProps = {}
                }
                
                this.start = -1
            }

            this.ended = true
            if (this.callback && !force) this.callback(true) // run the callback if we ended naturally
        }, ((!force) && this.clearTime) || 1)
    }

    constructor(n = "animator", t, d = 1000, ct = 1, dat, cb) {
        if (!t) {
            console.error(`Animator: New animator of name '${n}' failed to create; missing or unknown type '${t}'.`)
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

            if (this.type == "flashframe") this.flashing = false
        }
        else if (this.type == "tween") {    
            this.properties = dat.prop
            this.object = dat.obj
        }
        else if (this.type == "typeout") {
            this.times = 0
            this.textGoal = dat.obj.goal || dat.goal
            this.textObj = dat.obj
            this.typeSound = dat.snd
        }

        // bind the functions to the class (fixes a ref error)
        this.tick = this.tick.bind(this)
        this.stop = this.stop.bind(this)

        Animators[n] = this
    }
}

export class Timer { // Used for Fighter class primarily; can be used for other stuff though
    name // string ref.
    active = false // is timer active
    began = 0 // time when timer began
    duration = 0 // duration of timer (in ms)

    check() { // if the timer is active and the duration has passed, return true
        return (this.active && ((performance.now() - this.began) > this.duration))
    }

    start(d) { // begin the timer
        this.active = true
        this.began = performance.now()

        if (d) this.duration = d
    }

    stop() { // stop the timer
        this.active = false
    }

    constructor(n = "timer", d = 1000, a) {
        if (a) this.start()

        this.name = n
        this.duration = d
    }
}

export default { Animator }