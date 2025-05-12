// Passionyte 2025
'use strict'

export const Animators = {}
export const ImageMemory = {}

export class Animator {
    name // string ref.
    type
    playing = false
    interval
    times = 0
    timesGoal = 0
    flashing
    duration
    clearTime
    callback

    tick() {
        if (!this.playing) return

        this.times++
        if (this.type == "flashframe") this.flashing = (!this.flashing)

        if (this.times >= this.timesGoal) this.stop()
    }

    play(customInt) {
        this.playing = true
        this.interval = setInterval(this.tick.bind(this), (((!customInt) && (this.duration / this.timesGoal)) || customInt))
    }

    stop(force) {
        this.playing = false

        setTimeout(() => {
            if (this.interval) clearInterval(this.interval)
            this.times = 0
            if (this.callback) this.callback(true)
        }, ((!force) && this.clearTime) || 1)
    }

    constructor(n = "animator", t, d = 1000, ct = 1, tg, cb) {
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
            this.timesGoal = tg
            this.times = 0

            if (this.type == "flashframe") this.flashing = false
        }

        this.tick = this.tick.bind(this)
        this.stop = this.stop.bind(this)

        Animators[n] = this
    }
}

export function newImage(n, w, h) {
    let i = ImageMemory[n]
    if (i) return i

    i = new Image()
    i.src = `../imgs/${n}`

    ImageMemory[n] = i

    return i
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