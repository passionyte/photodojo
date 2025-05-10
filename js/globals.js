// Passionyte 2025
'use strict'

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

export function newImage(n, w, h) {
    const i = new Image()
    i.src = `../imgs/${n}`

    return i
}

export function checkTimer(s, d) {
    return ((performance.now() - s) > d)
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

        if (diff >= (w - this.width)) {
            this.position.x = (w - this.width)
        }
        else if (diff <= 0) {
            this.position.x = 0
        }
        else {
            this.position.x = diff
        }

        if (!this.handlesY) this.position.y += this.velocity.y
    }

    draw(color) { // Only called in debug mode
        CTX.fillStyle = ((color) && color) || "rgba(255, 0, 0, 0.5)"
        CTX.fillRect(this.left, this.top, this.width, this.height)
        CTX.fillStyle = "rgba(0, 0, 255, 0.5)"
        CTX.fillRect(this.left, this.top, 4, 4)
    }

    constructor(x, y, xv, yv, w, h, o = {x: 0, y: 0}, hy = false) {
        this.position.x = x
        this.position.y = y
        this.velocity.x = xv
        this.velocity.y = yv
        this.size.w = w
        this.size.h = h
        
        this.offset = o

        this.handlesY = hy
    }
}

export default { CANVAS }