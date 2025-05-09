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
    D:68
   };
   
// What each set of keyboard codes 'does'
export const keyClasses = {
    jump: [KEYS.W, KEYS.UP_ARROW, KEYS.SPACE],
    crouch: [KEYS.S, KEYS.DOWN_ARROW],
    left: [KEYS.A, KEYS.LEFT_ARROW],
    right: [KEYS.D, KEYS.RIGHT_ARROW]
}

export const FLOOR = (h - 100)
export const GRAVITY = 2

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

    handlesY

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
        const diff = (this.position.x + this.velocity.x)

        if (diff >= (w - this.size.w)) {
            this.position.x = (w - this.size.w)
        }
        else if (diff <= 0) {
            this.position.x = 0
        }
        else {
            this.position.x = diff
        }

        if (!this.handlesY) this.position.y += this.velocity.y

        if (DEBUG) this.draw()
    }

    draw() {
        CTX.fillStyle = "red"
        CTX.fillRect(this.left, this.top, this.size.w, this.size.h)
        CTX.fillStyle = "blue"
        CTX.fillRect(this.left, this.top, 4, 4)
    }

    constructor(x, y, xv, yv, w, h, hy) {
        this.position.x = x
        this.position.y = y
        this.velocity.x = xv
        this.velocity.y = yv
        this.size.w = w
        this.size.h = h

        this.handlesY = hy
    }
}

export default { CANVAS }