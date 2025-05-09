import { Object, DEBUG, FLOOR, GRAVITY, CTX, newImage } from "./globals.js";

export const defHP = 20
export const stateBounds = {
    stance: {x: 876, y: 476, w: 137, h: 258},
    jump: {x: 354, y: 1102, w: 110, h: 269},
    march: {x: 76, y: 791, w: 157, h: 261},
    crouch: {x: 80, y: 1187, w: 122, h: 181, offset: {x: 0, y: 80}}
}
export const Fighters = []

export class Fighter extends Object {
    hp
    state // kicking.. punching.. fireball.. etc..
    grounded = true
    name // name of the fighter. retrieved from imgs or custom generated (soon lol)
    plr // will be undefined if fighter is a npc

    lastStep // only used when state is march

    img
    bounds // derived from state in stateBounds


    update() {
        this.bounds = stateBounds[this.state]

        const floorPos = (FLOOR - 258)
        this.grounded = (this.bottom >= floorPos && this.velocity.y == 0)

        if (this.velocity.y != 0) {
            let diff = (this.position.y += this.velocity.y)

            if (diff > floorPos) {
                this.position.y = floorPos
                this.velocity.y = 0
            }
            else {
                this.position.y = diff
            }
        }

        if (!this.grounded) {
            this.state = "jump"

            const diff = (this.position.y + GRAVITY)

            this.velocity.y += GRAVITY

            if (diff >= floorPos) {
                this.position.y = floorPos
                this.velocity.y = 0
            }
            else {
                this.position.y = diff
            }
        }
        else {
            if (this.state != "crouch" && this.state != "jump") {
                if (this.velocity.x == 0) {
                    this.state = "stance"
                }
                else {
                    this.state = "march"
                }
            }
        }

        const xo = ((this.bounds.offset) && this.bounds.offset.x) || 0
        const yo = ((this.bounds.offset) && this.bounds.offset.y) || 0

        this.size.w = this.bounds.w + xo
        this.size.h = this.bounds.h + yo
        
        super.update()
        this.draw()
    }

    draw() {
        if (DEBUG) super.draw()
        
        if (this.state == "march") {
            this.bounds = stateBounds.stance
            const NOW = performance.now()
            
            if (!this.lastStep) {
                this.lastStep = NOW
            }
            else {
                const delta = (NOW - this.lastStep)

                if (delta > 150) {
                    this.bounds = stateBounds.march

                    if (delta > 300) {
                        this.lastStep = NOW
                    }
                }
            }
        }

        const xo = ((this.bounds.offset) && this.bounds.offset.x) || 0
        const yo = ((this.bounds.offset) && this.bounds.offset.y) || 0
        CTX.drawImage(this.img, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h, this.left + xo, this.top + yo, this.bounds.w, this.bounds.h)
    }

    jump() {
        if (this.grounded) {
            this.velocity.y = -40
        }
    }

    constructor(x, y, plr, state = "stance", hp = defHP, name = "template") {
        const bounds = stateBounds[state]

        if (!bounds) {
            console.error(`Fighter: Could not find stateBounds for state '${state}'!`)
            return
        }

        super(x, y, bounds.x, bounds.y, bounds.w, bounds.h, true)

        this.hp = hp
        this.state = state
        this.name = name
        this.plr = plr
        this.img = newImage(`${name}.jpg`)
        this.bounds = bounds

        Fighters.push(this)
    }
}