import { CANVAS, CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, keyClasses, FLOOR } from "./globals.js"
import { Fighter, Fighters } from "./fighter.js"

let NOW = performance.now()
let frame_time = NOW
const P1 = new Fighter(cenX, FLOOR, 1)

globalThis.F = Fighter

// Input Manager
const downKeys = {}

// Event Listeners
document.addEventListener("keydown", keypress);
document.addEventListener("keyup", keyup);

function isKeyFromClassDown(c) {
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
}
  
  /**
   * The user released a key on the keyboard
   */
  
function keyup(event) {
    const key = event.keyCode
    if (!downKeys[key]) return
  
    downKeys[key] = null
}

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

    for (const f of Fighters) {
        if (f.plr == 1) {// temp
            if (f.grounded) {
                let xv = 0
                if (f.state != "crouch" && f.state != "jump") {
                    xv = (((isKeyFromClassDown("left")) && -6) || ((isKeyFromClassDown("right")) && 6)) || 0
                    f.velocity.x = xv
                }
                
                if (xv == 0) f.state = ((isKeyFromClassDown("crouch")) && "crouch") || "stance"
            }
        }
        
        f.update()
    }


    if (DEBUG) {
        CTX.fillStyle = "red"
        CTX.font = "20px Arial"

        const fps = Math.round((TIME_PASSED / MS_PER_FRAME) * FPS)
        CTX.fillText("debug mode", 20, 40, 200)
        CTX.fillText(`fps: ${clamp(fps, 0, FPS)} (${fps})`, 20, 80, 150)
        CTX.fillText(`state: ${P1.state}`, 20, 120, 150)
        CTX.fillText(`x: ${P1.left} (v: ${P1.velocity.x}), y: ${P1.top} (v: ${P1.velocity.y})`, 20, 160, 300)
        CTX.fillText(`grounded: ${P1.grounded}`, 20, 200, 150)

        CTX.fillRect(0, FLOOR, w, 2)
    }
}
update()