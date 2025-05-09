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

export default { CANVAS }