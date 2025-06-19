// Passionyte 2025

'use strict'

export class Game {
    state = {
        started: false,
        controls: false,
        paused: false
    }
    mode
    menu
    nextMenu
    buttonLayout
    frames = {
        NOW: 0,
        time: 0
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