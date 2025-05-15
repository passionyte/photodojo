// Passionyte 2025
'use strict'

import { CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, keyClasses, FLOOR, randInt, cloneArray, KEYS } from "./globals.js"
import { Fighter, Fighters, Hitboxes, defHP } from "./fighter.js"
import { Animator, Animators } from "./animate.js"
import { profile, saveData } from "./profile.js"
import { ImageMemory } from "./images.js"

let NOW = performance.now()
let frame_time = NOW

// Fundamental Variables
export let MODE = 1 // 1 is singleplayer, 2 is multiplayer
let gamePlaying = false
let menu = "results"

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
const blackTrans = {
    val: 1
}
let flamenum = 0
let lastFlame = 0

// SINGLE PLAYER VARIABLES

// Enemy Spawning
let distSinceLastGuy = 0
let lastGuySpawned = 0 
const distBetweenGuys = (w / 2)
globalThis.enemiesRemaining = 100

// Results
let timeStarted = 0
let completionTime = 0
let rank = "S"
let pointsStatic = 0
let hpStatic = 0
let enemiesDefeated = 0

// END

// Background Variables
let bg0x = 0
let bg1x = w

let P1

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
  
    if (gamePlaying && P1) {
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
    else {
        if (key == KEYS.SPACE) {
            if (menu == "title") {
                initializeGame()
            }
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
new Animator("clearin", "tween", 250, 4000, {obj: clearText, prop: {x: (cenX - 50)}}, function() {Animators.clearout.play()})
new Animator("clearout", "tween", 250, undefined, {obj: clearText, prop: {x: -100}}, results)
new Animator("blackin", "tween", 500, undefined, {obj: blackTrans, prop: {val: 0}})
new Animator("blackout", "tween", 500, undefined, {obj: blackTrans, prop: {val: 1}})

function determinePoints() { // determines number of points (intended to be used after round, survival only)
    return ((Math.floor((hpStatic / defHP) * 100) * 2) - clamp((completionTime - 150), 0, completionTime)) // consider health and time
}

function determineRank(points = pointsStatic) { // determines rank from points (intended for survival use only)
    let rank = "Fail"

    if (points >= 175) {
        rank = "S"
    }
    else if (points >= 100) {
        rank = "A"
    }
    else if (points >= 50) {
        rank = "B"
    }
    else if (points > 0) {
        rank = "C"
    }

    return rank
}

function results() {
    clearText.visible = false
    Animators.blackin.play()

    setTimeout(function() { // wait until blackin is done
        menu = "results"
        Animators.blackout.play()
    }, 500)

    completionTime = ((NOW - timeStarted) / 1000) // time in seconds

    hpStatic = P1.hp

    enemiesDefeated = (100 - enemiesRemaining)

    pointsStatic = determinePoints()
    rank = determineRank()

    if (enemiesDefeated > profile.best.enemies || (pointsStatic > profile.best.points)) { // save data if results are better than the best
        profile.best.enemies = enemiesDefeated
        profile.best.points = pointsStatic
        profile.best.rank = rank

        saveData()
    }
}

function strToUINum(str, zeroes = 3) { // Converts 96 to 096, or 7 to 007
    let result = ""

    str = str.toString()

    for (let i = 0; (i < (zeroes - str.length)); i++) result += "0"

    result += str

    return result
}

function singlePlayerIntro(cb) {
    if (!cb) {
        Animators.enemies.play()
    }
    else {
        Animators.ready.play()

        setTimeout(function() {
            gamePlaying = true
            Animators.attack.play()
        }, 1050)
    }
}

function initializeGame() {
    P1 = new Fighter(cenX, (FLOOR - 258), 1)
    menu = null

    // (re)set some game variables
    bg0x = 0
    bg1x = w

    if (MODE == 1) {
        distSinceLastGuy = 0
        lastGuySpawned = 0
        globalThis.enemiesRemaining = ((!DEBUG && 100)) || 1

        singlePlayerIntro()
        Animators.nav.play()
    }
    else {

    }
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

    if (!menu) {
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

        if (gamePlaying) {
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
            if (gamePlaying) {
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
                            if (Math.random() < 0.002) a.fireball()
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

        if (gamePlaying) {
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

        let rem = strToUINum((100 - enemiesRemaining))
        for (let i = 0; (i < 3); i++) CTX.drawImage(ImageMemory[`num${rem[i]}.png`], 0, 0, 13, 13, (cenX + 360 + (24 * i)), 52, 27, 27)
        rem = null

        CTX.textAlign = "left"
        CTX.fillStyle = "rgb(255, 255, 152)"
        CTX.font = "24px Humming"
        CTX.fillText("enemies", (cenX + 440), 75, 200)

        // Handle 'Beat 100 enemies'
        let eAnim = Animators.enemies
        if (eAnim.times > -1) CTX.drawImage(ImageMemory[((!eAnim.flashing) && "100enemies.png") || "100enemiesflash.png"], 0, 0, 1200, 800, (cenX - 150), (cenY - 100), 3000, 2000)
        eAnim = null

        // Handle 'are you ready'
        let rAnim = Animators.ready
        if (rAnim.times > -1) CTX.drawImage(ImageMemory[`ready${rAnim.times}.png`], 0, 0, 128, 64, (cenX - 250), (cenY - 160), 512, 256)
        rAnim = null

        // Handle 'Attack!'
        let aAnim = Animators.attack
        if (aAnim.times > -1) CTX.drawImage(ImageMemory[`attack${aAnim.times}.png`], 0, 0, 128, 64, (cenX - 185), (cenY - 120), 400, 200)
        aAnim = null

        // Handle low movement arrows
        let nAnim = Animators.nav
        if (nAnim.times > -1) CTX.drawImage(ImageMemory[`nav${nAnim.times}.png`], 0, 0, 64, 64, (w - 200), (cenY - 75), 128, 128)
    
        if (nAnim.ended && ((NOW - lastGuySpawned) > 5000)) nAnim.play()
        nAnim = null

        // Handle 'victory' clear text

        if (clearText.visible) CTX.drawImage(ImageMemory["clear.png"], 0, 0, 128, 64, (clearText.x - 125), (clearText.y - 25), 400, 200)

        if (!P1.alive || ((SINGLE) && (enemiesRemaining <= 0)) && gamePlaying) {
            gamePlaying = false

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
    else {
        if (menu == "title") {
            CTX.fillStyle = "black"

            CTX.fillRect(0, 0, w, h)
            
            CTX.drawImage(ImageMemory["title.png"], 0, 0, 256, 128, (cenX - 240), (cenY - 350), 512, 256)

            if ((NOW - lastFlame) > 100) {
                if (flamenum < 3) {
                    flamenum++
                }
                else {
                    flamenum = 0
                }

                lastFlame = NOW
            }

            CTX.drawImage(ImageMemory[`flame${flamenum}.png`], 0, 0, w, h, -305, -70, 1810, 1400)

            CTX.textAlign = "center"

            CTX.font = "30px Humming"
            CTX.fillText("Passionyte 2025", cenX, (h - 50), 400)

            CTX.fillStyle = "yellow"
            CTX.fillText("JS", cenX, (cenY - 100), 200)

            CTX.font = "18px Humming"
            CTX.fillText("Press Space to Continue", cenX, (cenY - 25), 400)
        }
        else if (menu == "results") {
            CTX.drawImage(ImageMemory["survivalbg.png"], 0, 0, 256, 256, 0, 0, w, (h * 1.33))

            CTX.beginPath()
            CTX.roundRect((cenX + 100), (cenY - 275), 550, 550, 40)
            CTX.fillStyle = "rgba(0, 0, 0, 0.5)"
            CTX.fill()

            CTX.font = "45px Humming"
            CTX.fillStyle = "white"

            if (rank == "Fail") {
                CTX.font = "50px Humming"
                CTX.fillText("Score", (cenX + 115), (cenY - 200), 200)
                CTX.drawImage(ImageMemory["scoreboxlarge.png"], 0, 0, 128, 38, (cenX + 115), (cenY - 160), 450, 128)

                // draw points
                let strPoints = strToUINum(pointsStatic.toString())

                for (let i = 0; (i < 3); i++) CTX.drawImage(ImageMemory[`score${strPoints[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 110) + (80 * i)), (cenY - 140), 96, 96)

                strPoints = null

                CTX.font = "38px Humming"
                CTX.fillStyle = "black"
                CTX.fillText("enemies", (cenX + 375), (cenY - 60))

                CTX.font = "40px Humming"
                CTX.fillStyle = "white"
                CTX.fillText("Best score", (cenX + 115), (cenY + 100))

                CTX.drawImage(ImageMemory["scoreboxlong.png"], 0, 0, 128, 22, (cenX + 115), (cenY + 125), 450, 75)

                // draw best
                let strBest = strToUINum(profile.best.points.toString())

                for (let i = 0; (i < 3); i++) CTX.drawImage(ImageMemory[`score${strBest[i]}.png`], 0, 0, 32, 32, ((cenX + 185) + (55 * i)), (cenY + 132), 64, 64)

                CTX.font = "32px Humming"
                CTX.fillStyle = "black"
                CTX.fillText("enemies", (cenX + 370), (cenY + 185))

                strBest = null
            }
            else {
                CTX.drawImage(ImageMemory["survivalclear.png"], 0, 0, 512, 256, -400, -200, 1200, 600)

                CTX.fillText("Health", (cenX + 115), (cenY - 200))
                CTX.fillText("Time", (cenX + 115), (cenY - 100))

                CTX.font = "52px Humming"
                CTX.fillText("Rank", (cenX + 115), cenY)

                // health
                CTX.drawImage(ImageMemory["scorebox.png"], 0, 0, 80, 20, (cenX + 300), (cenY - 250), 275, 75)

                let strHP = strToUINum(Math.floor(((hpStatic) / defHP) * 100).toString())
                for (let i = 0; (i < 3); i++) CTX.drawImage(ImageMemory[`score${strHP[i]}.png`], 0, 0, 32, 32, ((cenX + 345) + (40 * i)), (cenY - 235), 48, 48)
                strHP = null

                CTX.font = "38px Humming"
                CTX.fillStyle = "black"
                CTX.fillText("%", (cenX + 480), (cenY - 200))

                // time
                CTX.drawImage(ImageMemory["scorebox.png"], 0, 0, 80, 20, (cenX + 300), (cenY - 150), 275, 75)

                const minutes = Math.round((completionTime / 60))
                const seconds = Math.round(completionTime - (minutes * 60))

                const mS = strToUINum(minutes.toString(), 1)
                const sS = strToUINum(seconds.toString(), 1)

                // draw image numbers
                for (let i = 0; (i < 2); i++) CTX.drawImage(ImageMemory[`score${mS[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 320) + (40 * i)), (cenY - 135), 48, 48)
                for (let i = 0; (i < 2); i++) CTX.drawImage(ImageMemory[`score${sS[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 435) + (40 * i)), (cenY - 135), 48, 48)

                

                // rank
                CTX.drawImage(ImageMemory["scoreboxgreen.png"], 0, 0, 131, 25, (cenX + 115), (cenY + 25), 450, 90)



                CTX.drawImage(ImageMemory[`grade${rank}.png`], 0, 0, 48, 48, (w - 150), (cenY + 150), 144, 144)

                // best

                CTX.font = "40px Humming"
                CTX.fillStyle = "rgb(255, 255, 152)"
                CTX.fillText(`High score ${profile.best.points} pts. ${profile.best.rank}`, (cenX + 100), (h - 50))
            }
        }
    }
    
    // Handle black screen cover

    if (blackTrans.val < 1) {
        CTX.fillStyle = `rgba(0, 0, 0, ${(1 - blackTrans.val)})`
        CTX.fillRect(0, 0, w, h)
    } 
}
update()

export default { isKeyFromClassDown }