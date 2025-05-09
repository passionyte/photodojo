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

const FPS = 60

export const MS_PER_FRAME = (1000 / FPS)

export function clearCanvas() {
    CTX.clearRect(0, 0, w, h)
}

export class Object {
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

    get left() {
        return this.position.x
    }

    get right() {
        return (this.left + this.size.w)
    }

    get top() {
        return this.position.y
    }

    get bottom() {
        return (this.top + this.size.h)
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (DEBUG) this.draw()
    }

    draw() {
        CTX.fillStyle = "red"
        CTX.fillRect(this.left, this.top, this.size.w, this.size.h)
        CTX.fillStyle = "blue"
        CTX.fillRect(this.left, this.top, 4, 4)
    }

    constructor(x, y, xv, yv, w, h) {
        this.position.x = x
        this.position.y = y
        this.velocity.x = xv
        this.velocity.y = yv
        this.size.w = w
        this.size.h = h
    }
}

export default { CANVAS }