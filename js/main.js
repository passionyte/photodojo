// Passionyte 2025

'use strict'

// Import the massive conglomerate of stuff we need
import {
    CTX, w, h, cenX, cenY, MS_PER_FRAME, FPS, clearCanvas, DEBUG, clamp, FLOOR, randInt, cloneArray, img, text, frect, font,
    fstyle, VERSION, adtLen, promptUpload, toBytes, FR, compress, UIObject, helperCTX, helperCANVAS
} from "./globals.js"
import { Fighter, Fighters, Hitboxes, defHP, floorPos } from "./fighter.js"
import { Animator, Animators, Timers } from "./animate.js"
import { profile, defProfile, saveData, exportData, importData, imported, filename } from "./profile.js"
import { ImageMemory, newImage } from "./images.js"
import { SoundMemory, stopSound, playSound } from "./sounds.js"
import { KEYS } from "./controller.js"
import {
    Button, Buttons, getButton, menuButtons, selectNew, sbuttonbounds, mbuttonbounds, lbuttonbounds, titlebuttonbounds, longbuttonbounds, musicbuttonbounds, sbuttonimgs, mbuttonimgs, lbuttonimgs, longbuttonimgs, musicbuttonimgs, menuButtonsActive
} from "./button.js"
import { Notes, modeDescriptions, menuTitles, Messages, photoOrder, songNames, songOrder } from "./notes.js"
import { Particles } from "./particle.js"
import { Camera } from "./camera.js"
import { Game } from "./game.js"

// Create a new game!
export let GAME = new Game()

// Misc Variables
let curCam // current camera given by player
let curPic // current picture given by player
let backgroundSlot // selected background in the create background menu
let loadingComplete = false // tells the load screen when to stop
let prePauseTimers = {} // timers reserved on pause (will be reset)
let downKeys = {} // keys which are currently inputted by player
let modeToSelect = 1 // reserved for the background select (linking to game init)
let selectedBackground // background chosen by player (for the game)
let photoNum = 0 // current fighter photo being taken (i.e. 3 = fireball)
let editingFighter = 0 // current fighter being edited
let shownWelcomeMessage = (profile != defProfile) // self explanatory
let lockNav = false // locks navigation in menus

let vW // last known video width
let vH // last known video height

// Boundary Variables
export const initialLeft = 0
export const initialRight = w
globalThis.leftConstraint = initialLeft
globalThis.rightConstraint = initialRight

// UI Objects / ADTs
const clearText = new UIObject(w, (cenY - 100))
const msgBox = new UIObject(w, (cenY - 125), {text: {}, pass: false})
const controls = new UIObject(-(w / 2), (cenY - 300))

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

// UI Buttons

// title screen
new Button("battle", "title", "battlebutton.png", { press: "titlebutton.wav" }, titlebuttonbounds, (cenX + 56), cenY, function () {
    GAME.menu = "modeselect"
}, undefined, "l")
new Button("create", "title", "createbutton.png", { press: "titlebutton.wav" }, titlebuttonbounds, (cenX - 280), cenY, function () {
    transition(function () {
        GAME.menu = "createselect"
        stopSound("title.mp3")
    })
})
// mode select
new Button("versus", "modeselect", "vsbutton.png", undefined, titlebuttonbounds, (cenX - 280), cenY, function () {
    modeToSelect = 2
    transition(function () {
        GAME.menu = "selectbg" // change to fighter select later
        stopSound("title.mp3")
    })
})
new Button("survival", "modeselect", "survivalbutton.png", undefined, titlebuttonbounds, (cenX + 56), cenY, function () {
    modeToSelect = 1
    transition(function () {
        GAME.menu = "selectbg" // change to fighter select later
        stopSound("title.mp3")
    })
})
new Button("modeback", "modeselect", sbuttonimgs, { press: "titlecancel.wav" }, sbuttonbounds, 75, (cenY + 200), function () {
    GAME.menu = "title"
}, { text: "Back", font: "Humming", size: 30 })
// create select
new Button("createselectback", "createselect", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    transition(function () {
        GAME.menu = "title"
        stopSound("create.mp3")
        createNote.strs = {}
    })
}, { text: "Back", font: "Humming", size: 30 })
new Button("newfighter", "createselect", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 125, function () {
        transition(function () {
            GAME.menu = "fighternext"
            createNote.strs = {}
        })
    }, { text: "Make a new fighter!", font: "Humming", size: 28 }, "l")
new Button("editfighter", "createselect", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 275, function () {
        transition(function () {
            // open the fighter edit menu...
            createNote.strs = {}
        })
    }, { text: "Edit a fighter!", font: "Humming", size: 28 }, "l")
new Button("createbg", "createselect", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 425, function () {
        transition(function () {
            GAME.menu = "createbg"
            createNote.strs = {}
        })
    }, { text: "Create background!", font: "Humming", size: 28 })
// fighter photo type
new Button("webcam", "capturesel", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 125, function () {
        // take photos to make fighter
        if (!curCam) {
            messageBox(Messages.camera, true)
            curCam = new Camera()
        }

        curCam.init(function (ready) {
            if (!ready) {
                messageBox(Messages.noCamera, true)
            }
            else {
                GAME.menu = "fighterinstru"
                createNote.strs = {}
            }
        })
    }, { text: "Web Cam", font: "Humming", size: 28 }, "l")
new Button("upload", "capturesel", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 275, function () {
        createNote.strs = {}
        GAME.menu = "uploadsel"
    }, { text: "Upload", font: "Humming", size: 28 })
new Button("captureselback", "capturesel", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    createNote.strs = {}
    GAME.menu = "fighternext"
}, { text: "Back", font: "Humming", size: 30 })
// fighter next
new Button("fighternext", "fighternext", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), (cenY - 96), function () {
        createNote.strs = {}
        GAME.menu = "capturesel"
    }, { text: "Next", font: "Humming", size: 28 })
// fighter instructions next
new Button("fighterinstru", "fighterinstru", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), (cenY - 96), function () {
        createNote.strs = {}
        GAME.menu = "fighterstart"
    }, { text: "Next", font: "Humming", size: 28 })
// fighter start
new Button("fighterstart", "fighterstart", lbuttonimgs,
    { press: "start.wav" }, lbuttonbounds, (cenX + 100), (cenY - 96), function () {
        if (curCam) {
            transition(function () {
                GAME.menu = "createfighter"
            })
        }
    }, { text: "Start!", font: "Humming", size: 28 })
new Button("fighternextback", "fighternext", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    transition(function () {
        createNote.strs = {}
        GAME.menu = "createselect"
    })
}, { text: "Back", font: "Humming", size: 30 })
// upload image selection
new Button("individual", "uploadsel", lbuttonimgs,
    { press: "start.wav" }, lbuttonbounds, (cenX + 100), 125, function () {
        transition(function () {
            // upload pics to make fighter
            createNote.strs = {}
            GAME.menu = "createselect"
        })
    }, { text: "Individual", font: "Humming", size: 28 }, "l")
new Button("template", "uploadsel", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 275, function () {
        // prompt template upload
    }, { text: "Template", font: "Humming", size: 28 })
new Button("uploadselback", "uploadsel", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    createNote.strs = {}
    GAME.menu = "capturesel"
}, { text: "Back", font: "Humming", size: 30 })
// create bg back
new Button("createbgback", "createbg", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    transition(function () {
        createNote.strs = {}
        GAME.menu = "createselect"
    })
}, { text: "Back", font: "Humming", size: 30 })
// bg buttons
for (let z = 0; (z < 8); z++) {
    const row = Math.floor((z / 3))
    new Button(`bgbutton${z}`, "createbg", { i: "bgbutton.png", s: "bgbuttonsel.png", p: "bgbuttonpress.png" }, { press: "createbutton.wav" }, {
        x: 0, y: 0, w: 59, h: 59
    }, (cenX + 59) + (150 * (z - (row * 3))), (150 + (150 * row)), function () {
        GAME.buttonLayout = ((!imported.backgrounds[z]) && "newbackground") || "backgroundedit"
        backgroundSlot = z
        menuButtons(GAME.menu).forEach(b => {
            b.active = false
            b.state = "i"
        })
    })
}
// take background picture
new Button("webcambg", "newbackground", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 125, function () {
        if (!curCam) {
            messageBox(Messages.camera, true)
            curCam = new Camera()
        }

        curCam.init(function (ready) {
            if (ready) {
                GAME.buttonLayout = "backgroundcapture"
                menuButtons(GAME.menu).forEach(b => {
                    b.active = false
                    b.state = "i"
                })
            }
            else {
                messageBox(Messages.noCamera, true)
            }
        })
    }, { text: "Web Cam", font: "Humming", size: 28 })
// upload image selection
new Button("uploadbg", "newbackground", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 275, function () {
        // upload background
        const input = promptUpload()

        input.onchange = change => {
            const file = change.target.files[0] // just read the first file like we do with imports

            if (file.type.includes("image/")) { // is a image
                FR.readAsDataURL(file)
                FR.onload = ev => {
                    const bg = ev.target.result // is already base64 .. but we need to compress it

                    // set slot to uploaded image
                    GAME.buttonLayout = null
                    menuButtonsActive(true)
                    if (bg) {
                        const i = newImage(bg, true)

                        if (!i.complete) {
                            // wait for the image to finish loading
                            i.onload = function () {
                                imported.backgrounds[backgroundSlot] = compress(i, 640, 480) // save the compressed image
                            }
                        }
                        else {
                            imported.backgrounds[backgroundSlot] = compress(i, 640, 480) // save the compressed image
                        }
                        const battle = getButton("battle")
                        if (battle.state == "l") battle.state = "i"
                    }
                    messageBox(`Upload ${((bg) && "successful") || "failed"}!`, true)
                }
            }
            else {
                messageBox("The file uploaded is not a image.", true)
            }

            input.remove()
        }
    }, { text: "Upload", font: "Humming", size: 28 })
// create bg
new Button("bgseltypeback", "newbackground", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    GAME.buttonLayout = null
    if (curCam) curCam.stop()
    menuButtonsActive(true)
}, { text: "Back", font: "Humming", size: 30 })
// create bg quit
new Button("bgcapquit", "backgroundcapture", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    GAME.buttonLayout = null
    if (curCam) curCam.stop()
    menuButtonsActive(true)
}, { text: "Quit", font: "Humming", size: 30 })
// create bg take photo
new Button("bgtake", "backgroundcapture", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), (cenY - 96), function () {
        if (curCam) {
            const photo = curCam.photo()
            if (photo) {
                GAME.buttonLayout = "backgroundsave"
                curPic = newImage(photo, true)
                curCam.stop()
            }
        }
    }, { text: "Take photo", font: "Humming", size: 28 })
// save bg quit
new Button("bgsavequit", "backgroundsave", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    GAME.buttonLayout = null
    curPic = null
    menuButtonsActive(true)
}, { text: "Quit", font: "Humming", size: 30 })
// save bg
new Button("bgsave", "backgroundsave", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 125, function () {
        GAME.buttonLayout = null

        imported.backgrounds[backgroundSlot] = curPic.src
        curPic = null
        backgroundSlot = null

        menuButtonsActive(true)

        const battle = getButton("battle")
        if (battle.state == "l") battle.state = "i"
    }, { text: "Save", font: "Humming", size: 28 })
new Button("bgtryagain", "backgroundsave", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 275, function () {
        curPic = null
        curCam.init()
        GAME.buttonLayout = "backgroundcapture"
    }, { text: "Try again", font: "Humming", size: 28 })
// edit background
new Button("editbgtryagain", "backgroundedit", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 225, function () {
        GAME.buttonLayout = "newbackground"
    }, { text: "Try again", font: "Humming", size: 28 })
new Button("editbgdelete", "backgroundedit", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 403, function () {
        GAME.buttonLayout = null
        imported.backgrounds[backgroundSlot] = null
        backgroundSlot = null
        messageBox("Deleted!", true)
        menuButtonsActive(true)
    }, { text: "Delete", font: "Humming", size: 28 })
new Button("editbgback", "backgroundedit", sbuttonimgs, { press: "createcancel.wav" }, sbuttonbounds, (cenX + 50), (h - 200), function () {
    GAME.buttonLayout = null
    menuButtonsActive(true)
}, { text: "Back", font: "Humming", size: 30 })
// import/export
new Button("export", "title", mbuttonimgs,
    { press: "createbutton.wav" }, mbuttonbounds, (w - 225), (cenY + 325), exportData, { text: "Export data", font: "Humming", size: 24 })
new Button("import", "title", mbuttonimgs,
    { press: "createbutton.wav" }, mbuttonbounds, (w - 225), (cenY + 250), function () {
        const input = promptUpload()

        input.onchange = event => {
            // only check for first file... should be a txt.
            const exports = event.target.files[0]
            if (exports) {
                if (exports.name.includes(filename)) {
                    // ok... it's valid let's use filereader
                    FR.readAsText(exports, "UTF-8")

                    FR.onload = event => {
                        // import data.
                        const result = importData(event.target.result)
                        const bgs = adtLen(result.backgrounds)

                        if (bgs > 0) {
                            const battle = getButton("battle")
                            if (battle.state == "l") battle.state = "i"
                        }

                        messageBox({
                            [0]: "Successfully imported:",
                            [1]: `${adtLen(result.fighters)} fighters and ${bgs} backgrounds.`,
                            [2]: `Data size: ${toBytes(exports.size)}`
                        }, true)
                    }
                }
            }
            input.remove()
        }
    }, { text: "Import data", font: "Humming", size: 24 })
// pause menu
new Button("return", "pause", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX - 125), (cenY), endMatch, { text: "Return to title screen!", font: "Humming", size: 24 })
new Button("controls", "pause", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX - 125), (cenY + 150), function () {
        if (!controls.visible) {
            GAME.buttonLayout = "controls"
            controls.visible = true
            if (GAME.single) {
                Animators.controlsin.play()
            }
            else {
                Animators.controlsvsin.play()
            }
        }
    }, { text: "Controls", font: "Humming", size: 24 })
new Button("closecontrols", "controls", sbuttonimgs,
    { press: "createcancel.wav" }, sbuttonbounds, (cenX - 50), (cenY + 250), function () {
        if (controls.visible) {
            GAME.buttonLayout = "pause"
            if (GAME.single) {
                Animators.controlsout.play()
            }
            else {
                Animators.controlsvsout.play()
            }
            setTimeout(function() {
                controls.visible = false
            }, 1000)
        }
    }, { text: "Close", font: "Humming", size: 24 })
// results
new Button("return", "results", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX - 400), (cenY + 200), endMatch, { text: "Return to title screen!", font: "Humming", size: 24 })
// vs results
new Button("return", "vsresults", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX - 150), (cenY + 200), endMatch, { text: "Return to title screen!", font: "Humming", size: 24 })
// bg select
for (let z = 0; (z < 8); z++) {
    const row = Math.floor((z / 4))
    new Button(`selbackg${z}`, "selectbg", { s: "selbgbuts.png", i: "selbgbut.png", p: "selbgbutp.png", l: "selbgbutl.png" }, undefined,
        { s: { x: 0, y: 0, w: 58, h: 58 }, i: { x: 0, y: 0, w: 58, h: 58 }, p: { x: 0, y: 0, w: 58, h: 58 } }, (40 + (150 * (z - (row * 4)))), (250 + (200 * row)),
        function () {
            selectedBackground = z
            transition(function () { loadGame(modeToSelect) })
        }, undefined, "l"
    )
}
new Button("selectbgback", "selectbg", sbuttonimgs, { press: "titlecancel.wav" }, sbuttonbounds, 40, (h - 100), function () {
    // change to fighter select later
    transition(function () {
        GAME.menu = "title"
        if (profile.track != "na") stopSound(`${songOrder[profile.track]}.mp3`)
    })
}, { text: "Back", font: "Humming", size: 30 })
new Button("fightertakephoto", "createfighter", longbuttonimgs, { press: "createbutton.wav" }, longbuttonbounds, cenX, (h - 300), function () {
    let data = imported.fighters[editingFighter]

    if (!data) {
        imported.fighters[editingFighter] = {
            photos: {},
            sounds: {}
        }
        data = imported.fighters[editingFighter]
    }

    curCam.photo()
    helperCTX.save()
    helperCTX.globalCompositeOperation = "destination-in"
    helperCTX.fillStyle = "rgba(0, 0, 0, 1)"
    helperCTX.drawImage(ImageMemory[`${photoOrder[photoNum].type}mask.png`], 0, 0, 192, 256, 0, 0, 640, 480)
    helperCTX.restore()

    curPic = newImage(helperCANVAS.toDataURL("image/png"), true)
    GAME.buttonLayout = "fightersave"
})
// save fighter
new Button("fightersave", "fightersave", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 125, function () {
        GAME.buttonLayout = null

        imported.fighters[editingFighter].photos[photoNum] = curPic.src
        curPic = null
        photoNum++

        menuButtonsActive(true)
    }, { text: "Save", font: "Humming", size: 28 })
new Button("fightertryagain", "fightersave", lbuttonimgs,
    { press: "createbutton.wav" }, lbuttonbounds, (cenX + 100), 275, function () {
        curPic = null
        curCam.init()
        GAME.buttonLayout = null
    }, { text: "Try again", font: "Humming", size: 28 })
new Button("music", "selectbg", musicbuttonimgs, undefined, musicbuttonbounds, (w - 325), (cenY + 325), function () {
    if (profile.track != "na") stopSound(`${songOrder[profile.track]}.mp3`)

    let len = (adtLen(songOrder) - 1)

    if (profile.best.rank == "Fail") len--

    if (profile.track < len) {
        profile.track++
    }
    else {
        profile.track = 0
    }

    saveData(profile)
}, { text: "Switch music", font: "Humming", size: 28 })

let selBut = getButton("create")
selBut.state = "s"

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

    if (downKeys[key] || lockNav) return
    downKeys[key] = true

    if (msgBox.visible && msgBox.pass) {
        playSound("titlecancel.wav")
        Animators.msgboxpass.play()

        if (msgBox.callback) msgBox.callback()

        return
    }

    if ((GAME.menu || (GAME.buttonLayout)) && (blackTrans.val >= 1)) {
        if (key == KEYS.SPACE) {
            if (selBut && (GAME.menu == selBut.menu || GAME.buttonLayout == selBut.menu) && (selBut.state != "l") && (selBut.canpress && selBut.active)) { // push the button
                selBut.canpress = false
                selBut.press()
            }
        }
        else { // Button navigation based on WASD keys
            const dir = ((key == KEYS.A) && "LEFT") || ((key == KEYS.D) && "RIGHT") || ((key == KEYS.W) && "UP") || ((key == KEYS.S) && "DOWN")

            if (dir) {
                const mB = menuButtons(GAME.menu, GAME.buttonLayout)

                let selB
                for (const b of mB) {
                    if (b.state != "l" && b.active) {
                        if (selectNew(dir, selB, selBut, b)) { // compare x or y differences based on direction
                            selB = b
                        }
                    }
                }
                if (selB) { // set currently selected button to idle, then overwrite with new button and select it
                    selBut.state = "i"
                    selBut = selB
                    selB.select()
                }
            }
        }
    }

    if (!GAME.menu) {
        if (key == KEYS.BACKSPACE) { // pause/unpause game
            if (GAME.started && !controls.visible) {
                GAME.paused = (!GAME.paused)
                GAME.buttonLayout = ((GAME.paused) && "pause") || null

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
new Animator("clearin", "tween", 250, 4000, { obj: clearText, prop: { x: (cenX - 50) } }, function () { Animators.clearout.play() })
new Animator("clearout", "tween", 250, 1, { obj: clearText, prop: { x: -100 } }, results)
new Animator("blackin", "tween", 500, 1, { obj: blackTrans, prop: { val: 0 } })
new Animator("blackout", "tween", 500, 1, { obj: blackTrans, prop: { val: 1 } })
new Animator("remainingsinglegrow", "tween", 100, 1, { obj: eRemaining, prop: { size2: 2 } }, function () { Animators.remainingsingleshrink.play() })
new Animator("remaininggrow", "tween", 100, 1, { obj: eRemaining, prop: { size0: 2, size1: 2, size2: 2 } }, function () { Animators.remainingshrink.play() })
new Animator("remainingsingleshrink", "tween", 100, 1, { obj: eRemaining, prop: { size2: 1 } })
new Animator("remainingshrink", "tween", 100, 1, { obj: eRemaining, prop: { size0: 1, size1: 1, size2: 1 } })
new Animator("loading", "frame", 1000, 1, { goal: 7 })
new Animator("createnote", "typeout", 2000, 1, { obj: createNote, snd: "text.wav" })
new Animator("msgbox", "tween", 200, 1, { obj: msgBox, prop: { x: ((cenX - 208)) } })
new Animator("msgboxpass", "tween", 200, 1, { obj: msgBox, prop: { x: -416 } }, function () {
    msgBox.visible = false
    msgBox.text = ""
})
new Animator("flame", "frame", 400, 1, { goal: 3, endSet: 0 })
new Animator("bgflame", "frame", 400, 1, { goal: 5, endSet: 0 })
new Animator("controlsin", "tween", 400, 1, { obj: controls, prop: { x: (cenX - 100) } })
new Animator("controlsout", "tween", 400, 1, { obj: controls, prop: { x: w } }, function () {controls.x = -w})
new Animator("controlsvsin", "tween", 400, 1, { obj: controls, prop: { x: (cenX - 175) } })
new Animator("controlsvsout", "tween", 400, 1, { obj: controls, prop: { x: w } }, function () {controls.x = -w})

// Functions

function transition(cb) {
    Animators.blackin.play()
    setTimeout(function () {
        if (cb) cb()
        Animators.blackout.play()
    }, 1000)
}

function cleanup() {
    P1 = null
    P2 = null
    for (const f of Fighters) f.remove()
    for (const h of Hitboxes) h.remove()
    for (const t of Timers) t.stop()
    for (const p of Particles) p.remove()
}

function endMatch(menu = "title", bl) { // Force ends the match (un-naturally)
    if (profile.track != "na") stopSound(`${songOrder[profile.track]}.mp3`)

    transition(function () {
        // reset/clear everything and proceed back to a menu
        stopSound("results.mp3")
        GAME.menu = menu
        GAME.started = false
        GAME.controls = false

        GAME.buttonLayout = bl

        cleanup()

        for (let a in Animators) { // Reset all animators except for the ones we are using
            a = Animators[a]
            if (a != Animators.blackin && a != Animators.blackout) a.stop(true)
        }
    })
}

function messageBox(strs, pass, cb) { // Opens a message box that can be closed by the player upon input (or through other means if pass is false)
    playSound("attention.wav")

    msgBox.visible = true
    msgBox.x = w
    msgBox.pass = (pass)
    msgBox.text = strs
    msgBox.callback = cb

    Animators.msgbox.play()
}

function determineAutoSelect(b) {
    if (selBut && (selBut.menu != GAME.menu && (!GAME.buttonLayout || selBut.menu != GAME.buttonLayout)) && (b.state != "l")) { // Always select a button that is *not* locked from a new menu
        selBut.state = "i"
        selBut = b
        b.canpress = true
        b.state = "s"
    }
    else { // Fixes other buttons still being selected after menu transition
        if (b.state == "s" && selBut != b) b.state = "i"
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

function loadGame(m = 1) { // Load the game after the loading screen
    cleanup() // run another cleanup to make sure things are cleaned from last match

    GAME.mode = m

    GAME.menu = "loading"

    if (profile.track != "na") stopSound(`${songOrder[profile.track]}.mp3`)

    GAME.nextMenu = null

    setTimeout(function () {
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

    if (points >= 175) { // If all of these ranks are not applicable, it stays as a fail
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

    if (enemiesDefeated > profile.best.enemies || (pointsStatic > profile.best.points)) { // save data if results are better than the best
        profile.best.enemies = enemiesDefeated
        profile.best.points = pointsStatic
        profile.best.rank = rank

        saveData(profile)
    }

    setTimeout(function () { // wait until blackin is done
        cleanup()
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

function singlePlayerIntro(cb) { // Single player / survival intro
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

function versusIntro() { // Multi player / versus intro
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

    // Create player 1 first, they are guaranteed to exist
    P1 = new Fighter(((GAME.single) && cenX) || 100, floorPos, 1)
    P1.update()

    // Start music
    if (profile.track != "na") playSound(`${songOrder[profile.track]}.mp3`)

    if (GAME.single) { // singleplayer
        distSinceLastGuy = 0
        lastGuySpawned = 0
        globalThis.enemiesRemaining = 100

        setTimeout(function () {
            singlePlayerIntro()
            Animators.nav.play()
        }, delay || 1)
    }
    else { // versus, create player 2
        P2 = new Fighter((w - 250), floorPos, 2, "left")
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

        let bg = ImageMemory["background.jpg"] // fallback

        const custom = imported.backgrounds[selectedBackground]
        if (custom) bg = newImage(custom, true)

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

        // Handle enemy spawning

        if (GAME.started) {
            // Single player NPCS

            if (GAME.single) {
                if (enemiesRemaining > 0) {
                    if (P1.left > (distSinceLastGuy + ((w / 2) - randInt(0, 200)))) { // if we are far enough from the last enemy
                        let amt = 1

                        if (enemiesRemaining > 3) amt = randInt(1, 3) // Ensures that we don't generate enemies after the remaining number reaches 0

                        for (let i = 0; (i < amt); i++) { // Generate the enemies, set their type and set distance and time to now
                            if (!GAME.started) break
                            const guy = new Fighter(P1.left + w + (i * 200), floorPos, undefined, undefined, undefined, 4)
                            if (guy) {
                                guy.enemyType = randInt(1, 200)
                                distSinceLastGuy = P1.left
                                lastGuySpawned = GAME.now
                            }
                        }
                    }
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
                if (profile.track != "na") stopSound(`${songOrder[profile.track]}.mp3`)
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
                if (profile.track != "na") stopSound(`${songOrder[profile.track]}.mp3`)

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
                setTimeout(function () {
                    cleanup()
                    GAME.started = false
                    GAME.menu = "vsresults"
                    Animators.blackout.play()
                }, (delay + 2000))

                setTimeout(function () {
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

        // Handle controls
        if (GAME.single) {
            img(ImageMemory["controls.png"], 0, 0, 150, 340, controls.x, controls.y, 262, 520)

            fstyle("white")
            font("24px Humming")
            text("1P", (controls.x + 75), (controls.y + 30))
            font("22px Humming")
            text("Controls", (controls.x + 160), (controls.y + 30))

            fstyle("red")
            font("20px Humming")

            text("March", (controls.x + 50), (controls.y + 75))
            text("Jump", (controls.x + 50), (controls.y + 125))
            text("Duck", (controls.x + 50), (controls.y + 175))
            text("Punch", (controls.x + 50), (controls.y + 225))
            text("Kick", (controls.x + 50), (controls.y + 275))
            text("Fireball", (controls.x + 50), (controls.y + 325))
            text("Taunt", (controls.x + 50), (controls.y + 375))

            fstyle("gray")
            font("18px Humming")

            text("A/D", (controls.x + 175), (controls.y + 75))
            text("W", (controls.x + 175), (controls.y + 125))
            text("S", (controls.x + 175), (controls.y + 175))
            text("-> + P", (controls.x + 175), (controls.y + 225))
            text("P", (controls.x + 175), (controls.y + 275))
            text("<- + P", (controls.x + 175), (controls.y + 325))
            text("O", (controls.x + 175), (controls.y + 375))
        }
        else {
            img(ImageMemory["controlsvs.png"], 0, 0, 246, 332, controls.x, controls.y, 431, 531)

            fstyle("white")
            font("24px Humming")
            text("Player 1", (controls.x + 75), (controls.y + 30))
            text("Player 2", (controls.x + 355), (controls.y + 30))
            font("22px Humming")
            text("Controls", (controls.x + 215), (controls.y + 30))

            fstyle("gray")
            font("20px Humming")

            text("March", (controls.x + 215), (controls.y + 75))
            text("Jump", (controls.x + 215), (controls.y + 125))
            text("Duck", (controls.x + 215), (controls.y + 175))
            text("Punch", (controls.x + 215), (controls.y + 225))
            text("Kick", (controls.x + 215), (controls.y + 275))
            text("Fireball", (controls.x + 215), (controls.y + 325))
            text("Taunt", (controls.x + 215), (controls.y + 375))

            fstyle("red")
            font("18px Humming")

            text("A/D", (controls.x + 50), (controls.y + 75))
            text("W", (controls.x + 50), (controls.y + 125))
            text("S", (controls.x + 50), (controls.y + 175))
            text("-> + P", (controls.x + 50), (controls.y + 225))
            text("P", (controls.x + 50), (controls.y + 275))
            text("<- + P", (controls.x + 50), (controls.y + 325))
            text("O", (controls.x + 50), (controls.y + 375))

            fstyle("blue")
            text("LTA/RTA", (controls.x + 355), (controls.y + 75))
            text("UPA", (controls.x + 355), (controls.y + 125))
            text("DNA", (controls.x + 355), (controls.y + 175))
            text("<- + NUM3", (controls.x + 355), (controls.y + 225))
            text("NUM3", (controls.x + 355), (controls.y + 275))
            text("-> + NUM3", (controls.x + 355), (controls.y + 325))
            text("NUM.", (controls.x + 355), (controls.y + 375))
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

            const fAnim = Animators.flame
            if (!fAnim.playing) fAnim.play()

            if (fAnim.times > -1) img(ImageMemory[`flame${fAnim.times}.png`], 0, 0, w, h, -305, -70, 1810, 1400)

            CTX.textAlign = "center"

            font("30px Humming")
            text("Passionyte 2025", cenX, (h - 50))

            fstyle("yellow")
            font("24px Humming")
            text(VERSION, cenX, (cenY - 100))

            if (!shownWelcomeMessage) {
                shownWelcomeMessage = true
                messageBox(Messages.welcome, true, function () {
                    lockNav = true
                    setTimeout(function() {
                        lockNav = false
                        messageBox(Messages.started, true, function () {
                            lockNav = true
                            setTimeout(function() {
                                lockNav = false
                                messageBox(Messages.imports, true)
                            }, 500)
                        })
                    }, 500) 
                })
            }
        }
        else if (GAME.menu == "results") {
            playSound("results.mp3")

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
                CTX.textAlign = "left"
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

                CTX.textAlign = "left"
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
            playSound("results.mp3")
            if (a1 || a2) { // a player won
                if (a1) { // p1 win
                    img(ImageMemory["1pwinbg.png"], 0, 0, 256, 256, 0, 0, w, (h + 275))
                    img(ImageMemory["1pfacewin.png"], 0, 0, 128, 128, -16, 0, 512, 512)
                    img(ImageMemory["winner.png"], 0, 0, 100, 27, 69, 25, 350, 95) // TODO: cycle animation

                    img(ImageMemory["2pfacelose.png"], 0, 0, 128, 128, (w - 512), (cenY - 128), 512, 512)
                    img(ImageMemory["loser.png"], 0, 0, 103, 68, (cenX + 152), (cenY - 204), 309, 204) // TODO: shake animation
                }
                else { // p2 win
                    img(ImageMemory["2pwinbg.png"], 0, 0, 256, 256, 0, 0, w, (h + 275))
                    img(ImageMemory["2pfacewin.png"], 0, 0, 128, 128, (w - 512), 0, 512, 512)
                    img(ImageMemory["winner.png"], 0, 0, 100, 27, (w - 425), 25, 350, 95) // TODO: cycle animation

                    img(ImageMemory["1pfacelose.png"], 0, 0, 128, 128, 0, (h - 512), 512, 512)
                    img(ImageMemory["loserleft.png"], 0, 0, 103, 68, 125, 225, 309, 204) // TODO: shake animation
                }
            }
            else { // draw
                img(ImageMemory["2pdrawbg.png"], 0, 0, 256, 256, 0, 0, w, (h + 275))

                img(ImageMemory["1pfacebase.png"], 0, 0, 128, 128, 100, (cenY - 325), 512, 512)
                img(ImageMemory["2pfacebase.png"], 0, 0, 128, 128, (w - 612), (cenY - 325), 512, 512)

                img(ImageMemory["draw.png"], 0, 0, 103, 68, (cenX - 154), (cenY - 185), 309, 204)
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
                setTimeout(function () { // load next menu after blackout is done
                    GAME.menu = GAME.nextMenu
                    loadingComplete = false
                }, 100)
            }
        }
        else if (GAME.menu == "modeselect") {
            fstyle("black")
            frect(0, 0, w, h)

            img(ImageMemory["title.png"], 0, 0, 256, 128, (cenX - 250), (cenY - 350), 512, 256)

            const fAnim = Animators.flame
            if (!fAnim.playing) fAnim.play()

            if (fAnim.times > -1) img(ImageMemory[`flame${fAnim.times}.png`], 0, 0, w, h, -305, -70, 1810, 1400)

            fstyle("yellow")
            font("40px Humming")
            CTX.textAlign = "center"
            text("Mode Select", cenX, (cenY - 50))

            font("24px Humming")
            fstyle("black")
            text(((!selBut || selBut.menu != GAME.menu) && modeDescriptions.na) || modeDescriptions[selBut.name], cenX, (h - 50))
        }
        else if (GAME.menu == "createselect" || GAME.menu == "fighternext" || GAME.menu == "uploadsel" || GAME.menu == "capturesel" || GAME.menu == "fighterinstru" || GAME.menu == "fighterstart") {
            playSound("create.mp3")

            img(ImageMemory["createselect.png"], 0, 0, 1200, 800, 0, 0, w, h)

            font("48px Nitro")
            fstyle("white")

            const t = menuTitles[GAME.menu] || ""
            text(t, (w - 350), 60)

            queueNote()
        }
        else if (GAME.menu == "createbg") {
            if ((!curCam || (!curCam.active)) && GAME.buttonLayout != "newbackground") {
                img(ImageMemory[(GAME.buttonLayout != "backgroundsave") && "createbg.png" || "finishbg.png"], 0, 0, 1200, 800, 0, 0, w, h)
            }
            else {
                img(ImageMemory["createbgtake.png"], 0, 0, 1200, 800, 0, 0, w, h)
            }

            font("48px Nitro")
            fstyle("white")

            const t = menuTitles[GAME.menu] || ""
            text(t, (w - 350), 60)

            if (GAME.buttonLayout && GAME.buttonLayout.includes("background")) {
                if (curCam) { // max res should be 640x480
                    vW = curCam.video.videoWidth
                    vH = curCam.video.videoHeight
                }

                // background
                if (GAME.buttonLayout != "backgroundsave") {
                    // clear the left
                    CTX.clearRect(0, 0, (w / 2), h)

                    let image = imported.backgrounds[backgroundSlot]
                    if ((!curCam || !curCam.active) && !image) {
                        img(ImageMemory["space.png"], 0, 0, 256, 128, 0, 0, (w / 2), h)
                        img(ImageMemory["bgplaceholder.png"], 0, 0, 450, 425, 50, 205, 500, 420)
                        CTX.drawImage(ImageMemory["bgmaskshape.png"], 0, 0, 192, 256, 0, 0, (w / 2), h)
                    }
                    else {
                        if (image && (!curCam || !curCam.active)) {
                            img(ImageMemory["space.png"], 0, 0, 256, 128, 0, 0, (w / 2), h)
                            img(newImage(image, true), 0, 0, 640, 480, 50, 205, 500, 420)
                            CTX.drawImage(ImageMemory["bgmaskshape.png"], 0, 0, 192, 256, 0, 0, (w / 2), h)
                        }
                        else {
                            curCam.draw(CTX, 0, 0, vW, vH, 0, 0, (w / 2), h)
                            CTX.drawImage(ImageMemory["bgmaskgreen.png"], 0, 0, 192, 256, 0, 0, (w / 2), h)
                            CTX.drawImage(ImageMemory["bgmaskshape.png"], 0, 0, 192, 256, 0, 0, (w / 2), h)

                            CTX.save()
                            fstyle("green")
                            CTX.beginPath()
                            CTX.roundRect(0, -200, (w / 2), 300, 60)
                            CTX.fill()
                            CTX.restore()

                            fstyle("white")
                            font("38px Humming")
                            text("Create a background!", 300, 60)
                        }
                    }
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

                    img(curPic, 0, 0, 640, 480, 80, 205, 440, 390)
                }
                else {
                    messageBox("An error occurred", true, function () {
                        transition(function () {
                            GAME.buttonLayout = null
                        })
                    })
                }
            }
            else {
                queueNote()
            }
        }
        else if (GAME.menu == "selectbg") {
            const songName = songOrder[profile.track]
            
            playSound(`${songName}.mp3`)

            img(ImageMemory["selectbg.png"], 0, 0, 256, 256, 0, 0, w, (h * 1.33))

            fstyle("white")
            font("32px Humming")
            text("Select a background and a soundtrack.", cenX, 50)

            CTX.beginPath()
            CTX.roundRect((cenX + 50), (cenY - 220), 520, 440, 60)
            CTX.fill()

            img(ImageMemory["radio.png"], 0, 0, 334, 43, (w - 700), (cenY + 225), 668, 86)

            font("28px Humming")
            text(songNames[songName], (w - 375), (cenY + 280))
        }
        else if (GAME.menu == "createfighter") {
            img(ImageMemory["createfighter.png"], 0, 0, 1200, 800, 0, 0, w, h)

            font("48px Nitro")
            fstyle("white")

            const t = menuTitles[GAME.menu] || ""
            text(t, (w - 250), 60)

            if (curCam) { // max res should be 640x480
                vW = curCam.video.videoWidth
                vH = curCam.video.videoHeight
            }

            // fighter
            const fData = imported.fighters[editingFighter]

            if (GAME.buttonLayout != "fightersave") {
                // clear the left
                CTX.clearRect(0, 0, (w / 2), h)

                const data = photoOrder[photoNum]

                let image = ((fData) && fData.photos[photoNum])
                if ((!curCam || !curCam.active) && !image) {
                    img(ImageMemory["space.png"], 0, 0, 256, 128, 0, 0, (w / 2), h)
                    img(ImageMemory["feedplaceholder.png"], 0, 0, 450, 425, 75, 190, 450, 425)
                }
                else {
                    if (image) {
                        img(ImageMemory["space.png"], 0, 0, 256, 128, 0, 0, (w / 2), h)
                        img(newImage(image, true), 0, 0, 640, 480, 75, 190, 450, 405)
                    }
                    else {
                        curCam.draw(CTX, 0, 0, vW, vH, 0, 0, (w / 2), h)

                        CTX.drawImage(ImageMemory[`${data.type}maskyellow.png`], 0, 0, 192, 256, 0, 0, (w / 2), h)
                        CTX.drawImage(ImageMemory[`${data.type}maskshape.png`], 0, 0, 192, 256, 0, 0, (w / 2), h)
                    }
                }
                
                CTX.save()
                fstyle("rgb(248, 118, 0)")
                CTX.beginPath()
                CTX.roundRect(0, -200, (w / 2), 300, 60)
                CTX.fill()
                CTX.restore()

                fstyle("white")
                font("38px Humming")
                text(data.name, 300, 60)
            }
            else if (curPic && (curPic.src)) {
                font("38px Humming")
                fstyle("white")
                text("Save this photo?", 300, 60)

                CTX.save()
                fstyle("orange")
                CTX.beginPath()
                CTX.roundRect(50, 175, 500, 450, 60)
                CTX.fill()
                CTX.restore()

                img(curPic, 0, 0, 640, 480, 80, 205, 440, 390)
            }
            else {
                messageBox("An error occurred", true, function () {
                    transition(function () {
                        GAME.buttonLayout = null
                    })
                })
            }

            // right side stuff

            for (let i = 0; (i < adtLen(photoOrder)); i++) {
                const t = ((photoNum == i) && "blink") || "empty"

                if (i > 0) {
                    let a = (i - 1)
                    const row = Math.floor((a / 4))
                    if (!fData || (!fData.photos[photoNum])) {
                        img(ImageMemory[`${t}fighter.png`], 0, 0, 42, 42, ((cenX + 25) + (140 * (a - (row * 4)))), (250 + (140 * row)), 105, 105)
                    }
                    else {
                        img(ImageMemory["fullfighter.png"], 0, 0, 44, 44, ((cenX + 25) + (140 * (a - (row * 4)))), (250 + (140 * row)), 120, 120)
                        img(newImage(fData.photos[photoNum], true), 0, 0, 50, 50, ((cenX + 25) + (140 * (a - (row * 4)))), (250 + (140 * row)), 125, 125)
                    }
                }
                else {
                    if (!fData || (!fData.photos[photoNum])) {
                        img(ImageMemory[`${t}fighterlarge.png`], 0, 0, 59, 59, (cenX + 25), 75, 153, 153)
                    }
                    else {
                        img(ImageMemory["fullfighterlarge.png"], 0, 0, 64, 63, (cenX + 25), 75, 160, 160)
                        img(newImage(fData.photos[photoNum], true), 0, 0, 70, 70, (cenX + 25), 75, 175, 175)
                    }
                }
            }
        }

        // load any MENU buttons here
        for (const b of menuButtons(GAME.menu)) {
            determineAutoSelect(b)
            b.draw()

            if (b.name.includes("bgbutton")) { // background edit
                let image = imported.backgrounds[b.name.replace("bgbutton", "")]

                if (image) {
                    img(newImage(image, true), 0, 0, 640, 480, (b.position.x + 8), (b.position.y + 18), 102, 84)
                }
                else {
                    img(ImageMemory["bgcammissing.png"], 0, 0, 29, 24, (b.position.x + 23), (b.position.y + 25), 73, 60)
                }
            }
            else if (b.name.includes("selbackg")) { // background select
                let image = imported.backgrounds[b.name.replace("selbackg", "")]

                if (image) {
                    if (b.state == "l") b.state = "i" // unlock button if it is locked

                    const raw = newImage(image, true)

                    img(raw, 0, 0, 640, 480, (b.position.x + 4), (b.position.y + 20), 112, 92) // draw the background thumbnail

                    // if we aren't idle, assume select, draw the background to the large preview
                    if (b.state != "i") {
                        const fAnim = Animators.bgflame

                        if (!fAnim.playing) fAnim.play()

                        if (fAnim.times > -1) img(ImageMemory[`bgflame${fAnim.times}.png`], 0, 0, 71, 78, (b.position.x - 8), (b.position.y - 32), 142, 156)
                        img(raw, 0, 0, 640, 480, (cenX + 75), (cenY - 187), 475, 375)
                    }
                }
                else { // no background exists put a "?" and lock
                    b.state = "l"
                    img(ImageMemory["bgmissing.png"], 0, 0, 22, 32, (b.position.x + 30), (b.position.y + 15), 55, 80) 
                }
            }
        }

        // button layouts (non-menu connected buttons)
        if (GAME.buttonLayout && GAME.buttonLayout.includes("background")) {
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
            text(`buttons: ${Buttons.length} (m: ${menuButtons(GAME.menu, GAME.buttonLayout).length})`, 20, 160)
        }
    }

    // load any button layouts over the others
    for (const b of menuButtons(undefined, GAME.buttonLayout)) {
        determineAutoSelect(b)
        b.draw()
    }

    // Handle message boxes
    if (msgBox.visible) {
        img(ImageMemory["msgbox.png"], 0, 0, 208, 160, msgBox.x, msgBox.y, 416, 320)

        if (msgBox.text) {
            fstyle("black")
            font("22px Humming")

            if (typeof (msgBox.text) != "string") {
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
    setTimeout(function () { // stop 'loading' after a random time
        loadingComplete = true
    }, randInt(1000, 3000))
    CANVAS.removeEventListener("mousedown", start) // rid the event listener
}

CANVAS.addEventListener("mousedown", start)

// Prevent certain browser controls
document.addEventListener("contextmenu", ev => {
    ev.preventDefault()
})
window.addEventListener("keydown", function(ev) {
    if (ev.keyCode == 32 || ev.keyCode == 37 || ev.keyCode == 39) {
        ev.preventDefault()
    }
})

export default { GAME }