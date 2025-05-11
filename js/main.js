// Passionyte 2025
'use strict'

import { CANVAS, CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, keyClasses, FLOOR, newImage, ImageMemory } from "./globals.js"
import { Fighter, Fighters, Hitboxes } from "./fighter.js"

let NOW = performance.now()
let frame_time = NOW
const P1 = new Fighter(cenX, FLOOR, 1)
const P2 = new Fighter((w - 200), FLOOR, false)
P2.velocity.x = 0

globalThis.F = Fighters

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
  
    if (keyClasses.jump.includes(key)) {
        P1.jump()
    }
    else if (keyClasses.action.includes(key)) {
        if (isKeyFromClassDown(P1.facing)) {
            P1.punch()
        }
        else if (P1.velocity.x == 0) {
            P1.kick()
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

// Image preloads

newImage("healthbar.png")
newImage("healthfill.png")
newImage("shadow.png")
newImage("plricon.png")

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
        if (a.plr) {// temp
            if (a.grounded && !a.whenAttacking && !a.whenStunned) a.setBaseStance()
        }
        else { // NPC
            if (MODE == 1) {
                a.facing = "left"

                // insert AI code here.

                //a.velocity.x = -4
                if (Math.random() < 0.1) a.kick()
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
        CTX.fillText(`attacking: ${(P1.whenAttacking != 0)}`, 20, 280, 150)
        CTX.fillText(`stunned: ${(P1.whenStunned != 0)}`, 20, 320, 150)

        CTX.fillRect(0, FLOOR, w, 2)
    }
}
update()

export default { isKeyFromClassDown }