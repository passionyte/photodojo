// Passionyte 2025

'use strict'

import { CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, keyClasses, FLOOR, randInt, cloneArray, KEYS, img, text } from "./globals.js"
import { Fighter, Fighters, Hitboxes, defHP } from "./fighter.js"
import { Animator, Animators } from "./animate.js"
import { profile, saveData } from "./profile.js"
import { ImageMemory } from "./images.js"

let NOW = performance.now()
let frame_time = NOW

// Fundamental Variables
export let MODE = 1 // 1 is singleplayer, 2 is multiplayer
let gamePlaying = false
let menu = "title"

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
let rank = "Fail"
let pointsStatic = 0
let hpStatic = 0
let enemiesDefeated = 0
let displayingResults = false

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

function determinePoints() { // determines number of points (intended to be used after round, survival only), max is 200 points, min is 1 point
    if (hpStatic <= 0) return 0 // Force 0 if player is dead, no point calculating

    return Math.floor(clamp((((hpStatic / defHP) * 100 * 2) - clamp((completionTime - 180), -completionTime, completionTime)), 1, 200)) // consider health and time
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
    if (displayingResults) return // Don't run more than what is necessary

    displayingResults = true
    clearText.visible = false
    Animators.blackin.play()

    completionTime = Math.floor(((NOW - timeStarted) / 1000)) // time in seconds

    hpStatic = P1.hp

    enemiesDefeated = (100 - enemiesRemaining)

    pointsStatic = determinePoints()
    rank = determineRank()

    console.log(`Results: Rank: ${rank} Points: ${pointsStatic} Pts. HP: ${hpStatic} Enemies Defeated: ${enemiesDefeated} Time: ${completionTime}`)

    if (enemiesDefeated > profile.best.enemies || (pointsStatic > profile.best.points)) { // save data if results are better than the best
        profile.best.enemies = enemiesDefeated
        profile.best.points = pointsStatic
        profile.best.rank = rank

        saveData(profile)
    } 

    setTimeout(function() { // wait until blackin is done
        menu = "results"
        Animators.blackout.play()
    }, 500)
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
        globalThis.enemiesRemaining = 100

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

        img(ImageMemory["background.jpg"], 0, 0, 612, 408, bg0x - leftConstraint, 0, w, h)

        CTX.save() // Save CTX state
        CTX.translate((bg1x - leftConstraint) + (w / 2), 0) // Flip image horizontally
        CTX.scale(-1, 1)
        CTX.translate(-(((bg1x - leftConstraint)) + ( w / 2)) + 600, 0) // restore the position (roughly)
        img(ImageMemory["background.jpg"], 0, 0, 612, 408, (bg1x - leftConstraint) - (w / 2), 0, w, h) // Draw the 2nd background
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

                        if (enemiesRemaining > 3) amt = randInt(1, 3) // Ensures that we don't generate enemies after the remaining number reaches 0

                        for (let i = 0; (i < amt); i++) { // Generate the enemies, set their type and set distance and time to now
                            const guy = new Fighter(P1.left + w + (i * 200), (FLOOR - 258), undefined, undefined, undefined, 4)
                            guy.enemyType = randInt(1, 200)
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
        
                        if (a.canAttack) {
                            if (a.enemyType <= 50) {
                                // kick type
                                movement = 4
                                if (Math.random() < 0.004) a.kick()
                            }
                            else if (a.enemyType >= 175) {
                                // fireball type
                                if (Math.random() < 0.002) a.fireball()
                            }
                            else {
                                // punch type
                                movement = 4
                                if (Math.random() < 0.008) a.punch()
                            }
                        }
        
                        if (movement && (a.alive && !a.t.attack.active && !a.t.stun.active)) a.velocity.x = -movement
                    }
                }
            }
            
            a.update()
        }

        if (gamePlaying) {
            // Handle hitboxes
            let fakeHitboxes = cloneArray(Hitboxes)
            for (const h of fakeHitboxes) {
                for (const a of Fighters) {
                    if (a.alive) {
                        const col = h.check(a)

                        if (col) {
                            a.onDamage(h.dmg)

                            if (h.type == "fireball") h.remove()
                            break
                        }
                    }
                }

                if (h.type == "fireball") {
                    Hitboxes.forEach(h1 => {
                        if (h1 != h && ((h1.type == h.type) && h.check(h1))) {
                            h.remove()
                            h1.remove()
                        }
                    })
                }
                
                h.update()
            }
            fakeHitboxes = null
        }
        
        // Handle P1 health bar and icon

        img(ImageMemory["plricon.png"], 0, 0, 32, 32, 35, 25, 64, 64) 
        img(ImageMemory["healthfill.png"], 0, 0, 128, 16, 112, 40, (158 * (P1.hp / P1.maxHP)), 32)
        img(ImageMemory["healthbar.png"], 0, 0, 92, 16, 100, 40, 184, 32) 

        // Handle enemy counter

        img(ImageMemory["enemycounter.png"], 0, 0, 105, 25, (cenX + 350), 40, 210, 50)

        let rem = strToUINum((100 - enemiesRemaining))
        for (let i = 0; (i < 3); i++) img(ImageMemory[`num${rem[i]}.png`], 0, 0, 13, 13, (cenX + 360 + (24 * i)), 52, 27, 27)
        rem = null

        CTX.textAlign = "left"
        CTX.fillStyle = "rgb(255, 255, 152)"
        CTX.font = "24px Humming"
        text("enemies", (cenX + 440), 75, 200)

        // Handle 'Beat 100 enemies'
        let eAnim = Animators.enemies
        if (eAnim.times > -1) img(ImageMemory[((!eAnim.flashing) && "100enemies.png") || "100enemiesflash.png"], 0, 0, 1200, 800, (cenX - 150), (cenY - 100), 3000, 2000)
        eAnim = null

        // Handle 'are you ready'
        let rAnim = Animators.ready
        if (rAnim.times > -1) img(ImageMemory[`ready${rAnim.times}.png`], 0, 0, 128, 64, (cenX - 250), (cenY - 160), 512, 256)
        rAnim = null

        // Handle 'Attack!'
        let aAnim = Animators.attack
        if (aAnim.times > -1) img(ImageMemory[`attack${aAnim.times}.png`], 0, 0, 128, 64, (cenX - 185), (cenY - 120), 400, 200)
        aAnim = null

        // Handle low movement arrows
        let nAnim = Animators.nav
        if (nAnim.times > -1) img(ImageMemory[`nav${nAnim.times}.png`], 0, 0, 64, 64, (w - 200), (cenY - 75), 128, 128)
    
        if (nAnim.ended && ((NOW - lastGuySpawned) > 5000)) nAnim.play()
        nAnim = null

        // Handle 'victory' clear

        if (clearText.visible) img(ImageMemory["clear.png"], 0, 0, 128, 64, (clearText.x - 125), (clearText.y - 25), 400, 200)

        if (!P1.alive || ((SINGLE) && (enemiesRemaining <= 0)) && gamePlaying) {
            gamePlaying = false

            if (P1.alive && SINGLE) {
                clearText.visible = true
                Animators.clearin.play()

                for (const f of Fighters) {
                    if (!f.plr && f.alive) f.remove()
                }
            }
            else {
                setTimeout(results, 3000)
            }
        }

        if (DEBUG) {
            CTX.fillStyle = "red"
            CTX.font = "20px Humming"

            text(`state: ${P1.state}`, 20, 120, 150)
            text(`x: ${Math.round(P1.left)} (v: ${Math.round(P1.velocity.x)}), y: ${Math.round(P1.top)} (v: ${Math.round(P1.velocity.y)})`, 20, 160, 300)
            text(`grounded: ${P1.grounded}`, 20, 200, 150)
            text(`m-lock: ${P1.marchLock}`, 20, 240, 150)
            text(`attacking: ${(P1.t.attack.active)}`, 20, 280, 150)
            text(`stunned: ${(P1.t.stun.active)}`, 20, 320, 150)

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
            
            img(ImageMemory["title.png"], 0, 0, 256, 128, (cenX - 240), (cenY - 350), 512, 256)

            if ((NOW - lastFlame) > 100) {
                if (flamenum < 3) {
                    flamenum++
                }
                else {
                    flamenum = 0
                }

                lastFlame = NOW
            }

            img(ImageMemory[`flame${flamenum}.png`], 0, 0, w, h, -305, -70, 1810, 1400)

            CTX.textAlign = "center"

            CTX.font = "30px Humming"
            text("Passionyte 2025", cenX, (h - 50), 400)

            CTX.fillStyle = "yellow"
            text("JS", cenX, (cenY - 100), 200)

            CTX.font = "18px Humming"
            text("Press Space to Continue", cenX, (cenY - 25), 400)
        }
        else if (menu == "results") {
            img(ImageMemory["survivalbg.png"], 0, 0, 256, 256, 0, 0, w, (h * 1.33))

            CTX.beginPath()
            CTX.roundRect((cenX + 100), (cenY - 275), 550, 550, 40)
            CTX.fillStyle = "rgba(0, 0, 0, 0.5)"
            CTX.fill()

            CTX.font = "45px Humming"
            CTX.fillStyle = "white"

            if (rank == "Fail") { // Player failed the survival mode
                CTX.font = "50px Humming"
                text("Score", (cenX + 115), (cenY - 200), 200)
                img(ImageMemory["scoreboxlarge.png"], 0, 0, 128, 38, (cenX + 115), (cenY - 160), 450, 128)

                // score
                let strDefeated = strToUINum(enemiesDefeated)

                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strDefeated[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 110) + (80 * i)), (cenY - 140), 96, 96)

                strDefeated = null

                CTX.font = "38px Humming"
                CTX.fillStyle = "black"
                text("enemies", (cenX + 375), (cenY - 60))

                CTX.font = "40px Humming"
                CTX.fillStyle = "white"
                text("Best score", (cenX + 115), (cenY + 100))

                img(ImageMemory["scoreboxlong.png"], 0, 0, 128, 22, (cenX + 115), (cenY + 125), 450, 75)

                // best
                let strBest = strToUINum(profile.best.enemies)

                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strBest[i]}.png`], 0, 0, 32, 32, ((cenX + 185) + (55 * i)), (cenY + 132), 64, 64)

                CTX.font = "32px Humming"
                CTX.fillStyle = "black"
                text("enemies", (cenX + 370), (cenY + 185))

                strBest = null
            }
            else { // Player cleared the survival mode
                img(ImageMemory["survivalclear.png"], 0, 0, 512, 256, -400, -200, 1200, 600)

                text("Health", (cenX + 115), (cenY - 200))
                text("Time", (cenX + 115), (cenY - 100))

                CTX.font = "52px Humming"
                text("Rank", (cenX + 115), cenY)

                // health
                img(ImageMemory["scorebox.png"], 0, 0, 80, 20, (cenX + 300), (cenY - 250), 275, 75)

                let strHP = strToUINum(Math.floor(((hpStatic) / defHP) * 100))
                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strHP[i]}.png`], 0, 0, 32, 32, ((cenX + 345) + (40 * i)), (cenY - 235), 48, 48)
                strHP = null

                CTX.font = "38px Humming"
                CTX.fillStyle = "black"
                text("%", (cenX + 480), (cenY - 200))

                // time
                img(ImageMemory["scorebox.png"], 0, 0, 80, 20, (cenX + 300), (cenY - 150), 275, 75)

                let minutes = Math.floor((completionTime / 60)) // Determines number of minutes
                let seconds = Math.round(completionTime - (minutes * 60)) // Determines number of seconds

                let strMins = strToUINum(minutes, 2)
                let strSecs = strToUINum(seconds, 2)

                // draw image numbers
                for (let i = 0; (i < 2); i++) img(ImageMemory[`score${strMins[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 320) + (40 * i)), (cenY - 135), 48, 48)
                for (let i = 0; (i < 2); i++) img(ImageMemory[`score${strSecs[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 445) + (40 * i)), (cenY - 135), 48, 48)

                strMins = null, minutes = null, seconds = null, strSecs = null

                CTX.font = "26px Humming"
                text("M.", (cenX + 400), (cenY - 95))
                text("s.", (cenX + 525), (cenY - 95))

                // rank
                img(ImageMemory["scoreboxgreen.png"], 0, 0, 131, 25, (cenX + 115), (cenY + 25), 450, 90)

                let strPoints = strToUINum(pointsStatic)

                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strPoints[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 200) + (64 * i)), (cenY + 35), 72, 72)

                strPoints = null

                CTX.font = "40px Humming"
                text("Pts.", (cenX + 400), (cenY + 90))

                img(ImageMemory[`grade${rank}.png`], 0, 0, 48, 48, (w - 150), (cenY + 150), 144, 144)

                // best

                CTX.font = "40px Humming"
                CTX.fillStyle = "rgb(255, 255, 152)"
                text(`High score ${profile.best.points} pts. ${profile.best.rank}`, (cenX + 100), (h - 50))
            }
        }
    }
    
    // Handle black screen cover

    if (blackTrans.val < 1) {
        CTX.fillStyle = `rgba(0, 0, 0, ${(1 - blackTrans.val)})`
        CTX.fillRect(0, 0, w, h)
    } 

    if (DEBUG) {
        CTX.textAlign = "left"
        CTX.fillStyle = "red"
        CTX.font = "20px Humming"

        const fps = Math.round((TIME_PASSED / MS_PER_FRAME) * FPS)
        text("debug mode", 20, 40, 200)
        text(`fps: ${clamp(fps, 0, FPS)} (${fps})`, 20, 80, 150)
    }
}
update()

export default { isKeyFromClassDown }