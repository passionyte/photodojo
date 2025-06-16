/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: button.js
 * Description: Fancy sprite button handler with selection and press compatibility (using keyboard)
 *
 * Author: Logan
 */

import { img, text, font, CTX, fstyle } from "./globals.js"
import { newImage } from "./images.js"
import { playSound } from "./sounds.js"
import { GAME } from "./main.js"

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
export const longbuttonbounds = {x: 0, y: 0, w: 158, h: 28}

export const sbuttonimgs = {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png", l: "sbuttonlock.png"}
export const mbuttonimgs = {i: "mbutton.png", s: "mbuttonsel.png", p: "mbuttonpress.png", l: "mbuttonlock.png"}
export const lbuttonimgs = {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png", l: "lbuttonlock.png"}
export const longbuttonimgs = {i: "longbutton.png", s: "longbuttonsel.png", p: "longbuttonpress.png", l: "longbuttonlock.png"}

export class Button {
    name
    state = "i" // current state of the button (i.e. i: idle, p: pressed, s: selected, h: highlighted)
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
    canpress = true
    text // should be a dictionary containing text, font, size, etc. 'size' will only function if a font is given
    active = true // can be selected or pressed (overwrites all)

    get sBounds() {
        return this.bounds[this.state] || this.bounds.i || this.bounds // default to idle if bounds for a given state don't exist or just bounds
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
        if (this.img.i) {
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
        this.state = "p"

        setTimeout(this.onpress, 100)
        setTimeout(() => {
            if (!GAME.buttonLayout || GAME.buttonLayout == this.menu) {
                this.state = "s"
                this.canpress = true
            }
        }, 500)
    }

    select() { // when the player selects the button
        this.doSound("select")
        this.state = "s"
        this.canpress = true
    }

    constructor(n, m, i, snds = genericSounds, b, x, y, onpress, text, s = "i", scale = 2) {
        this.name = n
        this.menu = m
        this.state = s
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

export function selectNew(dir, current, origin, next) {
    if (!next) return false

    const dx = next.x - origin.x
    const dy = next.y - origin.y

    if (dir === "UP") {
        if (dy >= 0) return false
        if (!current) return true
        const cy = current.y - origin.y
        const cx = Math.abs(current.x - origin.x)
        return (-dy < -cy) || (-dy === -cy && Math.abs(dx) < cx)
    }

    if (dir === "DOWN") {
        if (dy <= 0) return false
        if (!current) return true
        const cy = current.y - origin.y
        const cx = Math.abs(current.x - origin.x)
        return (dy < cy) || (dy === cy && Math.abs(dx) < cx)
    }

    if (dir === "LEFT") {
        if (dx >= 0) return false
        if (!current) return true
        const cx = current.x - origin.x
        const cy = Math.abs(current.y - origin.y)
        return (-dx < -cx) || (-dx === -cx && Math.abs(dy) < cy)
    }

    if (dir === "RIGHT") {
        if (dx <= 0) return false
        if (!current) return true
        const cx = current.x - origin.x
        const cy = Math.abs(current.y - origin.y)
        return (dx < cx) || (dx === cx && Math.abs(dy) < cy)
    }

    return false
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

export function menuButtonsActive(a) {
    menuButtons(GAME.menu).forEach(b => {
        b.active = (a)
    })
}

export function layoutButtonsActive(a) {
    menuButtons(undefined, GAME.buttonLayout).forEach(b => {
        b.active = (a)
    })
}

export default { Button }