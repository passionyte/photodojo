// Passionyte 2025
'use strict'

import { CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, keyClasses, FLOOR } from "./globals.js"
import { Fighter, Fighters, Hitboxes } from "./fighter.js"
import { Animator, Animators, newImage, ImageMemory } from "./animate.js"

let NOW = performance.now()
let frame_time = NOW

// SINGLE PLAYER VARIABLES
export let leftConstraint = 0
export let rightConstraint = w
let enemiesRemaining = 100

const P1 = new Fighter(cenX, FLOOR, 1)

let MODE = 1 // 1 is singleplayer, 2 is multiplayer

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
    if (downKeys[key]) return
  
    downKeys[key] = true
  
    if (keyClasses.jump.includes(key)) { // TODO: should be a 'controller' class maybe
        P1.jump()
    }
    else if (keyClasses.action.includes(key)) {
        if (isKeyFromClassDown(P1.facing)) {
            P1.punch()
        }
        else if (P1.velocity.x == 0 && P1.state != "crouch") {
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

new Animator("enemies", "flashframe", 1000, undefined, 5, singlePlayerIntro)
new Animator("attack", "frame", 200, 500, 11)
new Animator("ready", "frame", 50, 1000, 5)

function singlePlayerIntro(cb) {
    if (!cb) {
        Animators.enemies.play()
    }
    else {
        Animators.ready.play()

        setTimeout(function() {
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

for (let i = 0; (i < 6); i++) newImage(`ready${i}.png`)
for (let i = 0; (i < 12); i++) newImage(`attack${i}.png`)

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

    // Handle fighters

    for (const a of Fighters) {
        if (a.plr) {
            if (a.grounded && !a.t.attack.active && !a.t.stun.active) a.setBaseState()
        }
        else { // NPC
            if (MODE == 1) {
                a.facing = "left"

                // insert AI code here.

                //a.velocity.x = -4
                //if (Math.random() < 0.1) a.kick()
            }
        }
        
        a.update()
    }

    // Handle hitboxes

    for (const h of Hitboxes) {
        for (const a of Fighters) {
            if (a.hp > 0) {
                const col = h.check(a)

                if (col) {
                    a.onDamage(h.dmg, h.position.x)
                    h.remove()
                    break
                }
            }
        }

        h.update()
    }

    // Handle P1 health bar and icon

    CTX.drawImage(ImageMemory["plricon.png"], 0, 0, 32, 32, 35, 25, 64, 64) 
    CTX.drawImage(ImageMemory["healthfill.png"], 0, 0, 128, 16, 112, 40, (158 * (P1.hp / P1.maxHP)), 32)
    CTX.drawImage(ImageMemory["healthbar.png"], 0, 0, 92, 16, 100, 40, 184, 32) 

    // Handle enemy counter

    CTX.drawImage(ImageMemory["enemycounter.png"], 0, 0, 105, 25, (cenX + 350), 40, 210, 50)
    CTX.fillStyle = "yellow"
    CTX.font = "20px Arial"
    CTX.fillText(enemiesRemaining, (cenX + 400), 70, 200)

    // Handle 'Beat 100 enemies'
    const eAnim = Animators.enemies
    if (eAnim.playing) CTX.drawImage(ImageMemory[((!eAnim.flashing) && "100enemies.png") || "100enemiesflash.png"], 0, 0, 1200, 800, (cenX - 150), (cenY - 100), 3000, 2000)

    // Handle 'are you ready'
    const rAnim = Animators.ready
    if (rAnim.times != 0) CTX.drawImage(ImageMemory[`ready${rAnim.times}.png`], 0, 0, 128, 64, (cenX - 250), (cenY - 160), 512, 256)

    // Handle 'Attack!'
    const aAnim = Animators.attack
    if (aAnim.times != 0) CTX.drawImage(ImageMemory[`attack${aAnim.times}.png`], 0, 0, 128, 64, (cenX - 185), (cenY - 120), 400, 200)

    if (DEBUG) {
        CTX.fillStyle = "red"
        CTX.font = "20px Arial"

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
    }
}
update()
if (MODE == 1) singlePlayerIntro()

export default { isKeyFromClassDown }