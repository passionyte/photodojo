// Passionyte 2025
'use strict'

import { Object, DEBUG, FLOOR, GRAVITY, CTX, newImage, w, h, checkTimer } from "./globals.js"
import { isKeyFromClassDown } from "./main.js"

export const defHP = 20
export const stateBounds = {
    stance: {x: 876, y: 476, w: 137, h: 258},
    jump: {x: 354, y: 1102, w: 110, h: 269, offset: {x: 27, y: 0}},
    march: {x: 76, y: 791, w: 157, h: 261},
    crouch: {x: 80, y: 1187, w: 122, h: 181, offset: {x: 15, y: 80}},
    punch: {x: 589, y: 480, w: 217, h: 252},
    kick: {x: 579, y: 794, w: 194, h: 259},
    hurt: {x: 347, y: 791, w: 138, h: 262},
    shoot: {x: 813, y: 820, w: 214, h: 233}
}
export const Fighters = []
export const Hitboxes = []

function setBaseStance(a) {
    let crouchDesired = false
    let xv = 0

    if (a.plr) {
        crouchDesired = ((isKeyFromClassDown("crouch")))
        xv = (((isKeyFromClassDown("left")) && -6) || ((isKeyFromClassDown("right")) && 6)) || 0
    }

    a.velocity.x = xv

    a.marchLock = (crouchDesired)
    a.state = ((!crouchDesired) && ((xv != 0) && "march") || "stance") || "crouch"
}

export class Hitbox extends Object {
    dmg // damage applied to player
    life // despawns after a given time
    created // for use with the above timer
    creator // don't hit this guy

    img // for stuff like the Fireball wooooooshhh, (no not the subreddit)
    bounds // bounds of the image (if it has one, should typically be the width/height of the Object)

    remove() {
        Hitboxes.splice(Hitboxes.indexOf(this), 1)
    }

    check(o) {
        if (o === this.creator || o.whenStunned) return false

        const col = (
            this.right > o.left &&
            this.left < o.right &&
            this.bottom > o.top &&
            this.top < o.bottom
        )

        return col
    }

    update() {
        const posCheck = (this.right > w || this.left < 0)
        const timeCheck = (this.life && ((performance.now() - this.created) >= (this.life)))

        if (posCheck || timeCheck) { // destroy hitbox
            this.remove()
            return
        }

        super.update()
        this.draw()
    }

    draw() {
        const i = this.img
        if (i) CTX.drawImage(i, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h, this.left, this.top, this.bounds.w, this.bounds.h)

        if (DEBUG) super.draw("rgba(200, 200, 0, 0.5)")
    }

    constructor(x, y, xv, yv, w, h, c, d, l, i, b) { // a hitbox must always have the supers, damage and a id (determined by script)
        super(x, y, xv, yv, w, h) // 2 many arguments!1

        this.creator = c
        this.dmg = d

        if (i) { // Hitbox image junk
            this.img = newImage(i)
            this.bounds = b
        }

        if (l) { // if the Hitbox has a 'lifetime' keep track of it and the time it was created
            this.life = l
            this.created = performance.now()
        }

        Hitboxes.push(this)
    }
}

export class Fighter extends Object {
    hp
    state // kicking.. punching.. fireball.. etc..
    grounded = true
    name // name of the fighter. retrieved from imgs or custom generated (soon lol)
    plr // will be undefined if fighter is a npc

    lastStep // only used when state is march
    facing // direction the player is facing, either left or right
    whenStunned = 0 // for use with the below timer
    stunTimer = 0 // for states such as 'hurt'
    marchLock = false // locks marching / stance during jumping, crouching or other states
    whenAttacking = 0 // for use with the below timer
    attackTimer = 0 // for states such as 'punch' or 'kick' or 'shoot', etc.

    img
    bounds // derived from state in stateBounds

    update() {
        this.bounds = stateBounds[this.state]
        if (this.bounds.offset) {
            this.offset = this.bounds.offset
        }
        else {
            this.offset = {x: 0, y: 0} // base
        }

        const floorPos = (FLOOR - 258) // 258 is the stance height
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

        if (!this.whenStunned) {
            if (!this.grounded) { // in air
                if (this.state != "kick") this.state = "jump"
                
                const diff = (this.position.y + GRAVITY)

                this.velocity.y += GRAVITY

                if (diff >= floorPos) { // land
                    this.whenAttacking = 0
                    this.attackTimer = 0
                    this.marchLock = false
                    this.position.y = floorPos
                    this.velocity.y = 0
                }
                else { // falling
                    this.position.y = diff
                }
            }
            else { // on ground
                if (!this.marchLock) {
                    if (this.velocity.x == 0) {
                        this.state = "stance"
                    }
                    else {
                        this.state = "march"
                    }
                }
            }

            if (this.state == "crouch") this.velocity.x = 0

            if (this.state == "punch" || this.state == "kick") {
                if (checkTimer(this.whenAttacking, this.attackTimer)) {
                    this.whenAttacking = 0
                    this.attackTimer = 0

                    /*const crouchDesired = ((isKeyFromClassDown("crouch")))
                    const xv = (((isKeyFromClassDown("left")) && -6) || ((isKeyFromClassDown("right")) && 6)) || 0
                    this.velocity.x = xv

                    this.marchLock = (crouchDesired)
                    this.state = ((!crouchDesired) && ((xv != 0) && "march") || "stance") || "crouch"*/
                    setBaseStance(this)
                }
            }
        }
        else {
            if (checkTimer(this.whenStunned, this.stunTimer)) {
                this.whenStunned = 0
                this.stunTimer = 0

                setBaseStance(this)

                // fix player pos
            }
        }

        super.update()
        this.draw()
    }

    draw() {
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

        if (this.facing == "left") {
            const w = this.bounds.w
            const h = this.bounds.h

            CTX.save()
            CTX.translate((this.left + (w / 2)), (this.top + (h / 2)))
            CTX.scale(-1, 1)
            CTX.drawImage(this.img, this.bounds.x, this.bounds.y, w, h, -(w / 2), -(h / 2), w, h) // TODO: add fixed lefty offsets for x (specifically, -(w / 2))
            CTX.restore()
        } 
        else {
            CTX.drawImage(this.img, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h, this.left, this.top, this.bounds.w, this.bounds.h)
        }
        
        if (DEBUG) super.draw(!this.plr && "rgba(100, 100, 100, 0.5)")
    }

    jump() {
        if (this.grounded && !this.whenAttacking && !this.stunTimer) {
            this.marchLock = true
            this.velocity.y = -20
        }
    }

    onDamage(dmg) {
        console.log(`ow! Fighter ${this.plr || "NPC"} took ${dmg} damage`)

        this.marchLock = true

        if (this.whenAttacking) {
            this.whenAttacking = 0
            this.attackTimer = 0
        }

        this.state = "hurt"

        this.whenStunned = performance.now()
        
        if ((dmg >= 4) || !this.grounded) {
            this.stunTimer = 1200

            // flop on the floor like a dying fish
            this.velocity.y = 10
        }
        else {
            this.stunTimer = 300
        }
    }

    punch() {
        if (this.grounded && !this.whenAttacking && !this.stunTimer) {
            this.marchLock = true
            this.state = "punch"

            this.whenAttacking = performance.now()
            this.attackTimer = 200

            const lefty = (this.facing == "left")
            this.velocity.x = ((lefty) && -2) || 2

            const x = ((!lefty) && (this.right + 40)) || (this.left - 60)
            new Hitbox(x, (this.top + 35), 0, 0, 64, 64, this, 2, 200)
        }
    }

    kick() {
        if (!this.whenAttacking && !this.stunTimer) {
            this.marchLock = true
            this.state = "kick"

            this.whenAttacking = performance.now()
            this.attackTimer = 400

            if (this.grounded) this.velocity.x = 0

            const x = ((this.facing != "left") && (this.right + 20)) || (this.left - 120)
            new Hitbox(x, (this.top + 40), 0, 0, 128, 156, this, 4, 500)
        }
    }

    constructor(x, y, plr, facing = "right", state = "stance", hp = defHP, name = "template") {
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
        this.facing = facing

        Fighters.push(this)
    }
}