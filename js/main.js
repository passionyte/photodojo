/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: main.js
 * Description: The core script that makes the game tick. Handles everything between UI, enemies, and utilizing the other modules.
 *
 * Author: Logan
 */

'use strict'

import {
    CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, FLOOR, randInt, cloneArray, img, text, frect, font, 
    fstyle, VERSION, adtLen, promptUpload, parse, stringify
} from "./globals.js"
import { Fighter, Fighters, Hitboxes, defHP } from "./fighter.js"
import { Animator, Animators, Timers } from "./animate.js"
import { profile, saveData, exportData, importData, imported, filename } from "./profile.js"
import { ImageMemory, newImage } from "./images.js"
import { SoundMemory, stopSound, playSound } from "./sounds.js"
import { KEYS } from "./controller.js"
import { Button, Buttons, getButton, menuButtons, selectNew, sbuttonbounds, mbuttonbounds, lbuttonbounds, titlebuttonbounds } from "./button.js"
import { Notes, modeDescriptions, menuTitles, Messages } from "./notes.js"
import { Particles } from "./particle.js"
import { Camera } from "./camera.js"
import { Game } from "./game.js"

export let GAME = new Game()

// Misc Variables
let curCam
let curPic
let backgroundSlot
let loadingComplete = false
let prePauseTimers = {}
let downKeys = {}

let vW
let vH
let dW
let dH

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
const enemiesBubble = {
    size: 2, // def: 1
}
const eRemaining = {
    size0: 1,
    size1: 1,
    size2: 1
}
const createNote = {
    strs: {},
    goals: Notes.createselect
}
const msgBox = {
    x: w,
    y: (cenY - 125),
    visible: false,
    text: {},
    pass: false
}
let flamenum = 0
let lastFlame = 0

// UI Buttons

let buttonLayout // for non-menu buttons

// title screen
new Button("battle", "title", "battlebutton.png", {press: "titlebutton.wav"}, titlebuttonbounds, (cenX + 56), cenY, function() {
    GAME.menu = "modeselect"
})
new Button("create", "title", "createbutton.png", {press: "titlebutton.wav"}, titlebuttonbounds, (cenX - 280), cenY, function() {
    Animators.blackin.play()
    setTimeout(function() {
        GAME.menu = "createselect"
        Animators.blackout.play()
    }, 1000)
})
// mode select
new Button("versus", "modeselect", "vsbutton.png", undefined, titlebuttonbounds, (cenX - 280), cenY, function() {
    loadGame(2)
})
new Button("survival", "modeselect", "survivalbutton.png", undefined, titlebuttonbounds, (cenX + 56), cenY, loadGame)
new Button("modeback", "modeselect", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "titlecancel.wav"}, sbuttonbounds, 125, (h - 255), function() {
    GAME.menu = "title"
}, {text: "Back", font: "Humming", size: 30})
// create select
new Button("createselectback", "createselect", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    Animators.blackin.play()
    setTimeout(function() {
        createNote.strs = {}
        GAME.menu = "title"
        Animators.blackout.play()
    }, 1000)
}, {text: "Back", font: "Humming", size: 30})
new Button("newfighter", "createselect", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 125, function() {
    Animators.blackin.play()
    setTimeout(function() {
        createNote.strs = {}
        GAME.menu = "fighternext"
        Animators.blackout.play()
    }, 1000)
}, {text: "Make a new fighter!", font: "Humming", size: 28})
new Button("editfighter", "createselect", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 275, function() {
    Animators.blackin.play()
    setTimeout(function() {
        // open the fighter edit menu...
        createNote.strs = {}
        Animators.blackout.play()
    }, 1000)
}, {text: "Edit a fighter!", font: "Humming", size: 28})
new Button("createbg", "createselect", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 425, function() {
    Animators.blackin.play()
    setTimeout(function() {
        GAME.menu = "createbg"
        createNote.strs = {}
        Animators.blackout.play()
    }, 1000)
}, {text: "Create background!", font: "Humming", size: 28})
// fighter photo type
new Button("webcam", "capturesel", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 125, function() {
    // take photos to make fighter
    createNote.strs = {}
}, {text: "Web Cam", font: "Humming", size: 28})
new Button("upload", "capturesel", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 275, function() {
    createNote.strs = {}
    GAME.menu = "uploadsel"
}, {text: "Upload", font: "Humming", size: 28})
new Button("captureselback", "capturesel", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    createNote.strs = {}
    GAME.menu = "fighternext"
}, {text: "Back", font: "Humming", size: 30})
// fighter next
new Button("fighternext", "fighternext", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), (cenY - 96), function() {
    createNote.strs = {}
    GAME.menu = "capturesel"
}, {text: "Next", font: "Humming", size: 28})
new Button("fighternextback", "fighternext", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    Animators.blackin.play()
    setTimeout(function() {
        createNote.strs = {}
        GAME.menu = "createselect"
        Animators.blackout.play()
    }, 1000)
}, {text: "Back", font: "Humming", size: 30})
// upload image selection
new Button("individual", "uploadsel", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 125, function() {
    Animators.blackin.play()
    setTimeout(function() {
        // upload pics to make fighter!
        createNote.strs = {}
        Animators.blackout.play()
    }, 1000)
}, {text: "Individual", font: "Humming", size: 28})
new Button("template", "uploadsel", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 275, function() {
    // prompt template upload
}, {text: "Template", font: "Humming", size: 28})
new Button("uploadselback", "uploadsel", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    createNote.strs = {}
    GAME.menu = "capturesel"
}, {text: "Back", font: "Humming", size: 30})
// create bg back
new Button("createbgback", "createbg", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    Animators.blackin.play()
    setTimeout(function() {
        createNote.strs = {}
        GAME.menu = "createselect"
        Animators.blackout.play()
    }, 1000)
}, {text: "Back", font: "Humming", size: 30})
// bg buttons
for (let z = 0; (z < 8); z++) {
    const row = Math.floor((z / 3))
    new Button(`bg${z}`, "createbg", {i: "bgbutton.png", s: "bgbuttonsel.png", p: "bgbuttonpress.png"}, {press: "createbutton.wav"}, {
        x: 0, y: 0, w: 59, h: 59
    }, (cenX + 59) + (150 * (z - (row * 3))), (150 + (150 * row)), function() {
        buttonLayout = ((!imported.backgrounds[z]) && "newbackground") || "backgroundedit"
        backgroundSlot = z
        menuButtons(GAME.menu).forEach(b => {
            b.active = false
            b.state = "i"
        })
    })
}
// upload image selection
new Button("webcambg", "newbackground", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 125, function() {
    buttonLayout = "backgroundcapture"
    menuButtons(GAME.menu).forEach(b => {
        b.active = false
        b.state = "i"
    })
    if (!curCam) {
        messageBox(Messages.camera, true)
        curCam = new Camera()
    }
    curCam.init()
}, {text: "Web Cam", font: "Humming", size: 28})
// upload image selection
new Button("uploadbg", "newbackground", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 275, function() {
    // upload background

}, {text: "Upload", font: "Humming", size: 28})
// create bg
new Button("bgseltypeback", "newbackground", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    buttonLayout = null
    if (curCam) curCam.stop()
    menuButtons(GAME.menu).forEach(b => {
        b.active = true
    })
}, {text: "Back", font: "Humming", size: 30})
// create bg quit
new Button("bgcapquit", "backgroundcapture", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    buttonLayout = null
    if (curCam) curCam.stop()
    menuButtons(GAME.menu).forEach(b => {
        b.active = true
    })
}, {text: "Quit", font: "Humming", size: 30})
// create bg take photo
new Button("bgtake", "backgroundcapture", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), (cenY - 96), function() {
    if (curCam) {
        const photo = curCam.photo()
        if (photo) {
            buttonLayout = "backgroundsave"
            curPic = newImage(photo, true)
            curCam.stop()
        }
    }
}, {text: "Take photo", font: "Humming", size: 28})
// save bg quit
new Button("bgsavequit", "backgroundsave", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    buttonLayout = null
    curPic = null
    menuButtons(GAME.menu).forEach(b => {
        b.active = true
    })
}, {text: "Quit", font: "Humming", size: 30})
// save bg
new Button("bgsave", "backgroundsave", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 125, function() {
    buttonLayout = null

    imported.backgrounds[backgroundSlot] = stringify({
        src: curPic.src,
        w: vW,
        h: vH,
    })
    curPic = null
    backgroundSlot = null

    menuButtons(GAME.menu).forEach(b => {
        b.active = true
    })
}, {text: "Save", font: "Humming", size: 28})
new Button("bgtryagain", "backgroundsave", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 275, function() {
    curPic = null
    curCam.init()
    buttonLayout = "backgroundcapture"
}, {text: "Try again", font: "Humming", size: 28})
// edit background
new Button("editbgtryagain", "backgroundedit", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 225, function() {
    buttonLayout = "newbackground"
}, {text: "Try again", font: "Humming", size: 28})
new Button("editbgdelete", "backgroundedit", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX + 100), 403, function() {
    buttonLayout = null
    imported.backgrounds[backgroundSlot] = null
    backgroundSlot = null
    messageBox("Deleted!", true)

    menuButtons(GAME.menu).forEach(b => {
        b.active = true
    })
}, {text: "Delete", font: "Humming", size: 28})
new Button("editbgback", "backgroundedit", {i: "sbutton.png", s: "sbuttonsel.png", p: "sbuttonpress.png"}, {press: "createcancel.wav"}, sbuttonbounds, (cenX + 50), (h - 200), function() {
    buttonLayout = null
    menuButtons(GAME.menu).forEach(b => {
        b.active = true
    })
}, {text: "Back", font: "Humming", size: 30})
// import/export
new Button("export", "title", {i: "mbutton.png", s: "mbuttonsel.png", p: "mbuttonpress.png"}, 
{press: "createbutton.wav"}, mbuttonbounds, (cenX + 25), (cenY + 250), exportData, {text: "Export data", font: "Humming", size: 24})
new Button("import", "title", {i: "mbutton.png", s: "mbuttonsel.png", p: "mbuttonpress.png"}, 
{press: "createbutton.wav"}, mbuttonbounds, (cenX - 225), (cenY + 250), function() {
    const input = promptUpload()

    input.onchange = event => {
        // only check for first file... should be a txt.
        const exports = event.target.files[0]
        if (exports) {
            if (exports.name.includes(filename)) {
                // ok... it's valid let's use filereader
                const fr = new FileReader()
                fr.readAsText(exports, "UTF-8")

                fr.onload = event => {
                    // import data.
                    const result = importData(event.target.result)
                    messageBox({
                        [0]: "Successfully imported:",
                        [1]: `${adtLen(result.fighters)} fighters and ${adtLen(result.backgrounds)} backgrounds.`,
                        [2]: `Data size: ${exports.size}`
                    }, true)
                }
            }
        }
        input.remove()
    }
}, {text: "Import data", font: "Humming", size: 24})
// pause menu
new Button("return", "pause", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX - 125), (cenY), endMatch, {text: "Return to title screen!", font: "Humming", size: 24})
new Button("controls", "pause", {i: "lbutton.png", s: "lbuttonsel.png", p: "lbuttonpress.png"}, 
{press: "createbutton.wav"}, lbuttonbounds, (cenX - 125), (cenY + 208), endMatch, {text: "Controls", font: "Humming", size: 24})

globalThis.curSelected = getButton("battle")
globalThis.curSelected.state = "s"

// SINGLE PLAYER VARIABLES

// Enemy Spawning
let distSinceLastGuy = 0
let lastGuySpawned = 0
globalThis.enemiesRemaining = 100

// Results
let timeStarted = 0
let completionTime = 0
let rank = "Fail"
let pointsStatic = 0
let hpStatic = 0
let enemiesDefeated = 0
let displayingResults = false

// Background Variables
let bg0x = 0
let bg1x = w

let P1
let P2
let a1 // represents P1.alive for vs results
let a2 // represents P2.alive for vs results

// END

// Menu Input Handler

// Event Listeners
document.addEventListener("keydown", keypress)
document.addEventListener("keyup", keyup)

function keyup(event) {
    const key = event.keyCode

    if (downKeys[key]) downKeys[key] = false
}

function keypress(event) {
    const key = event.keyCode

    if (downKeys[key]) return
    downKeys[key] = true

    if (msgBox.visible && msgBox.pass) {
        playSound("titlecancel.wav")
        Animators.msgboxpass.play()

        if (msgBox.callback) msgBox.callback()

        return
    }

    if ((GAME.menu || (buttonLayout)) && (blackTrans.val >= 1)) {
        if (key == KEYS.SPACE) {
            if (globalThis.curSelected && (GAME.menu == globalThis.curSelected.menu || buttonLayout == globalThis.curSelected.menu) && (globalThis.curSelected.canpress && globalThis.curSelected.active)) { // push the button
                globalThis.curSelected.canpress = false
                globalThis.curSelected.press()
            }
        }
        else { // Button navigation based on WASD keys
            const dir = ((key == KEYS.A) && "LEFT") || ((key == KEYS.D) && "RIGHT") || ((key == KEYS.W) && "UP") || ((key == KEYS.S) && "DOWN")
            
            if (dir) {
                const mB = menuButtons(GAME.menu, buttonLayout)

                let selB
                for (const b of mB) {
                    if (b.state != "locked" && b.active) {
                        if (selectNew(dir, selB, globalThis.curSelected, b)) { // compare x or y differences based on direction
                            selB = b
                        }
                    }
                }
                if (selB) { // set currently selected button to idle, then overwrite with new button and select it
                    globalThis.curSelected.state = "i"
                    globalThis.curSelected = selB
                    selB.select()
                }
            }
        }
    }
    
    if (!GAME.menu) {
        if (key == KEYS.BACKSPACE) { // pause/unpause game
            if (GAME.started) {
                GAME.paused = (!GAME.paused)
                buttonLayout = ((GAME.paused) && "pause") || null

                if (GAME.paused) {
                    playSound("pause.wav", true)
                    for (const t of Timers) { // stop active timers
                        if (t.active) {
                            t.stop()
                            prePauseTimers[(t.duration - (GAME.now - t.began))] = t // assign our timer to the time since starting
                        }
                    }
                }
                else { // resume pre-pause timers
                    playSound("resume.wav", true)
                    for (const i in prePauseTimers) prePauseTimers[i].start(i) // restart timer from this point
                    prePauseTimers = {} // clear memory
                }
            }
        }
    }
}

// UI Animators

/*
* frame: animates a sprite sheet
* flashframe: animates a sprite sheet, but flashes the frame (specific usage*)
* tween: animates properties of an object
* typeout: animates a string, letter by letter
*/

new Animator("enemies", "tween", 200, 1, { obj: enemiesBubble, prop: { size: 1 } }, enemiesCallback)
new Animator("enemiesflash", "flashframe", 1000, 1, { goal: 5 }, singlePlayerIntro)
new Animator("attack", "frame", 200, 500, { goal: 11 })
new Animator("ready", "frame", 50, 1000, { goal: 5 })
new Animator("nav", "frame", 250, 500, { goal: 5 })
new Animator("clearin", "tween", 250, 4000, { obj: clearText, prop: { x: (cenX - 50) } }, function() { Animators.clearout.play() })
new Animator("clearout", "tween", 250, 1, { obj: clearText, prop: { x: -100 } }, results)
new Animator("blackin", "tween", 500, 1, { obj: blackTrans, prop: { val: 0 } })
new Animator("blackout", "tween", 500, 1, { obj: blackTrans, prop: { val: 1 } })
new Animator("remainingsinglegrow", "tween", 100, 1, { obj: eRemaining, prop: { size2: 2 }}, function() { Animators.remainingsingleshrink.play() })
new Animator("remaininggrow", "tween", 100, 1, { obj: eRemaining, prop: { size0: 2, size1: 2, size2: 2}}, function() { Animators.remainingshrink.play() })
new Animator("remainingsingleshrink", "tween", 100, 1, { obj: eRemaining, prop: { size2: 1 } })
new Animator("remainingshrink", "tween", 100, 1, { obj: eRemaining, prop: { size0: 1, size1: 1, size2: 1}})
new Animator("loading", "frame", 1000, 1, { goal: 7 })
new Animator("createnote", "typeout", 2000, 1, { obj: createNote, snd: "text.wav" })
new Animator("msgbox", "tween", 400, 1, { obj: msgBox, prop: { x: ((cenX - 208)) } })
new Animator("msgboxpass", "tween", 200, 1, { obj: msgBox, prop: { x: -416 } }, function() { 
    msgBox.visible = false 
    msgBox.text = "" } )

// Functions

function endMatch(menu = "title", bl) {
    Animators.blackin.play()
    setTimeout(function() {
        GAME.menu = menu
        GAME.started = false
        GAME.controls = false

        buttonLayout = bl
        P1 = null
        P2 = null
        for (const f of Fighters) {
            console.log(f)
            f.remove()
        }
        console.log(Fighters)
        for (const h of Hitboxes) h.remove()
        for (const t of Timers) t.stop()
        for (const p of Particles) p.remove()
        for (let a in Animators) {
            a = Animators[a]
            if (a != Animators.blackin && a != Animators.blackout) a.stop(true)
        }
        Animators.blackout.play()
    }, 1000)
}

function messageBox(strs, pass, cb) {
    playSound("attention.wav")

    msgBox.visible = true
    msgBox.x = w
    msgBox.pass = (pass)
    msgBox.text = strs
    msgBox.callback = cb

    Animators.msgbox.play()
}

function determineAutoSelect(b) {
    if (globalThis.curSelected.menu != GAME.menu && (!buttonLayout || globalThis.curSelected.menu != buttonLayout) && (b.state != "l")) { // Always select a button that is *not* locked from a new menu
        globalThis.curSelected.state = "i"
        globalThis.curSelected = b
        b.canpress = true
        b.state = "s"
    }
}

function queueNote() {
    const cnAnim = Animators.createnote

    if (!createNote.strs) { // if null or undefined, set appropriately
        createNote.strs = {}
    }
    else if (!cnAnim.playing && (adtLen(createNote.strs) == 0)) { // if not playing and strs is blank, set goals and play
        createNote.goals = Notes[GAME.menu] || Notes.na
        cnAnim.play()
    }
    else { // else render
        CTX.textAlign = "left"

        fstyle("black")
        font("30px Humming")

        for (let i = 0; (i < adtLen(createNote.strs)); i++) {
            const c = createNote.strs[i]
            if (c) text(c, 50, (200 + (i * 64)))
        }
    }
}

function loadGame(m = 1) {
    stopSound("title.mp3")

    GAME.mode = m

    GAME.menu = "loading"
    GAME.nextMenu = null

    setTimeout(function() {
        loadingComplete = true
        initializeGame(500)
    }, 2000)

    blackTrans.val = 0
    Animators.blackout.play()
}

function determinePoints() { // determines number of points (intended to be used after round, survival only), max is 200 points, min is 1 point
    if (hpStatic <= 0) return 0 // Force 0 if player is dead, no point calculating

    return Math.floor(clamp((((hpStatic / defHP) * 100 * 2) - clamp((completionTime - 180), -completionTime, completionTime)), 1, 200)) // consider health and time
}

function determineRank(points = pointsStatic) { // determines rank from points (intended for survival use only)
    let rank = "Fail"

    if (points >= 175) {
        rank = "S"
    }
    else if (points >= 150) {
        rank = "AAA"
    }
    else if (points >= 125) {
        rank = "AA"
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

    completionTime = Math.floor(((GAME.now - timeStarted) / 1000)) // time in seconds

    hpStatic = P1.hp

    enemiesDefeated = (100 - enemiesRemaining)

    pointsStatic = determinePoints()
    rank = determineRank()

    if (DEBUG) console.log(`Results: Rank: ${rank} Points: ${pointsStatic} Pts. HP: ${hpStatic} Enemies Defeated: ${enemiesDefeated} Time: ${completionTime}`)

    if (enemiesDefeated > profile.best.enemies || (pointsStatic > profile.best.points)) { // save data if results are better than the best
        profile.best.enemies = enemiesDefeated
        profile.best.points = pointsStatic
        profile.best.rank = rank

        saveData(profile)
    }

    setTimeout(function() { // wait until blackin is done
        GAME.menu = "results"
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

function enemiesCallback() {
    playSound("100enemies.wav")
    Animators.enemiesflash.play()
}

function singlePlayerIntro(cb) {
    if (!cb) {
        Animators.enemies.play()
    }
    else {
        playSound("ready.wav")
        Animators.ready.play()

        setTimeout(function () {
            playSound("go.wav")
            GAME.started = true
            GAME.controls = true
            timeStarted = GAME.now
            Animators.attack.play()
        }, 1050)
    }
}

function versusIntro() {
    playSound("ready.wav")
    Animators.ready.play()

    setTimeout(function () {
        playSound("go.wav")
        GAME.started = true
        GAME.controls = true
        timeStarted = GAME.now
        Animators.attack.play()
    }, 1050)
}

function initializeGame(delay) {
    // (re)set some game variables
    bg0x = 0
    bg1x = w
    globalThis.leftConstraint = initialLeft
    globalThis.rightConstraint = initialRight

    GAME.paused = false
    GAME.controls = false

    P1 = new Fighter(((GAME.single) && cenX) || 100, (FLOOR - 258), 1)
    P1.update()

    if (GAME.single) { // singleplayer
        distSinceLastGuy = 0
        lastGuySpawned = 0
        globalThis.enemiesRemaining = 100

        setTimeout(function () {
            singlePlayerIntro()
            Animators.nav.play()
        }, delay || 1)
    }
    else {
        P2 = new Fighter((w - 250), (FLOOR - 258), 2, "left")
        P2.update()

        versusIntro()   
    }
}

// Game Loop

function update() {
    requestAnimationFrame(update)

    /*** Desired FPS Trap ***/
    GAME.now = performance.now()
    const TIME_PASSED = (GAME.now - GAME.time)
    if (TIME_PASSED < MS_PER_FRAME) return
    const EXCESS_TIME = (TIME_PASSED % MS_PER_FRAME)
    GAME.time = (GAME.now - EXCESS_TIME)
    /*** END FPS Trap ***/

    clearCanvas()

    if (!GAME.menu) {
        // Handle background

        let bg = ImageMemory["background.jpg"]
        if (imported.backgrounds[0]) bg = newImage(parse(imported.backgrounds[0]).src, true)

        img(bg, 0, 0, 612, 408, bg0x - leftConstraint, 0, w, h)

        const bgCX = (w / 2) // Center of background width

        CTX.save() // Save CTX state
        CTX.translate((bg1x - leftConstraint) + bgCX, 0) // Flip image horizontally
        CTX.scale(-1, 1)
        CTX.translate(-(((bg1x - leftConstraint)) + bgCX) + 600, 0) // restore the position (roughly)
        img(bg, 0, 0, 612, 408, (bg1x - leftConstraint) - bgCX, 0, w, h) // Draw the 2nd background
        CTX.restore() // Restore CTX state

        if (bg0x < (leftConstraint - w)) bg0x = (bg1x + w)
        if (bg1x < (leftConstraint - w)) bg1x = (bg0x + w)

        if (GAME.started) {
            // Single player NPCS

            if (GAME.single) {
                if (enemiesRemaining > 0) {
                    if (P1.left > (distSinceLastGuy + ((w / 2) - randInt(0, 200)))) { // if we are far enough from the last enemy
                        let amt = 1

                        if (enemiesRemaining > 3) amt = randInt(1, 3) // Ensures that we don't generate enemies after the remaining number reaches 0

                        for (let i = 0; (i < amt); i++) { // Generate the enemies, set their type and set distance and time to now
                            if (!GAME.started) break
                            const guy = new Fighter(P1.left + w + (i * 200), (FLOOR - 258), undefined, undefined, undefined, 4)
                            if (guy) {
                                guy.enemyType = randInt(1, 200)
                                distSinceLastGuy = P1.left
                                lastGuySpawned = GAME.now
                            }
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
            if ((GAME.started) && !GAME.paused) {
                if (a.plr) {
                    if (a.grounded && !a.t.attack.active && !a.t.stun.active) a.setBaseState()
                }
                else { // NPC
                    if (GAME.single) {
                        a.facing = "left"

                        // Basic AI
                        let movement

                        if (a.canAttack && a.absRight < (initialRight + rightConstraint)) {
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

                        if (a.left < (leftConstraint - 200)) a.remove() // remove NPCs far off screen to free up memory
                    }
                }
                a.update()
            }
            else {
                a.draw()
            }
        }

        if (GAME.started) {
            // Handle hitboxes
            let fakeHitboxes = cloneArray(Hitboxes) // need to clone the array so that it doesn't visually affect the hitboxes
            for (const h of fakeHitboxes) {
                if (!GAME.paused) {
                    for (const a of Fighters) { // check fighter collisions
                        if (a.alive) { // only consider alive fighters
                            const col = h.check(a)

                            if (col) { // found a collision
                                a.onDamage(h.dmg)

                                if (h.type == "fireball") h.remove() // always destroy fireballs on contact, others can be used to hit multiple fighters
                                break
                            }
                        }
                    }

                    if (h.type == "fireball") { // check if fireball collides with other fireballs
                        Hitboxes.forEach(h1 => {
                            if (h1 != h && ((h1.type == h.type) && h.check(h1))) { // remove if this is the case
                                h.remove()
                                h1.remove()
                            }
                        })
                    }

                    h.update() // queue physics update
                }
                else {
                    h.draw()
                }
            }
            fakeHitboxes = null

            // Handle particles
            for (const p of Particles) {
                if (!GAME.paused) {
                    p.update()
                }
                else {
                    p.draw()
                }
            }
        }

        // Handle 'Beat 100 enemies'
        let eAnim = Animators.enemies
        let efAnim = Animators.enemiesflash
        let eSize = enemiesBubble.size

        if (efAnim.playing || eAnim.playing) img(ImageMemory[((!efAnim.flashing) && "100enemies.png") || "100enemiesflash.png"], 0, 0, 1200, 800, (cenX - 150), (cenY - 100), (3000 * eSize), (2000 * eSize))
        eAnim = null, efAnim = null, eSize = null

        // Handle 'are you ready'
        let rAnim = Animators.ready
        if (rAnim.times > -1) img(ImageMemory[`ready${rAnim.times}.png`], 0, 0, 128, 64, (cenX - 250), (cenY - 160), 512, 256)
        rAnim = null

        // Handle 'Attack!'
        let aAnim = Animators.attack
        if (aAnim.times > -1) img(ImageMemory[`attack${aAnim.times}.png`], 0, 0, 128, 64, (cenX - 185), (cenY - 120), 400, 200)
        aAnim = null

        if (GAME.single) {
            // Handle P1 health bar and icon

            img(ImageMemory["plricon.png"], 0, 0, 32, 32, 35, 25, 64, 64)
            img(ImageMemory["healthfill.png"], 0, 0, 128, 16, 112, 40, (158 * (P1.hp / P1.maxHP)), 32)
            img(ImageMemory["healthbar.png"], 0, 0, 92, 16, 100, 40, 184, 32)

            // Handle enemy counter

            img(ImageMemory["enemycounter.png"], 0, 0, 105, 25, (cenX + 350), 40, 210, 50)

            CTX.textAlign = "left"
            fstyle("rgb(255, 255, 152)")
            font("24px Humming")
            text("enemies", (cenX + 440), 75, 200)

            let rem = strToUINum((100 - enemiesRemaining))
            for (let i = 0; (i < 3); i++) {
                const size = eRemaining[`size${i}`] || 1 // for animation purposes
                img(ImageMemory[`num${rem[i]}.png`], 0, 0, 13, 13, ((cenX + 360) + ((24 * size) * i)), 52, (27 * size), (27 * size))
            }
            rem = null

            // Handle low movement arrows
            let nAnim = Animators.nav
            if (nAnim.times > -1) img(ImageMemory[`nav${nAnim.times}.png`], 0, 0, 64, 64, (w - 200), (cenY - 75), 128, 128)

            if (nAnim.ended && ((GAME.now - lastGuySpawned) > 5000)) nAnim.play()
            nAnim = null

            // Handle 'victory' clear

            if (clearText.visible) img(ImageMemory["clear.png"], 0, 0, 128, 64, (clearText.x - 125), (clearText.y - 25), 400, 200)

            if (!P1.alive || ((enemiesRemaining <= 0)) && GAME.started && GAME.controls) {
                GAME.controls = false

                if (P1.alive) { // player has won
                    playSound("victory.mp3")
                    clearText.visible = true
                    Animators.clearin.play()

                    for (const f of Fighters) {
                        if (!f.plr && f.alive) f.remove()
                    }
                }
                else { // player has lost
                    setTimeout(results, 3000)
                }
            }
        }
        else {
            // Handle P1 health bar and icon

            img(ImageMemory["plricon.png"], 0, 0, 32, 32, 360, 25, 64, 64)
            img(ImageMemory["healthfill.png"], 0, 0, 128, 16, 437, 40, (158 * (P1.hp / P1.maxHP)), 32)
            img(ImageMemory["healthbar.png"], 0, 0, 92, 16, 425, 40, 184, 32)

            // Handle P2 health bar and icon

            img(ImageMemory["plricon.png"], 0, 0, 32, 32, (cenX + 240), 25, 64, 64)
            img(ImageMemory["healthfill.png"], 0, 0, 128, 16, (cenX + 67), 40, (158 * (P2.hp / P2.maxHP)), 32)
            img(ImageMemory["healthbar.png"], 0, 0, 92, 16, (cenX + 55), 40, 184, 32)

            // Handle the little VS icon

            img(ImageMemory["VSui.png"], 0, 0, 32, 27, (cenX), 25, 64, 54)

            // get who's alive
            a1 = P1.alive
            a2 = P2.alive
            if ((!a1 || !a2) && GAME.controls) {
                GAME.controls = false
                
                let delay = 2000

                // see who's winning and make them do victory stance
                if (a1) {
                    P1.victory()
                }
                else if (a2) {
                    P2.victory()
                }
                else { // draw... just get it over with
                    delay = 0
                }
                
                // queue results after player celebrates
                setTimeout(function() {
                    GAME.started = false
                    GAME.menu = "vsresults"
                    Animators.blackout.play()        
                }, (delay + 2000))

                setTimeout(function() {
                    Animators.blackin.play()
                }, (delay + 1000))
            }
        }

        // Handle 'pause' screen
        if (GAME.started && GAME.paused) {
            fstyle("rgba(0, 0, 0, 0.8")
            frect(0, 0, w, h)
            img(ImageMemory["pause.png"], 0, 0, 59, 15, (cenX - 65), (cenY - 100), 177, 45)
        }

        if (DEBUG) { // round debug info
            fstyle("red")
            font("20px Humming")

            text(`state: ${P1.state}`, 20, 120)
            text(`x: ${Math.round(P1.left)} (v: ${Math.round(P1.velocity.x)}), y: ${Math.round(P1.top)} (v: ${Math.round(P1.velocity.y)})`, 20, 160)
            text(`grounded: ${P1.grounded}`, 20, 200)
            text(`m-lock: ${P1.marchLock}`, 20, 240)
            text(`attacking: ${(P1.t.attack.active)}`, 20, 280)
            text(`stunned: ${(P1.t.stun.active)}`, 20, 320)
            text(`fighters: ${Fighters.length}`, 20, 360)
            text(`hitboxes: ${Hitboxes.length}`, 20, 400)

            frect(0, FLOOR, w, 2)
        }
    }
    else { // Handle menus
        if (GAME.menu == "title") {
            playSound("title.mp3")

            fstyle("black")

            frect(0, 0, w, h)

            img(ImageMemory["title.png"], 0, 0, 256, 128, (cenX - 250), (cenY - 350), 512, 256)

            if ((GAME.now - lastFlame) > 100) { // Change flame every 100ms
                if (flamenum < 3) {
                    flamenum++
                }
                else {
                    flamenum = 0
                }

                lastFlame = GAME.now
            }

            img(ImageMemory[`flame${flamenum}.png`], 0, 0, w, h, -305, -70, 1810, 1400)

            CTX.textAlign = "center"

            font("30px Humming")
            text("Passionyte 2025", cenX, (h - 50))

            fstyle("yellow")
            font("24px Humming")
            text(VERSION, cenX, (cenY - 100))
        }
        else if (GAME.menu == "results") {
            img(ImageMemory["survivalbg.png"], 0, 0, 256, 256, 0, 0, w, (h * 1.33))

            // draw player 'face'
            img(ImageMemory["1pfacebase.png"], 0, 0, 128, 128, (cenX - 512), (cenY - 350), 600, 600)

            // draw the score display box
            CTX.beginPath()
            CTX.roundRect((cenX + 100), (cenY - 275), 550, 550, 40)
            fstyle("rgba(0, 0, 0, 0.5)")
            CTX.fill()

            font("45px Humming")
            fstyle("white")

            if (rank == "Fail") { // Player failed the survival mode
                font("50px Humming")
                text("Score", (cenX + 115), (cenY - 200), 200)
                img(ImageMemory["scoreboxlarge.png"], 0, 0, 128, 38, (cenX + 115), (cenY - 160), 450, 128)

                // score
                let strDefeated = strToUINum(enemiesDefeated)

                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strDefeated[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 110) + (80 * i)), (cenY - 140), 96, 96)

                strDefeated = null

                font("38px Humming")
                fstyle("black")
                text("enemies", (cenX + 375), (cenY - 60))

                font("40px Humming")
                fstyle("white")
                text("Best score", (cenX + 115), (cenY + 100))

                img(ImageMemory["scoreboxlong.png"], 0, 0, 128, 22, (cenX + 115), (cenY + 125), 450, 75)

                // best
                let strBest = strToUINum(profile.best.enemies)

                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strBest[i]}.png`], 0, 0, 32, 32, ((cenX + 185) + (55 * i)), (cenY + 132), 64, 64)

                font("32px Humming")
                fstyle("black")
                text("enemies", (cenX + 370), (cenY + 185))

                strBest = null
            }
            else { // Player cleared the survival mode
                img(ImageMemory["survivalclear.png"], 0, 0, 512, 256, -400, -200, 1200, 600)

                text("Health", (cenX + 115), (cenY - 200))
                text("Time", (cenX + 115), (cenY - 100))

                font("52px Humming")
                text("Rank", (cenX + 115), cenY)

                // health
                img(ImageMemory["scorebox.png"], 0, 0, 80, 20, (cenX + 300), (cenY - 250), 275, 75)

                let strHP = strToUINum(Math.floor(((hpStatic) / defHP) * 100))

                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strHP[i]}.png`], 0, 0, 32, 32, ((cenX + 345) + (40 * i)), (cenY - 235), 48, 48)
                strHP = null

                font("38px Humming")
                fstyle("black")
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

                font("26px Humming")
                text("M.", (cenX + 400), (cenY - 95))
                text("s.", (cenX + 525), (cenY - 95))

                // rank
                img(ImageMemory["scoreboxgreen.png"], 0, 0, 131, 25, (cenX + 115), (cenY + 25), 450, 90)

                let strPoints = strToUINum(pointsStatic)

                // draw image numbers
                for (let i = 0; (i < 3); i++) img(ImageMemory[`score${strPoints[i] || 0}.png`], 0, 0, 32, 32, ((cenX + 200) + (64 * i)), (cenY + 35), 72, 72)

                strPoints = null

                font("40px Humming")
                text("Pts.", (cenX + 400), (cenY + 90))

                img(ImageMemory[`grade${rank}.png`], 0, 0, 48, 48, (w - 150), (cenY + 150), 144, 144)

                // best

                font("40px Humming")
                fstyle("rgb(255, 255, 152)")
                text(`High score ${profile.best.points} pts. ${profile.best.rank}`, (cenX + 100), (h - 50))
            }
        }
        else if (GAME.menu == "vsresults") {
            if (a1 || a2) { // a player won
                img(ImageMemory["2pwinbg.png"], 0, 0, 256, 256, 0, 0, w, h + 275)

                if (a1) { // p1 win
                    img(ImageMemory["1pfacewin.png"], 0, 0, 128, 128, 50, 50, 512, 512)
                    img(ImageMemory["winner.png"], 0, 0, 100, 27, 100, 25, 200, 54) // TODO: cycle animation

                    img(ImageMemory["2pfacelose.png"], 0, 0, 128, 128, (w - 512), (cenY - 256), 512, 512)
                    img(ImageMemory["loser.png"], 0, 0, 103, 68, (w - 206), (cenY - 272), 206, 136) // TODO: shake animation
                }
                else { // p2 win
                    img(ImageMemory["2pfacewin.png"], 0, 0, 128, 128, (w - 50), (h - 50), 512, 512)
                    img(ImageMemory["winner.png"], 0, 0, 100, 27, 100, (w - 25), (h - 200), 54, 200) // TODO: cycle animation

                    img(ImageMemory["1pfacelose.png"], 0, 0, 128, 128, 50, 50, 512, 512)
                    img(ImageMemory["loser.png"], 0, 0, 103, 68, 25, 200, 206, 136) // TODO: shake animation
                }
            }
            else { // draw
                img(ImageMemory["2pdrawbg.png"], 0, 0, 256, 256, 0, 0, w, h + 275)
                img(ImageMemory["draw.png"], 0, 0, 103, 68, (cenX - 103), (cenY - 204), 206, 136)

                img(ImageMemory["1pfacebase.png"], 0, 0, 128, 128, 0, (cenY - 380), 512, 512)
                img(ImageMemory["2pfacebase.png"], 0, 0, 128, 128, (w - 512), (cenY - 380), 512, 512)
            }
        }
        else if (GAME.menu == "loading") {
            fstyle("black")
            frect(0, 0, w, h)

            const lAnim = Animators.loading

            if (!lAnim.playing) lAnim.play()

            img(ImageMemory[`load${((lAnim.times > -1) && lAnim.times) || 0}.png`], 0, 0, 512, 256, 25, 75, w, 600)

            fstyle("rgb(255, 166, 0)")
            font("20px Humming")
            CTX.textAlign = "center"
            text(`Reading...`, (cenX + 20), (cenY + 10))

            if (!loadingComplete) { // continue loading
                if (!SoundMemory["loading.wav"].playing) playSound("loading.wav")
            }
            else { // loading complete
                stopSound("loading.wav")
                playSound("loadingcomplete.wav")
                blackTrans.val = 0
                Animators.blackout.play()
                setTimeout(function() { // load next menu after blackout is done
                    GAME.menu = GAME.nextMenu
                    loadingComplete = false
                }, 100)
            }
        }
        else if (GAME.menu == "modeselect") {
            fstyle("black")
            frect(0, 0, w, h)

            img(ImageMemory["title.png"], 0, 0, 256, 128, (cenX - 250), (cenY - 350), 512, 256)

            if ((GAME.now - lastFlame) > 100) { // Change flame every 100ms
                if (flamenum < 3) {
                    flamenum++
                }
                else {
                    flamenum = 0
                }

                lastFlame = GAME.now
            }

            img(ImageMemory[`flame${flamenum}.png`], 0, 0, w, h, -305, -70, 1810, 1400)

            fstyle("yellow")
            font("40px Humming")
            CTX.textAlign = "center"
            text("Mode Select", cenX, (cenY - 50))

            font("24px Humming")
            fstyle("black")
            text(((!globalThis.curSelected || globalThis.curSelected.menu != GAME.menu) && modeDescriptions.na) || modeDescriptions[globalThis.curSelected.name], cenX, (h - 50))
        }
        else if (GAME.menu == "createselect" || GAME.menu == "fighternext" || GAME.menu == "uploadsel" || GAME.menu == "capturesel") {
            if (GAME.menu == "createselect") stopSound("title.mp3")

            img(ImageMemory["createselect.png"], 0, 0, 1200, 800, 0, 0, w, h)

            font("48px Nitro")
            fstyle("white")

            const t = menuTitles[GAME.menu] || ""
            text(t, (w - 400), 60)

            queueNote()
        }
        else if (GAME.menu == "createbg") {
            img(ImageMemory[(buttonLayout != "backgroundsave") && "createbg.png" || "finishbg.png"], 0, 0, 1200, 800, 0, 0, w, h)

            font("48px Nitro")
            fstyle("white")

            const t = menuTitles[GAME.menu] || ""
            text(t, (w - 400), 60)

            if (buttonLayout && buttonLayout.includes("background")) {
                if (curCam) { // max res should be 640x480
                    vW = curCam.video.videoWidth
                    vH = curCam.video.videoHeight

                    dW = (640 - vW)
                    dH = (480 - vH)
                }

                // background
                if (buttonLayout != "backgroundsave") {
                    // clear the left
                    CTX.clearRect(0, 0, (w / 2), h)

                    let image = imported.backgrounds[backgroundSlot]
                    if ((!curCam || !curCam.active) && !image) {
                        img(ImageMemory["space.png"], 0, 0, 256, 128, 0, 0, (w / 2), h)
                        img(ImageMemory["bgplaceholder.png"], 0, 0, 450, 425, 75, 190, 450, 425)
                    }
                    else {
                        if (image) {
                            img(ImageMemory["space.png"], 0, 0, 256, 128, 0, 0, (w / 2), h)
                            img(newImage(parse(image).src), 0, 0, 640, 480, 75, 190, 475, 485)
                        }
                        else {
                            curCam.draw(CTX, dW, dH, vW, vH, 0, 100, (w / 2), (h - 100))
                        }   
                    }

                    // create green tints around feed
                    fstyle("rgba(0, 100, 0, 0.5)")
                    frect(0, 0, (w / 2), 200)
                    frect(0, (h - 200), (w / 2), 200)
                    frect(0, 200, 75, 400)
                    frect(((w / 2) - 75), 200, 75, 400)

                    // Draw outline surrounding the feed
                    CTX.save()
                    CTX.strokeStyle = "yellow"
                    CTX.beginPath()
                    CTX.roundRect(75, 200, 450, 400, 20)
                    CTX.lineWidth = 12
                    CTX.stroke()
                    CTX.strokeStyle = "black"
                    CTX.beginPath()
                    CTX.roundRect(67, 192, 465, 418, 20)
                    CTX.lineWidth = 14
                    CTX.stroke()
                    CTX.restore()
                }
                else if (curPic && (curPic.src)) {
                    font("38px Humming")
                    fstyle("white")
                    text("Save background?", 300, 60)

                    CTX.save()
                    fstyle("green")
                    CTX.beginPath()
                    CTX.roundRect(50, 175, 500, 450, 60)
                    CTX.fill()
                    CTX.restore()

                    img(curPic, 0, 0, 640, 480, 80, 205, 470, 470)
                }
                else {
                    messageBox("An error occurred", true, function() {
                        Animators.blackin.play()
                        setTimeout(function() {
                            buttonLayout = null
                            Animators.blackout.play()
                        }, 1000)
                    })

                }
            }
            else {
                queueNote()
            }
        }

        // load any MENU buttons here
        for (const b of menuButtons(GAME.menu)) {
            determineAutoSelect(b)
            b.draw()

            if (b.name.includes("bg")) {
                let image = imported.backgrounds[b.name.replace("bg", "")]

                if (image) {
                    image = parse(image)
                    img(newImage(image.src, true), 0, 0, 640, 480, (b.position.x + 4), (b.position.y + 20), 118, 92)  
                }
                else {
                    // temporary camera sprite here
                }
            }
        }

        // button layouts (non-menu connected buttons)
        if (buttonLayout && buttonLayout.includes("background")) {
            // tint the right beneath the button layout (doesn't really matter the order because this is the right)
            fstyle("rgba(0, 0, 0, 0.5)")
            frect((w / 2), 0, (w / 2), h)
        }

        // menu indicator
        if (DEBUG) {
            CTX.textAlign = "left"
            font("20px Humming")
            fstyle("red")

            text(`menu: ${GAME.menu} (n: ${GAME.nextMenu})`, 20, 120)
            text(`buttons: ${Buttons.length} (m: ${menuButtons(GAME.menu, buttonLayout).length})`, 20, 160)
        }
    }

    // load any button layouts over the others
    for (const b of menuButtons(undefined, buttonLayout)) {
        determineAutoSelect(b)
        b.draw()
    }

    // Handle message boxes
    if (msgBox.visible) {
        img(ImageMemory["msgbox.png"], 0, 0, 208, 160, msgBox.x, msgBox.y, 416, 320)

        if (msgBox.text) {
            font("22px Humming")

            if (typeof(msgBox.text) != "string") {
                for (let i = 0; (i < adtLen(msgBox.text)); i++) text(msgBox.text[i], (msgBox.x + 208), ((msgBox.y + 120) + (40 * i)))
            }
            else {
                text(msgBox.text, (msgBox.x + 208), ((msgBox.y + 150)))
            }
        }
    }

    // Handle black screen cover

    if (blackTrans.val < 1) {
        fstyle(`rgba(0, 0, 0, ${(1 - blackTrans.val)})`)
        frect(0, 0, w, h)
    }

    // global debug mode indicator

    if (DEBUG) {
        CTX.textAlign = "left"
        fstyle("red")
        font("20px Humming")

        const fps = Math.round((TIME_PASSED / MS_PER_FRAME) * FPS)
        text("debug mode", 20, 40)
        text(`fps: ${clamp(fps, 0, FPS)} (${fps})`, 20, 80)
    }
}

// Handle initial prompt screen (we need this for audio to work)
fstyle("black")
frect(0, 0, w, h)
fstyle("white")
font("80px Humming")
CTX.textAlign = "center"    
text("To start, click here.", cenX, cenY)

function start() {
    update() // initialize game loop
    setTimeout(function() { // stop 'loading' after a random time
        loadingComplete = true
    }, randInt(1000, 3000))
    CANVAS.removeEventListener("mousedown", start) // rid the event listener
}

CANVAS.addEventListener("mousedown", start)

export default { GAME }