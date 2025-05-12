// Passionyte 2025
'use strict'

import { initialLeft, initialRight } from "./main.js"

export const DEBUG = true

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

// Some convenient keyboard codes
export const KEYS = {
    SPACE:32,
    UP_ARROW:38,
    LEFT_ARROW:37,
    DOWN_ARROW:40,
    RIGHT_ARROW:39,
    W:87,
    A:65,
    S:83,
    D:68,
    P:80
   };
   
// What each set of keyboard codes 'does'
export const keyClasses = {
    jump: [KEYS.W, KEYS.UP_ARROW, KEYS.SPACE],
    crouch: [KEYS.S, KEYS.DOWN_ARROW],
    left: [KEYS.A, KEYS.LEFT_ARROW],
    right: [KEYS.D, KEYS.RIGHT_ARROW],
    action: [KEYS.P]
}

export const FLOOR = (h - 100)
export const GRAVITY = 1

export function clearCanvas() {
    CTX.clearRect(0, 0, w, h)
}

export function clamp(x, min, max) {
    if (x < min) x = min
    if (x > max) x = max

    return x
}

export function collision(o0, o1) {
     const col = (
            o0.right > o1.left &&
            o0.left < o1.right &&
            o0.bottom > o1.top &&
            o0.top < o1.bottom
        )

    return col
}

export function collisionFighter(fighterA, fighterB) {
    // Get the positions and dimensions of both fighters
    const aLeft = fighterA.left;
    const aRight = fighterA.left + fighterA.bounds.w;
    const aTop = fighterA.top;
    const aBottom = fighterA.top + fighterA.bounds.h;

    const bLeft = fighterB.left;
    const bRight = fighterB.left + fighterB.bounds.w;
    const bTop = fighterB.top;
    const bBottom = fighterB.top + fighterB.bounds.h;

    // Check for overlap between the two bounding boxes
    if (aRight > bLeft && aLeft < bRight && aBottom > bTop && aTop < bBottom) {
        // Calculate the direction of the collision
        if (aRight > bLeft && aLeft < bLeft) return 'right';   // Fighter A is on the left of Fighter B, collision from the right
        if (aLeft < bRight && aRight > bRight) return 'left';   // Fighter A is on the right of Fighter B, collision from the left
        if (aBottom > bTop && aTop < bTop) return 'down';       // Fighter A is above Fighter B, collision from below
        if (aTop < bBottom && aBottom > bBottom) return 'up';   // Fighter A is below Fighter B, collision from above
    }
    return null; // No collision
}

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

    get right() {
        return (this.left + this.width)
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