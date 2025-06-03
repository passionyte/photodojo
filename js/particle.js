/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: particle.js
 * Description: Creates and manages particles, allowing them to be displayed, animated and remvoed
 *
 * Author: Logan
 */

'use strict'

import { Object, DEBUG, img, CTX } from "./globals.js"
import { newImage } from "./images.js"
import { Animator } from "./animate.js"

export const Particles = []

export class Particle extends Object {
    type
    life
    img
    bounds
    style = {
        alpha: 1,
        sw: 0, // size
        sh: 0,
        ox: 0, // offset
        oy: 0
    }

    remove() {
        const i = Particles.indexOf(this)
        if (i) Particles.splice(i, 1)
        return
    }

    update() {
        super.update()
        this.draw()
    }

    draw() {
        const a = this.style.alpha

        if (a) {
            CTX.save()
            CTX.globalAlpha = a
        }

        const ox = this.style.ox
        const oy = this.style.oy
        const sw = this.style.sw
        const sh = this.style.sh

        img(this.img, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h, 
            ((this.absLeft + ox) - (sw / 2)), 
            ((this.bottom + oy) - (sh / 2)), 
            (this.width + sw), 
            (this.height + sh)
        )

        if (a) CTX.restore()

        if (DEBUG) super.draw()
    }

    constructor(x, y, xv, yv, w, h, t, i, b, l = 1000, s) {
        super(x, y, xv, yv, w, h)

        this.type = t
        this.img = newImage(i)
        this.bounds = b
        this.life = l

        // begin any anims desired and handle deletion
        if (s) {
            const t = new Animator(undefined, "tween", this.life, 1, {obj: this.style, prop: s})

            t.play()
            setTimeout(this.remove, this.life)
        }

        Particles.push(this)
    }
}