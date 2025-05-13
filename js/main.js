// Passionyte 2025
'use strict'

import { CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, keyClasses, FLOOR, randInt, cloneArray } from "./globals.js"
import { Fighter, Fighters, Hitboxes, defHP } from "./fighter.js"
import { Animator, Animators, newImage, ImageMemory } from "./animate.js"

let NOW = performance.now()
let frame_time = NOW

export let MODE = 1 // 1 is singleplayer, 2 is multiplayer

let playing = false

// Boundary Variables
export const initialLeft = 0
export const initialRight = w
globalThis.leftConstraint = initialLeft
globalThis.rightConstraint = initialRight

// UI Variables
const clearText = {
    x: w,
    y: (cenY - 100),
    visible: false
}

// SINGLE PLAYER VARIABLES

// Enemy Spawning
let distSinceLastGuy = 0
let lastGuySpawned = 0 
const distBetweenGuys = (w / 2)
globalThis.enemiesRemaining = 100

// Results
let timeStarted = 0
let resultsShown = false

// END

// Background Variables
let bg0x = 0
let bg1x = w

const P1 = new Fighter(cenX, (FLOOR - 258), 1)

// Input Manager
const downKeys = {}

// Event Listeners
document.addEventListener("keydown", keypress);
document.addEventListener("keyup", keyup);

export function isKeyFromClassDown(c) {
    let result = false

    const cl = keyClasses[c]
    for (const k of cl) {
        if (downKeys[k]) {
            result = true
            break
        }
    }

    return result
}

/**
* The user pressed a key on the keyboard
*/
function keypress(event) {
    const key = event.keyCode
    if (downKeys[key] || !playing) return
  
    downKeys[key] = true
  
    if (keyClasses.jump.includes(key)) { // TODO: should be a 'controller' class maybe
        P1.jump()
    }
    else if (keyClasses.action.includes(key)) {
        if (isKeyFromClassDown(P1.facing)) {
            P1.punch()
        }
        else if ((P1.velocity.x == 0 || !P1.grounded) && P1.state != "crouch") {
            P1.kick()
        }
        else if (P1.state != "crouch") {
            P1.fireball()
        }
        else { // special move

        }
    }
}
  
/**
* The user released a key on the keyboard
*/
function keyup(event) {
    const key = event.keyCode
    if (!downKeys[key]) return
  
    downKeys[key] = null
}

// UI Animators

new Animator("enemies", "flashframe", 1000, undefined, {goal: 5}, singlePlayerIntro)
new Animator("attack", "frame", 200, 500, {goal: 11})
new Animator("ready", "frame", 50, 1000, {goal: 5})
new Animator("nav", "frame", 250, 500, {goal: 5})
new Animator("clearin", "tween", 250, 2000, {obj: clearText, prop: {x: (cenX + 100)}}, function () {Animators.clearout.play()})
new Animator("clearout", "tween", 250, undefined, {obj: clearText, prop: {x: w}}, results)

function results() {
    clearText.visible = false

    const enemiesDefeated = (100 - enemiesRemaining)
    const hpPerc = Math.floor((P1.hp / defHP) * 100)
    const points = (hpPerc * 2)

    let grade = "Fail"

    if (points >= 175) {
        grade = "S"
    }
    else if (points >= 150) {
        grade = "A+"
    }
    else if (points >= 125) {
        grade = "A"
    }
    else if (points >= 100) {
        grade = "B"
    }
    else if (points >= 60) {
        grade = "C"
    }
    else if (points >= 25) {
        grade = "D"
    }
    else if (points > 0) {
        grade = "E"
    }

    if (grade == "Fail") {

    }
    else {
        
    }

    console.log(`RESULTS!!! HP: ${hpPerc}% | Points: ${points} | Enemies Defeated: ${enemiesDefeated} | Grade: ${grade}`)
}

function strToUINum(str) { // improve later. this is overengineered ain't it.
    let result = ""

    let num = str
    str = str.toString()

    if (num < 100) {
        result += "0"
    }
    else {
        const s = str[0]
        result += s
        str = str.replace(s, "")
    }

    if (num < 10) {
        result += "0"
    }
    else {
        const s = str[0]
        result += s
        str = str.replace(s, "")
    }
    result += str[0]

    return result
}

function singlePlayerIntro(cb) {
    if (!cb) {
        Animators.enemies.play()
    }
    else {
        Animators.ready.play()

        setTimeout(function() {
            playing = true
            Animators.attack.play()
        }, 1050)
    }
}

// Image preloads

newImage("healthbar.png")
newImage("healthfill.png")
newImage("shadow.png")
newImage("plricon.png")
newImage("enemycounter.png")
newImage("100enemies.png")
newImage("100enemiesflash.png")
newImage("background.jpg")
newImage("clear.png")

for (let i = 0; (i < 6); i++) newImage(`ready${i}.png`)
for (let i = 0; (i < 12); i++) newImage(`attack${i}.png`)
for (let i = 0; (i < 10); i++) newImage(`num${i}.png`)
for (let i = 0; (i < 6); i++) newImage(`nav${i}.png`)

function update() {
    requestAnimationFrame(update)

    /*** Desired FPS Trap ***/
    NOW = performance.now()
    const TIME_PASSED = NOW - frame_time
    if (TIME_PASSED < MS_PER_FRAME) return
    const EXCESS_TIME = TIME_PASSED % MS_PER_FRAME
    frame_time = NOW - EXCESS_TIME
    /*** END FPS Trap ***/

    clearCanvas()

    // Handle background

    CTX.drawImage(ImageMemory["background.jpg"], 0, 0, 612, 408, bg0x - leftConstraint, 0, w, h)

    CTX.save() // Save CTX state
    CTX.translate((bg1x - leftConstraint) + (w / 2), 0) // Flip image horizontally
    CTX.scale(-1, 1)
    CTX.translate(-(((bg1x - leftConstraint)) + ( w / 2)) + 600, 0) // restore the position (roughly)
    CTX.drawImage(ImageMemory["background.jpg"], 0, 0, 612, 408, (bg1x - leftConstraint) - (w / 2), 0, w, h) // Draw the 2nd background
    CTX.restore() // Restore CTX state

    if (bg0x < (leftConstraint - w)) bg0x = (bg1x + w)
    if (bg1x < (leftConstraint - w)) bg1x = (bg0x + w)

    const SINGLE = (MODE == 1)

    if (playing) {
        // Single player NPCS

        if (SINGLE) {
            if (enemiesRemaining > 0) {
                if (P1.left > (distSinceLastGuy + (distBetweenGuys - randInt(0, 200)))) {
                    let amt = 1

                    if (enemiesRemaining > 3) amt = randInt(1, 3)

                    for (let i = 0; (i < amt); i++) {
                        const guy = new Fighter(P1.left + w + (i * 200), (FLOOR - 258), undefined, undefined, undefined, 4)
                        guy.enemyType = randInt(1, 3)
                        distSinceLastGuy = P1.left
                        lastGuySpawned = NOW
                    }
                }
            }
            else {
                // win
            }
        }
    }
    
    // Handle fighters

    for (const a of Fighters) {
        if (playing) {
            if (a.plr) {
                if (a.grounded && !a.t.attack.active && !a.t.stun.active) a.setBaseState()
            }
            else { // NPC
                if (SINGLE) {
                    a.facing = "left"
    
                    // Basic AI
                    let movement
    
                    if (a.enemyType == 1) {
                        // kick type
                        movement = 4
                        if (Math.random() < 0.006) a.kick()
                    }
                    else if (a.enemyType == 2) {
                        // fireball type
                        if (Math.random() < 0.004) a.fireball()
                    }
                    else {
                        // punch type
                        movement = 4
                        if (Math.random() < 0.008) a.punch()
                    }
    
                    if (movement &&(a.grounded && !a.t.attack.active && !a.t.stun.active)) a.velocity.x = -movement
                }
            }
        }
        
        a.update()
    }

    if (playing) {
        // Handle hitboxes
        let prev
        let fakeHitboxes = cloneArray(Hitboxes)
        for (const h of fakeHitboxes) {
            for (const a of Fighters) {
                if (a.hp > 0) {
                    const col = h.check(a)

                    if (col) {
                        a.onDamage(h.dmg)
                        h.remove()
                        break
                    }
                }
            }

            if (prev && (prev.type == h.type) && h.check(prev)) {
                h.remove()
                prev.remove()
            }

            prev = h

            h.update()
        }
        fakeHitboxes = null
        prev = null
    }
    

    // Handle P1 health bar and icon

    CTX.drawImage(ImageMemory["plricon.png"], 0, 0, 32, 32, 35, 25, 64, 64) 
    CTX.drawImage(ImageMemory["healthfill.png"], 0, 0, 128, 16, 112, 40, (158 * (P1.hp / P1.maxHP)), 32)
    CTX.drawImage(ImageMemory["healthbar.png"], 0, 0, 92, 16, 100, 40, 184, 32) 

    // Handle enemy counter

    CTX.drawImage(ImageMemory["enemycounter.png"], 0, 0, 105, 25, (cenX + 350), 40, 210, 50)

    for (let i = 0; (i < 3); i++) {
        CTX.drawImage(ImageMemory[`num${strToUINum((100 - enemiesRemaining))[i]}.png`], 0, 0, 13, 13, (cenX + 360 + (24 * i)), 52, 27, 27)
    }

    CTX.fillStyle = "rgb(255, 255, 152)"
    CTX.font = "24px Humming"
    CTX.fillText("enemies", (cenX + 440), 75, 200)

    // Handle 'Beat 100 enemies'
    const eAnim = Animators.enemies
    if (eAnim.times > -1) CTX.drawImage(ImageMemory[((!eAnim.flashing) && "100enemies.png") || "100enemiesflash.png"], 0, 0, 1200, 800, (cenX - 150), (cenY - 100), 3000, 2000)

    // Handle 'are you ready'
    const rAnim = Animators.ready
    if (rAnim.times > -1) CTX.drawImage(ImageMemory[`ready${rAnim.times}.png`], 0, 0, 128, 64, (cenX - 250), (cenY - 160), 512, 256)

    // Handle 'Attack!'
    const aAnim = Animators.attack
    if (aAnim.times > -1) CTX.drawImage(ImageMemory[`attack${aAnim.times}.png`], 0, 0, 128, 64, (cenX - 185), (cenY - 120), 400, 200)

    // Handle low movement arrows
    const nAnim = Animators.nav
    if (nAnim.times > -1) CTX.drawImage(ImageMemory[`nav${nAnim.times}.png`], 0, 0, 64, 64, (w - 200), (cenY - 75), 128, 128)

    if (nAnim.ended && ((NOW - lastGuySpawned) > 5000)) nAnim.play()

    // Handle 'victory' clear text

    if (clearText.visible) CTX.drawImage(ImageMemory["clear.png"], 0, 0, 128, 64, clearText.x, clearText.y, 256, 128)

    if (!P1.alive || ((SINGLE) && (enemiesRemaining <= 0)) && playing) {
        playing = false

        if (P1.alive && SINGLE) {
            clearText.visible = true
            Animators.clearin.play()

            for (const f of Fighters) {
                if (!f.plr && f.alive) f.remove()
            }
        }
    }

    if (DEBUG) {
        CTX.fillStyle = "red"
        CTX.font = "20px Humming"

        const fps = Math.round((TIME_PASSED / MS_PER_FRAME) * FPS)
        CTX.fillText("debug mode", 20, 40, 200)
        CTX.fillText(`fps: ${clamp(fps, 0, FPS)} (${fps})`, 20, 80, 150)
        CTX.fillText(`state: ${P1.state}`, 20, 120, 150)
        CTX.fillText(`x: ${Math.round(P1.left)} (v: ${Math.round(P1.velocity.x)}), y: ${Math.round(P1.top)} (v: ${Math.round(P1.velocity.y)})`, 20, 160, 300)
        CTX.fillText(`grounded: ${P1.grounded}`, 20, 200, 150)
        CTX.fillText(`m-lock: ${P1.marchLock}`, 20, 240, 150)
        CTX.fillText(`attacking: ${(P1.t.attack.active)}`, 20, 280, 150)
        CTX.fillText(`stunned: ${(P1.t.stun.active)}`, 20, 320, 150)

        CTX.fillRect(0, FLOOR, w, 2)

        globalThis.ImageMemory = ImageMemory
        globalThis.Fighters = Fighters
        globalThis.Animators = Animators
    }
}
update()
if (MODE == 1) singlePlayerIntro()
Animators.nav.play()

export default { isKeyFromClassDown }