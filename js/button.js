/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: button.js
 * Description: Fancy sprite button handler with selection and press compatibility (using keyboard)
 *
 * Author: Logan
 */

<<<<<<< HEAD
import { img, text, font, CTX, fstyle } from "./globals.js"
=======
'use strict'

import { img, text, font, CTX } from "./globals.js"
>>>>>>> e0c18ce (Class changes)
import { newImage } from "./images.js"
import { playSound } from "./sounds.js"

export const Buttons = []

const genericSounds = { // default if no sound dictionary is provided
    select: "select.wav",
    press: "mode.wav"
}

export const titlebuttonbounds = {
    i: {x: 104, y: 16, w: 112, h: 112},
    s: {x: 216, y: 16, w: 112, h: 112},
    p: {x: 104, y: 128, w: 112, h: 112},
    l: {x: 216, y: 128, w: 112, h: 112}
}
export const sbuttonbounds = {x: 0, y: 0, w: 78, h: 28}
export const mbuttonbounds = {x: 0, y: 0, w: 94, h: 28}
export const lbuttonbounds = {x: 0, y: 0, w: 158, h: 64}

export class Button {
    name
<<<<<<< HEAD
    state = "i" // current state of the button (i.e. i: idle, p: pressed, s: selected, h: highlighted)
=======
    state // current state of the button (i.e. idle, pressed, selected)
>>>>>>> e0c18ce (Class changes)
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
<<<<<<< HEAD
    canpress = true
    text // should be a dictionary containing text, font, size, etc. 'size' will only function if a font is given
    active = true // can be selected or pressed (overwrites all)

    get sBounds() {
        return this.bounds[this.state] || this.bounds.i || this.bounds // default to idle if bounds for a given state don't exist or just bounds
=======
    text // should be a dictionary containing text, font, size, etc. 'size' will only function if a font is given

    get sBounds() {
        return this.bounds[this.state] || this.bounds.idle || this.bounds // default to idle if bounds for a given state don't exist or just bounds
>>>>>>> e0c18ce (Class changes)
    }

    get x() {
        return this.position.x
    }

    get y() {
        return this.position.y
    }

    doSound(n) { // helper to play sounds w/ checks
        if (this.snds) {
            const s = this.snds[n] || genericSounds[n]

            if (s) {
                playSound(s, true)
            }
        }
    }

    draw() { // draw from state bounds and position
<<<<<<< HEAD
        if (this.img.i) {
=======
        if (this.img.d) {
>>>>>>> e0c18ce (Class changes)
            img(this.img[this.state], this.sBounds.x, this.sBounds.y, this.sBounds.w, this.sBounds.h, this.x, this.y, (this.sBounds.w * this.scale), (this.sBounds.h * this.scale))
        }
        else {
            img(this.img, this.sBounds.x, this.sBounds.y, this.sBounds.w, this.sBounds.h, this.x, this.y, (this.sBounds.w * this.scale), (this.sBounds.h * this.scale))
        }

        if (this.text) {
<<<<<<< HEAD
            fstyle("black")
=======
>>>>>>> e0c18ce (Class changes)
            CTX.textAlign = "center"
            if (this.text.font) font(`${this.text.size}px ${this.text.font}`)
            text(this.text.text, (this.x + this.sBounds.w), (this.y + (this.sBounds.h * 1.3)))
        }
    }

    press() { // when the player activates the button
        this.doSound("press")
        this.state = "p"

<<<<<<< HEAD
        setTimeout(this.onpress, 100)
        setTimeout(() => {
            this.state = ((globalThis.curSelected == this)) && "s" || "i"
            this.canpress = true
        }, 500)
=======
        setTimeout(() => { // typically, the button will no longer be selected after this if the menu changes
            this.state = "idle"//"select"
            if (this.onpress) this.onpress()
        }, 100)
>>>>>>> e0c18ce (Class changes)
    }

    select() { // when the player selects the button
        this.doSound("select")
        this.state = "s"
        this.canpress = true
    }

<<<<<<< HEAD
    constructor(n, m, i, snds = genericSounds, b, x, y, onpress, text, scale = 2) {
=======
    constructor(n, s = "idle", m, i, snds = genericSounds, b, x, y, onpress, text, scale = 2) {
>>>>>>> e0c18ce (Class changes)
        this.name = n
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

        return this
    }
}

export function selectNew(d, c, o, n) { // compare the 'candidate', old and new ... not going to be pretty.
    let result = false

    if (d == "LEFT") {
        result = (((n.x < o.x) && (Math.abs((n.y - o.y)) < 150)) && (!c || (n.x > c.x)))
    }
    else if (d == "RIGHT") {
        result = (((n.x > o.x) && (Math.abs((n.y - o.y)) < 150)) && (!c || (n.x < c.x)))
    }
    else if (d == "UP") {
        result = (((n.y < o.y) && (Math.abs((n.x - o.x)) < 150)) && (!c || (n.y > c.y)))
    }
    else if (d == "DOWN") {
        result = (((n.y > o.y) && (Math.abs((n.x - o.x)) < 150)) && (!c || (n.y < c.y)))
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

export function menuButtons(menu, layout) {
    let result = []

    for (const b of Buttons) {
        if (b.menu == menu || b.menu == layout) {
            result.push(b)
        }
    }

    return result
}

export default { Button }