// Passionyte 2025

'use strict'

export const Animators = {}

export class Animator {
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
    start
    time
    startProps = {}

    tick() {
        if (!this.playing) return

        if (this.type.includes("frame")) { // goes from 0 - a goal number of ticks within a set time frame
            this.times++
            if (this.type == "flashframe") this.flashing = (!this.flashing)
    
            if (this.times >= this.timesGoal) this.stop()
        }
        else if (this.type == "tween") { // tweens properties of a object from point A to B
            this.time = (performance.now() - this.start)

            for (let p in this.properties) {
                const div = (this.duration / this.time)
                let v

                if (this.properties[p] < this.startProps[p]) {
                    v = ((this.properties[p] + this.startProps[p]) - (this.startProps[p] / div))
                }
                else {
                    v = (this.startProps[p] + (this.properties[p] / div))
                }

                this.object[p] = v
            }

            if (this.time >= this.duration) this.stop()
        }
    }

    play(customInt) {
        if (this.playing) return

        this.playing = true
        this.ended = false

        let dur = customInt

        if (!dur) dur = ((this.type.includes("frame")) && (this.duration / this.timesGoal)) || ((this.type == "tween") && 1) || this.duration

        if (this.type == "tween") {
            this.start = performance.now()

            for (let p in this.properties) { // Log our starting properties so we can properly tween from them
                if (!this.startProps[p]) this.startProps[p] = this.object[p]
            }
        }

        this.interval = setInterval(this.tick.bind(this), dur)
    }

    stop(force) {
        this.playing = false

        setTimeout(() => { // Reset everything we need to
            if (this.interval) clearInterval(this.interval)

            if (this.type.includes("frame")) {
                this.times = -1
            }
            else if (this.type == "tween") {
                this.start = -1
                this.time = 0
                this.startProps = {}
            }

            this.ended = true
            if (this.callback) this.callback(true)
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

        if (this.type.includes("frame")) {
            this.timesGoal = dat.goal
            this.times = -1

            if (this.type == "flashframe") this.flashing = false
        }
        else if (this.type == "tween") {    
            this.properties = dat.prop
            this.object = dat.obj
        } 

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

    check() {
        return (this.active && ((performance.now() - this.began) > this.duration))
    }

    start(d) {
        this.active = true
        this.began = performance.now()

        if (d) this.duration = d
    }

    stop() {
        this.active = false
    }

    constructor(n = "timer", d = 1000, a) {
        if (a) this.start()

        this.name = n
        this.duration = d
    }
}

export default { Animator }