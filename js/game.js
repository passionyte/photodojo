/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: game.js
 * Description: Handles game state, mode and menus (with useful getters/setters to shorten typing)
 *
 * Author: Logan
 */

'use strict'

import { playSound } from "./sounds.js"
import { Timers } from "./animate.js"

let prePauseTimers = {}

export class Game {
    state = {
        started: false,
        controls: false,
        paused: false
    }
    mode
    menu
    nextMenu
    frames = {
        NOW: 0,
        time: 0
    }

    // functions

    pause() {
        this.paused = (!this.paused)

        if (this.paused) {
            playSound("pause.wav", true)
            for (const t of Timers) { // stop active timers
                if (t.active) {
                    t.stop()
                    prePauseTimers[(t.duration - (this.now - t.began))] = t // assign our timer to the time since starting
                }
            }
        }
        else { // resume pre-pause timers
            playSound("resume.wav", true)
            for (const i in prePauseTimers) prePauseTimers[i].start(i) // restart timer from this point
            prePauseTimers = {} // clear memory
        }
    }

    // helper getters/setters
    set time(x) {
        this.frames.time = x
    }

    get time() {
        return this.frames.time
    }

    set now(x) {
        this.frames.NOW = x
    }

    get now() {
        return this.frames.NOW
    }

    set started(b) {
        this.state.started = b
    }

    get started() {
        return (this.state.started)
    }

    set controls(b) {
        this.state.controls = b
    }

    get controls() {
        return (this.state.controls)
    }

    set paused(b) {
        this.state.paused = b
    }

    get paused() {
        return (this.state.paused)
    }

    get single() { // is single player mode
        return (this.mode == 1)
    }

    // set what we need to upon creation
    constructor(m = "loading", nm = "title") {
        this.menu = m
        this.nextMenu = nm

        this.frames.NOW = performance.now()
        this.frames.time = this.frames.NOW
    }
}

export default { Game }