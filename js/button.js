// Passionyte 2025

'use strict'

import { img, text, font, CTX, fstyle } from "./globals.js"
import { newImage } from "./images.js"
import { playSound } from "./sounds.js"

export const Buttons = []

const genericSounds = { // default if no sound dictionary is provided
    select: "select.wav",
    press: "mode.wav"
}

export class Button {
    name
    state // current state of the button (i.e. idle, pressed, selected)
    menu // menu the button belongs to
    position = {
        x: 0,   
        y: 0
    }
    bounds // image bounds
    img
    snds // button sounds (for being pressed or selected etc.)
    scale // image scale
    onpress // on press callback
    text // should be a dictionary containing text, font, size, etc. 'size' will only function if a font is given

    get sBounds() {
        return this.bounds[this.state] || this.bounds.idle || this.bounds // default to idle if bounds for a given state don't exist or just bounds
    }

    get x() {
        return this.position.x
    }

    get y() {
        return this.position.y
    }

    doSound(n) { // helper to play sounds w/ checks
        if (this.snds) {
            const s = this.snds[n]

            if (s) {
                playSound(s, true)
            }
        }
    }

    draw() { // draw from state bounds and position
        if (this.img.d) {
            img(this.img[this.state], this.sBounds.x, this.sBounds.y, this.sBounds.w, this.sBounds.h, this.x, this.y, (this.sBounds.w * this.scale), (this.sBounds.h * this.scale))
        }
        else {
            img(this.img, this.sBounds.x, this.sBounds.y, this.sBounds.w, this.sBounds.h, this.x, this.y, (this.sBounds.w * this.scale), (this.sBounds.h * this.scale))
        }

        if (this.text) {
            fstyle("black")
            CTX.textAlign = "center"
            if (this.text.font) font(`${this.text.size}px ${this.text.font}`)
            text(this.text.text, (this.x + this.sBounds.w), (this.y + (this.sBounds.h * 1.3)))
        }
    }

    press() { // when the player activates the button
        this.doSound("press")
        this.state = "highlight"

        setTimeout(() => { // typically, the button will no longer be selected after this if the menu changes
            this.state = "idle"//"select"
            if (this.onpress) this.onpress()
        }, 100)
    }

    select() { // when the player selects the button
        this.doSound("select")
        this.state = "select"
    }

    constructor(n, s = "idle", m, i, snds = genericSounds, b, x, y, onpress, text, scale = 2) {
        this.name = n
        this.state = s
        this.menu = m
        if (typeof(i) == "object") { // image per state
            this.img = {}
            this.img.d = true // make sure we know it's a dictionary
            for (const s in i) this.img[s] = newImage(i[s])
        }
        else { // single image(?)
            this.img = newImage(i)
        }
        this.snds = snds
        this.bounds = b
        this.position.x = x
        this.position.y = y
        this.onpress = onpress
        this.text = text
        this.scale = scale

        Buttons.push(this)
    }
}

export function selectNew(d, c, o, n) { // compare the 'candidate', old and new ... not going to be pretty.
    let result = false

    if (d == "LEFT") {
        result = ((n.x < o.x) && (!c || (n.x > c.x)))
    }
    else if (d == "RIGHT") {
        result = ((n.x > o.x) && (!c || (n.x < c.x)))
    }
    else if (d == "UP") {
        result = ((n.y < o.y) && (!c || (n.y > c.y)))
    }
    else if (d == "DOWN") {
        result = ((n.y > o.y) && (!c || (n.y > c.y)))
    }

    return result
}

export function getButton(s) {
    let result
    
    for (const b of Buttons) {
        if (b.name == s) {
            result = b
            break
        }
    }

    return result
}

export function menuButtons(menu) {
    let result = []

    for (const b of Buttons) {
        if (b.menu == menu) {
            result.push(b)
        }
    }

    return result
}

export default { Button }