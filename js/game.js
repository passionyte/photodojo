export class Game {
    state = {
        started: false,
        controls: false,
        paused: false
    }
    mode
    plrs = {}
    menu
    nextMenu
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

    get started() {
        return (this.state.started)
    }

    get controls() {
        return (this.state.controls)
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