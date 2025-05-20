// Passionyte 2025

'use strict'

import { Object, DEBUG, FLOOR, GRAVITY, CTX, w, h, collision, clamp, img } from "./globals.js"
import { MODE, initialLeft } from "./main.js"
import { Timer, Animators } from "./animate.js"
import { newImage } from "./images.js"
import { Controller } from "./controller.js"

export const defHP = 40 // default HP for fighters
export const stateBounds = { // image boundaries for each state
    stance: { x: 876, y: 476, w: 137, h: 258 },
    jump: { x: 354, y: 1102, w: 110, h: 269, offset: { x: 27, y: 0 } },
    march: { x: 76, y: 791, w: 157, h: 261 },
    crouch: { x: 80, y: 1187, w: 122, h: 181, offset: { x: 15, y: 80 } },
    punch: { x: 589, y: 480, w: 217, h: 252 },
    kick: { x: 579, y: 794, w: 194, h: 259 },
    hurt: { x: 347, y: 791, w: 138, h: 262 },
    shoot: { x: 813, y: 820, w: 214, h: 233, offset: { x: 0, y: 28 } },
    taunt: { x: 586, y: 1111, w: 152, h: 257 } 
}

const FireballBounds = { // image boundaries for the fireball
    x: 331,
    y: 496,
    w: 220,
    h: 220,
}

const FighterTimers = { // What timers to create + duration
    attack: 0,
    stun: 0,
    shoot: 500,
    lag: 0
}

export const Fighters = []
export const Hitboxes = []

export class Hitbox extends Object {
    dmg // damage applied to player
    life // despawns after a given time
    created // for use with the above timer
    creator // don't hit this guy
    ignoreBoundaries // ignore left and right boundaries
    type // easy identification
    hits = [] // contains things ('Fighter' or 'Hitbox')s the hitbox has already hit 

    img // for stuff like the Fireball wooooooshhh, (no not the subreddit)
    bounds // bounds of the image (if it has one, should typically be the width/height of the Object)

    remove() {
        Hitboxes.splice(Hitboxes.indexOf(this), 1)
    }

    check(hit) {
        if (this.hits.includes(hit)) return // already hit this object

        const isntFighter = (hit.dmg)
        const teamCheck = (this.creator.plr == hit.plr || (isntFighter && (this.creator.plr == hit.creator.plr))) // hit someone not on the same team

        if (!teamCheck) {
            if (hit != this.creator) { // hit isn't the creator of this hitbox
                if (isntFighter || (!hit.t.stun.active && !hit.fallen && !(hit.state == "crouch" && this.type == "fireball"))) { // check various conditions if it's a fighter or not
                    const col = collision(this, hit)

                    if (col) {
                        this.hits.push(hit)
                        return true
                    }
                }
            }
        }

        return false
    }

    update() {
        const posCheck = (!this.ignoreBoundaries && (this.right + (initialLeft - leftConstraint) > w || this.absLeft) < 0) // check if the hitbox is off-screen, assuming we aren't ignoring boundaries
        const timeCheck = (this.life && ((performance.now() - this.created) >= (this.life))) // check if the hitbox has lived long enough

        if (posCheck || timeCheck) { // destroy hitbox
            this.remove()
            return
        }

        super.update()
        this.draw()
    }

    draw() {
        const i = this.img
        if (i) img(i, this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h, this.absLeft, this.top, this.width, this.height)
            
        if (DEBUG) super.draw("rgba(200, 200, 0, 0.5)") // draw the hitbox if in debug mode
    }

    constructor(x, y, xv, yv, w, h, t, c, d, l, i, b, ib = false) { // a hitbox must always have the supers, damage and a id (determined by script)
        super(x, y, xv, yv, w, h, undefined, ib) // 2 many arguments!1

        this.type = t
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
    ignoreGravity = false

    timers = {} // contains 'Timer' classes; used for various things that need to be timed such as when a Fighter is attacking or stunned
    controller // to be assigned to a player-based controller as long as this.plr exists

    img
    bounds // derived from state in stateBounds
    shadow // shadow image under Fighter's feet

    get t () { // for convenience
        return this.timers
    }

    get alive () {
        return (this.hp > 0)
    }

    get canAttack() { // check a multitutde of things to see if the fighter can attack
        return (!this.t.attack.active && !this.t.stun.active && !this.t.lag.active && this.alive && !this.fallen)
    }

    get lefty() {
        return (this.facing == "left")
    }

    remove() {
        Fighters.splice(Fighters.indexOf(this), 1)
        return
    }

    setBaseState() { // determines a base state and assigns to it
        let crouchDesired = false
        let xv = 0

        if (this.plr) { // derive this only from a fighter that is a player
            crouchDesired = ((this.controller.isKeyFromClassDown("CROUCH")))
            xv = (((this.controller.isKeyFromClassDown("LEFT")) && -6) || ((this.controller.isKeyFromClassDown("RIGHT")) && 6)) || 0
        }

        this.velocity.x = xv

        this.marchLock = (crouchDesired)
        this.state = ((crouchDesired) && "crouch") || ((xv != 0) && "march") || "stance"
    }

    update() {
        this.bounds = stateBounds[this.state]
        if (this.bounds.offset) { // if the bounds have an offset, use it
            this.offset = this.bounds.offset
        }
        else {
            this.offset = { x: 0, y: 0 } // base
        }

        if (MODE == 1) { 
            // scrolling
            if (this.plr) {
                const xv = this.velocity.x
                if (xv > 0 && (rightConstraint - this.right) <= 500) {
                    globalThis.rightConstraint += xv
                    globalThis.leftConstraint += xv
                }
            }
        }

        const floorPos = (FLOOR - 258) // 258 is the stance height
        this.grounded = (!this.fallen && (this.bottom >= floorPos && this.velocity.y == 0) && !this.ignoreGravity)

        if (this.velocity.y != 0) { // y-velocity handling
            let diff = (this.position.y += this.velocity.y)

            if (diff > floorPos && !this.ignoreGravity) { // cancel fall
                this.position.y = floorPos
                this.velocity.y = 0
            }
            else { // continue falling
                this.position.y = diff
            }
        }

        if (!this.t.stun.active || this.fallen) { // gravity handling
            if (!this.grounded) { // in air
                if (this.state != "kick" && !this.fallen) this.state = "jump"

                const diff = (this.position.y + GRAVITY)

                this.velocity.y += GRAVITY

                if (diff >= floorPos && !this.ignoreGravity) { // land
                    if (!this.fallen) { // landing from a jump
                        this.lastStep = performance.now()

                        this.t.attack.stop()
                        this.marchLock = false
                        this.position.y = floorPos
                        this.velocity.y = 0
                    }
                    else { // landing while fallen over
                        if (this.bounces > 0) { // we need to bounce the player a bit
                            this.velocity.y -= (8 - (3 - this.bounces))

                            if (this.velocity.x != 0) this.velocity.x *= 0.75
                            this.bounces--
                        }
                        else { // end this
                            this.position.y = floorPos
                            this.velocity.x = 0
                            this.velocity.y = 0
                        }
                    }
                }
                else { // falling
                    this.position.y = diff
                }
            }
            else { // on ground, determine if fighter is marching
                if (!this.marchLock && this.state != "hurt") {
                    this.state = ((this.velocity.x == 0) && "stance") || "march"
                }
            }

            if (this.state == "crouch") this.velocity.x = 0 // shouldn't be able to move while crouching!

            const aTimer = this.t.attack
            if (aTimer.check()) { // end attack
                aTimer.stop()
                this.t.lag.start((aTimer.duration / 4))
                this.setBaseState()
            }
        }

        const sTimer = this.t.stun
        if (sTimer.check()) { // unstun/fall fighter
            sTimer.stop()

            if (this.alive) { // are we alive?
                this.setBaseState()
                if (this.fallen) this.fallen = false
                this.position.y = floorPos
                this.velocity.y = 0
            }
        }

        const sHTimer = this.t.shoot
        if (sHTimer.check()) { // shoot fireball!
            sHTimer.stop()

            if (!sTimer.active && this.alive) { // make sure we are able to shoot.. don't use canAttack
                this.state = "shoot"

                const x = ((!this.lefty) && (this.right + 20)) || (this.left - 120)
                new Hitbox(x, this.top, ((this.lefty) && -5) || 5, 0, 128, 128, "fireball", this, 2, 10000, "template.jpg", FireballBounds, true)
            }
        }

        const lTimer = this.t.lag
        if (lTimer.check()) lTimer.stop() // end attack lag

        super.update()
        this.draw()
    }

    draw() {
        if (this.state == "march") { // Do march animation
            this.bounds = stateBounds.stance
            const NOW = performance.now()

            if (!this.lastStep) { // exception for first step
                this.lastStep = NOW
            }
            else {
                const delta = (NOW - this.lastStep)

                if (delta > 150) { // take 'step'
                    this.bounds = stateBounds.march

                    if (delta > 300) { // reset lastStep
                        this.lastStep = NOW
                    }
                }
            }
        }

        // simple shadow
        if (this.grounded) img(this.shadow, 0, 3, 32, 9, (this.absLeft - ((!this.lefty) && 16 || -16)), this.bottom, this.width, 18)

        if (!this.fallen) { // fighter is standing
            const w = this.bounds.w
            const h = this.bounds.h

            if (this.lefty) { // flip our player around
                const cenX = (w / 2)
                const cenY = (h / 2)

                CTX.save()
                CTX.translate((this.absLeft + cenX), (this.top + cenY))
                CTX.scale(-1, 1)
                img(this.img, this.bounds.x, this.bounds.y, w, h, -cenX, -cenY, w, h) // TODO: add fixed lefty offsets for x (specifically, -(w / 2))
                CTX.restore()
            }
            else {
                img(this.img, this.bounds.x, this.bounds.y, w, h, this.absLeft, this.top, w, h)
            }
        }
        else { // fighter has fallen
            const w = this.bounds.w
            const h = this.bounds.h

            const cenX = (w / 2)
            const cenY = (h / 2)

            // Center a pivot point for rotation
            const pivotX = (this.absLeft + cenX)
            const pivotY = (this.top + cenY)

            CTX.save()
            CTX.translate(pivotX, pivotY)

            if (this.lefty) { // Rotate clockwise
                CTX.rotate(Math.PI / 2) // Rotate clockwise for left-facing fighters
                CTX.translate(-cenX, -cenY)
                CTX.scale(-1, 1) // Flip horizontally
            } 
            else { // Rotate counter-clockwise
                CTX.rotate(-(Math.PI / 2))
                CTX.translate(-cenX, -cenY)
            }

            img(this.img, this.bounds.x, this.bounds.y, w, h, ((this.lefty) && -195) || -55, 0, w, h)
            CTX.restore()
        }
        if (DEBUG) super.draw(!this.plr && "rgba(100, 100, 100, 0.5)")
    }

    jump() {
        if (this.grounded && this.canAttack) {
            this.marchLock = true
            this.velocity.y = -18
        }
    }

    onDamage(dmg) { // Ouch! we are taking damage
        this.velocity.x = ((((this.lefty) && 1) || -1) * dmg) // Damage-based knockback
        this.marchLock = true // Stop us from moving

        const aTimer = this.t.attack
        if (aTimer.active) aTimer.stop() // Stop attack timer

        this.hp = clamp((this.hp - dmg), 0, this.maxHP) // Make sure our HP doesn't go below 0

        this.state = "hurt"

        if (this.hp > 0) { // If we are still alive, handle stun timer
            const sTimer = this.t.stun
            sTimer.start()

            if (((dmg >= 4) || !this.grounded) && !this.fallen) { // Heavy damage causing us to fall
                sTimer.duration = 1200
                this.fallen = true
                this.bounces = 3
                this.velocity.y = -10
            }
            else {
                sTimer.duration = 300 // Minor damage causing stun
            }
        }
        else { // We died!
            this.t.stun.start()
            this.state = "hurt"

            this.fallen = true
            this.velocity.y = -15

            if (!this.plr) {
                if (MODE == 1) { // Make enemies fall through the floor
                    this.ignoreGravity = true
                    globalThis.enemiesRemaining--
                    
                    if (globalThis.enemiesRemaining % 10 == 0 || globalThis.enemiesRemaining % 100 == 0) {
                        Animators.remaininggrow.play()
                    }
                    else {
                        Animators.remainingsinglegrow.play()
                    }

                    setTimeout(() => { // remove them to free up memory after a sec
                        this.remove()
                    }, 1000)
                }
            }
            else { // set bounces naturally
                this.bounces = 3
            }
        }

    }

    punch() { 
        if (this.grounded && this.canAttack) {
            this.marchLock = true
            this.state = "punch"

            this.t.attack.start(200)

            this.velocity.x = ((this.lefty) && -2) || 2

            const x = ((!this.lefty) && (this.right + 40)) || (this.left - 60)
            new Hitbox(x, (this.top + 25), 0, 0, 64, 32, "punch", this, 3, 200)
        }
    }

    kick() {
        if (this.canAttack) {
            this.marchLock = true
            this.state = "kick"

            this.t.attack.start(500)

            if (this.grounded) this.velocity.x = 0

            const x = ((!this.lefty) && this.right) || (this.left - 18)
            new Hitbox(x, (this.top + 125), 0, 0, 70, 70, "kick", this, 4, 300)
        }
    }

    fireball() {
        if (this.grounded && this.canAttack) {
            this.marchLock = true

            this.state = "hurt" // just for the looks

            this.t.attack.start(1000)
            this.t.shoot.start()

            if (this.grounded) this.velocity.x = 0
        }
    }

    taunt() {
        if (this.grounded && this.canAttack) {
            this.marchLock = true

            this.state = "taunt"

            this.t.attack.start(1500)

            if (this.grounded) this.velocity.x = 0
        }
    }

    attack() {
        if (this.grounded && this.velocity.x != 0) {
            if (((!this.lefty) && this.velocity.x < 0) || ((this.lefty) && this.velocity.x > 0)) {
                this.fireball()
            }
            else {
                this.punch()
            }
        }
        else {
            if (this.state != "crouch") {
                this.kick()
            }
            else {
                // special
            }
        }
    }

    constructor(x, y, plr, facing = "right", state = "stance", hp = defHP, name = "template") {
        const bounds = stateBounds[state]

        if (!bounds) {
            console.error(`Fighter: Could not find stateBounds for state '${state}'!`)
            return
        }

        super(x, y, 0, 0, bounds.w, bounds.h, true, (!plr))

        this.hp = hp
        this.maxHP = hp

        this.state = state
        this.name = name
        this.plr = plr
        this.img = newImage(`${name}.jpg`)
        this.shadow = newImage("shadow.png")
        this.bounds = bounds
        this.facing = facing

        for (const nm in FighterTimers) this.timers[nm] = new Timer(nm, (FighterTimers[nm]))

        if (this.plr) {
            let binds

            if (this.plr == 1) {
                binds = [
                    {type: "JUMP", key: "SPACE", action: "jump"},
                    {type: "JUMP", key: "W", action: "jump"},
                    {type: "LEFT", key: "A"},
                    {type: "RIGHT", key: "D"},
                    {type: "CROUCH", key: "S"},
                    {type: "ATTACK", key: "P", action: "attack"},
                    {type: "TAUNT", key: "O", action: "taunt"},
                ]
            }
            else { // assuming player 2 since there will not be more than 2 players
                binds = [
                    {type: "JUMP", key: "UP", action: "jump"},
                    {type: "JUMP", key: "ENTER", action: "jump"},
                    {type: "LEFT", key: "LT"},
                    {type: "RIGHT", key: "RT"},
                    {type: "CROUCH", key: "DN"},
                    {type: "ATTACK", key: "PGDN", action: "attack"},
                    {type: "TAUNT", key: "DEL", action: "taunt"}
                ]
            }

            this.controller = new Controller(binds, this)
        }

        Fighters.push(this)
    }
}