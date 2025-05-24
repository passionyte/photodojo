// Passionyte 2025

'use strict'

import { initialLeft, initialRight } from "./main.js"

export const DEBUG = false

export function d(id) {
    return document.getElementById(id)
}

export const CANVAS = d("CANVAS")

export const w = CANVAS.clientWidth
export const h = CANVAS.clientHeight
export const cenX = (w / 2)
export const cenY = (h / 2)

export const CTX = CANVAS.getContext("2d")

export const FPS = 60
export const MS_PER_FRAME = (1000 / FPS)

export const Live = (document.URL.includes("passionyte.github.io"))
export const URL = ((!Live) && "../") || "https://raw.githubusercontent.com/passionyte/photodojo/refs/heads/main/"

export const FLOOR = (h - 100)
export const GRAVITY = 0.75

export let VERSION = "alpha 0.2.6"

if (!Live) {
    document.title = `[DEV] ${document.title}`
    VERSION += " DEV"
}

export function clearCanvas() {
    CTX.clearRect(0, 0, w, h)
}

export function clamp(x, min, max) {
    if (x < min) x = min
    if (x > max) x = max

    return x
}

export function collision(o0, o1) {
    return ((o0.right > o1.left) && (o0.left < o1.right) && (o0.bottom > o1.top) && (o0.top < o1.bottom))
}

export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function cloneArray(a) {
    const result = []

    for (const t of a) {
        result.push(t)
    }

    return result
}

export function adtLen(a) {
    let result = 0

    for (const t in a) result++

    return result
}

// Shortcut/Helper functions
export function img(i, sx, sy, sw, sh, dx, dy, dw, dh) { CTX.drawImage(i, sx, sy, sw, sh, dx, dy, dw, dh) }
export function text(t, x, y, w) { CTX.fillText(t, x, y, w) }
export function font(str) { CTX.font = str }
export function frect(x, y, w, h) { CTX.fillRect(x, y, w, h) }
export function fstyle(str) { CTX.fillStyle = str }

export class Object { // The base for anything *scripted* that will appear on the 2D field
    position = {
        x: 0, 
        y: 0
    }

    velocity = {
        x: 0,
        y: 0
    }
    
    size = {
        w: 0,
        h: 0
    }

    offset = { // Intended for hitbox usage
        x: 0,
        y: 0
    }

    handlesY // Does the extended class handle Y itself (intended for implementations such as Gravity)
    ignoreBoundaries // Does the object ignore boundaries (intended for implementations such as fireballs)

    get width() {
        return (this.size.w - this.offset.x)
    }

    get height() {
        return (this.size.h - this.offset.y)
    }

    get left() {
        return (this.position.x + this.offset.x)
    }

    get absLeft() {
        return this.left + (initialLeft - globalThis.leftConstraint)
    }

    get right() {
        return (this.left + this.width)
    }

    get absRight() {
        return (this.right) + (initialRight - globalThis.rightConstraint) 
    }

    get top() {
        return (this.position.y + this.offset.y)
    }

    get bottom() {
        return (this.top + this.height)
    }

    update() {
        // basic boundary implementation
        const diff = (this.position.x + this.velocity.x)

        let l = false
        let r = false

        if (!this.ignoreBoundaries) {
            l = (diff <= globalThis.leftConstraint)
            r = ((diff >= (globalThis.rightConstraint - this.width)))
        }

        if (r) {
            this.position.x = (globalThis.rightConstraint - this.width)
        }
        else if (l) {
            this.position.x = globalThis.leftConstraint
        }
        else {
            this.position.x = diff
        }

        if (!this.handlesY) this.position.y += this.velocity.y
    }

    draw(color) { // Only called in debug mode
        CTX.fillStyle = ((color) && color) || "rgba(255, 0, 0, 0.5)"
        CTX.fillRect(this.left + (initialLeft - globalThis.leftConstraint), this.top, this.width, this.height)
        CTX.fillStyle = "rgba(0, 0, 255, 0.5)"
        CTX.fillRect(this.left + (initialLeft - globalThis.leftConstraint), this.top, 4, 4)
    }

    constructor(x, y, xv, yv, w, h, o = {x: 0, y: 0}, ib = false, hy = false) {
        this.position.x = x
        this.position.y = y
        this.velocity.x = xv
        this.velocity.y = yv
        this.size.w = w
        this.size.h = h
        
        this.offset = o

        this.ignoreBoundaries = ib
        this.handlesY = hy
    }
}

export default { CANVAS }