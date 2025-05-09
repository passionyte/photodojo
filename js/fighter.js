import { Object, DEBUG } from "./globals.js";

export const defHP = 20

export class Fighter extends Object {
    hp
    state // kicking.. punching.. fireball.. etc..
    img

    update() {
        super.update()
    }

    draw() {
        if (DEBUG) super.draw()
    }

    constructor(x, y, w, h, hp, state = "idle", img) {
        super(x, y, 0, 0, w, h)

        this.hp = hp
        this.state = state
        this.img = img
    }
}