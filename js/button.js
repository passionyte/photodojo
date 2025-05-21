// Passionyte 2025

'use strict'

import { img } from "./globals.js"
import { newImage } from "./images.js"
import { playSound } from "./sounds.js"

export const Buttons = []

const genericSounds = {
    select: "select.wav",
    press: "mode.wav"
}

export class Button {
    name
    state
    menu
    position = {
        x: 0,   
        y: 0
    }
    bounds
    img
    snds
    scale
    onpress

    get sBounds() {
        return this.bounds[this.state]
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
        img(this.img, this.sBounds.x, this.sBounds.y, this.sBounds.w, this.sBounds.h, this.x, this.y, (this.sBounds.w * this.scale), (this.sBounds.h * this.scale))
    }

    press() { // when the player activates the button
        this.doSound("press")
        this.state = "highlight"

        setTimeout(() => {
            this.state = "select"
        }, 200)

        if (this.onpress) this.onpress()
    }

    select() { // when the player selects the button
        this.doSound("select")
        this.state = "select"
    }

    constructor(n, s = "idle", m, i, snds = genericSounds, b, x, y, onpress, scale = 2) {
        this.name = n
        this.state = s
        this.menu = m
        this.img = newImage(i)
        this.snds = snds
        this.bounds = b
        this.position.x = x
        this.position.y = y
        this.onpress = onpress
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