// Passionyte 2025
'use strict'

import { Object, DEBUG, FLOOR, GRAVITY, CTX, w, h, collision, collisionFighter } from "./globals.js"
import { isKeyFromClassDown } from "./main.js"
import { Timer, newImage } from "./animate.js"

export const defHP = 20
export const stateBounds = {
    stance: { x: 876, y: 476, w: 137, h: 258 },
    jump: { x: 354, y: 1102, w: 110, h: 269, offset: { x: 27, y: 0 } },
    march: { x: 76, y: 791, w: 157, h: 261 },
    crouch: { x: 80, y: 1187, w: 122, h: 181, offset: { x: 15, y: 80 } },
    punch: { x: 589, y: 480, w: 217, h: 252 },
    kick: { x: 579, y: 794, w: 194, h: 259 },
    hurt: { x: 347, y: 791, w: 138, h: 262 },
    shoot: { x: 813, y: 820, w: 214, h: 233, offset: { x: 0, y: 28 } }
}

const FireballBounds = {
    x: 331,
    y: 496,
    w: 220,
    h: 220,
}

export const Fighters = []
export const Hitboxes = []

const FighterTimers = { // What timers to create + duration
    attack: 0,
    stun: 0,
    shoot: 500
}

export class Hitbox extends Object {
    dmg // damage applied to player
    life // despawns after a given time
    created // for use with the above timer
    creator // don't hit this guy
    ignoreBoundaries

    img // for stuff like the Fireball wooooooshhh, (no not the subreddit)
    bounds // bounds of the image (if it has one, should typically be the width/height of the Object)

    remove() {
        Hitboxes.splice(Hitboxes.indexOf(this), 1)
    }

    check(o) {
        if (o === this.creator || o.whenStunned) return false

        return (collision(this, o))
    }

    update() {
        const posCheck = (!this.ignoreBoundaries && (this.right > w || this.left < 0))
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
        if (i) CTX.drawImage(i, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h, this.left, this.top, this.width, this.height)
            
        if (DEBUG) super.draw("rgba(200, 200, 0, 0.5)")
    }

    constructor(x, y, xv, yv, w, h, c, d, l, i, b, ib = false) { // a hitbox must always have the supers, damage and a id (determined by script)
        super(x, y, xv, yv, w, h, undefined, ib) // 2 many arguments!1

        this.creator = c
        this.dmg = d
        this.ignoreBoundaries = ib

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
    maxHP // set to hp on creation
    state // kicking.. punching.. fireball.. etc..
    grounded = true
    name // name of the fighter. retrieved from imgs or custom generated (soon lol)
    plr // will be undefined if fighter is a npc

    lastStep // only used when state is march
    facing // direction the fighter is facing, either left or right
    marchLock = false // locks marching / stance during jumping, crouching or other states
    fallen = false // render the fighter fallen, to be used in conjunction with state 'hurt'
    bounces = 0 // for 'fallen'; lets the fighter bounce x amount of times when falling to the ground

    timers = {} // contains 'Timer' classes; used for various things that need to be timed such as when a Fighter is attacking or stunned

    img
    bounds // derived from state in stateBounds

    get t () { // for convenience
        return this.timers
    }

    setBaseState() {
        let crouchDesired = false
        let xv = 0

        if (this.plr) {
            crouchDesired = ((isKeyFromClassDown("crouch")))
            xv = (((isKeyFromClassDown("left")) && -6) || ((isKeyFromClassDown("right")) && 6)) || 0
        }

        this.velocity.x = xv

        this.marchLock = (crouchDesired)
        this.state = ((crouchDesired) && "crouch") || ((xv != 0) && "march") || "stance"
    }

    update() {
        this.bounds = stateBounds[this.state]
        if (this.bounds.offset) {
            this.offset = this.bounds.offset
        }
        else {
            this.offset = { x: 0, y: 0 } // base
        }

        const floorPos = (FLOOR - 258) // 258 is the stance height
        this.grounded = (!this.fallen && (this.bottom >= floorPos && this.velocity.y == 0))

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

        if (!this.t.stun.active || this.fallen) {
            if (!this.grounded) { // in air
                if (this.state != "kick" && !this.fallen) this.state = "jump"

                const diff = (this.position.y + GRAVITY)

                this.velocity.y += GRAVITY

                if (diff >= floorPos) { // land
                    if (!this.fallen) {
                        this.whenAttacking = 0
                        this.attackTimer = 0
                        this.marchLock = false
                        this.position.y = floorPos
                        this.velocity.y = 0
                    }
                    else {
                        if (this.bounces > 0) {
                            this.velocity.y -= (8 - (3 - this.bounces))

                            if (this.velocity.x != 0) this.velocity.x *= 0.75
                        }
                        else {
                            this.position.y = floorPos
                            this.velocity.x = 0
                        }
                        this.bounces--
                    }
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

            const aTimer = this.t.attack
            if (aTimer.check()) {
                aTimer.stop()
                this.setBaseState()
            }
        }

        const sTimer = this.t.stun
        if (sTimer.check()) {
            sTimer.stop()

            this.setBaseState()

            if (this.fallen) this.fallen = false
        }

        const sHTimer = this.t.shoot
        if (sHTimer.check()) {
            sHTimer.stop()

            this.state = "shoot"

            const lefty = (this.facing == "left")

            const x = ((!lefty) && (this.right + 20)) || (this.left - 120)
            new Hitbox(x, this.top, ((lefty) && -4) || 4, 0, 128, 128, this, 4, 10000, "template.jpg", FireballBounds, true)
        }

        /*let isObstructed
        for (const a of Fighters) {
            if (a.plr != this.plr) {
                isObstructed = collisionFighter(this, a)

                if (isObstructed) break
            }
        }
        
        if (isObstructed && this.velocity.x == 0 && !this.whenStunned) {
            const nx = (isObstructed == "left" && 2) || ((isObstructed == "right") && -2) || 0
            if (nx != 0) {
                this.beingPushed = true
                this.velocity.x = nx
            }
        }
        else {
            if (this.beingPushed) {
                this.beingPushed = false
                //this.velocity.x = 0
                this.setBaseState()
            }
        }*/

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

        if (!this.fallen) {
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
        }
        else {
            const w = this.bounds.w;
            const h = this.bounds.h;

            // Correct pivot point for rotation
            const pivotX = this.left + w / 2;
            const pivotY = this.top + h / 2; // Center the pivot point vertically

            CTX.save();
            CTX.translate(pivotX, pivotY);

            const lefty = (this.facing == "left");
            if (lefty) {
                CTX.rotate(Math.PI / 2); // Rotate clockwise for left-facing fighters
                CTX.translate(-w / 2, -h / 2); // Center the fighter within the hitbox
                CTX.scale(-1, 1); // Flip horizontally
            } else {
                CTX.rotate(-Math.PI / 2); // Rotate counterclockwise for right-facing fighters
                CTX.translate(-w / 2, -h / 2); // Center the fighter within the hitbox
            }

            CTX.drawImage(
                this.img,
                this.bounds.x, this.bounds.y,
                w, h,
                ((lefty) && -195) || -55, 0,
                w, h
            );
            CTX.restore();
        }
        if (DEBUG) super.draw(!this.plr && "rgba(100, 100, 100, 0.5)")
    }

    jump() {
        if (this.grounded && !this.t.attack.active && !this.t.stun.active) {
            this.marchLock = true
            this.velocity.y = -20
        }
    }

    onDamage(dmg, x) {
        const fromRight = (x > this.position.x)

        this.velocity.x = ((((fromRight) && -1) || 1) * dmg)
        this.marchLock = true

        const aTimer = this.t.attack
        if (aTimer.active) aTimer.stop()

        this.hp -= dmg
        this.state = "hurt"

        this.t.stun.start()
        this.whenStunned = performance.now()

        const sTimer = this.t.stun
        if ((dmg >= 4) || !this.grounded) {
            sTimer.duration = 1200
            this.fallen = true
            this.bounces = 3
            this.velocity.y = -10
        }
        else {
            sTimer.duration = 300
        }
    }

    punch() {
        const aTimer = this.t.attack
        if (this.grounded && !aTimer.active && !this.t.stun.active) {
            this.marchLock = true
            this.state = "punch"

            aTimer.start(200)

            const lefty = (this.facing == "left")
            this.velocity.x = ((lefty) && -2) || 2

            const x = ((!lefty) && (this.right + 40)) || (this.left - 60)
            new Hitbox(x, (this.top + 35), 0, 0, 64, 64, this, 2, 200)
        }
    }

    kick() {
        const aTimer = this.t.attack
        if (!aTimer.active && !this.t.stun.active) {
            this.marchLock = true
            this.state = "kick"

            aTimer.start(400)

            if (this.grounded) this.velocity.x = 0

            const x = ((this.facing != "left") && (this.right + 20)) || (this.left - 120)
            new Hitbox(x, (this.top + 40), 0, 0, 128, 156, this, 4, 500)
        }
    }

    fireball() {
        const aTimer = this.t.attack
        if (this.grounded && !aTimer.active && !this.t.stun.active) {
            this.marchLock = true

            this.state = "hurt" // just for the looks

            aTimer.start(1000)
            this.t.shoot.start()

            if (this.grounded) this.velocity.x = 0
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
        this.maxHP = hp

        this.state = state
        this.name = name
        this.plr = plr
        this.img = newImage(`${name}.jpg`)
        this.bounds = bounds
        this.facing = facing

        for (const nm in FighterTimers) this.timers[nm] = new Timer(nm, (FighterTimers[nm]))

        Fighters.push(this)
    }
}