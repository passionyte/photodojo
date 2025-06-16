/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: notes.js
 * Description: Contains long type out notes and descriptions for UI
 *
 * Author: Logan
 */

'use strict'

import { imported } from "./profile.js"
import { adtLen } from "./globals.js"

export const Notes = {
    createselect: {
        [0]: "Here's your chance", 
        [1]: "to create and edit",
        [2]: "backgrounds and",
        [3]: "fighters!",
        [4]: "   ",
        [5]: "Fighter slots",
        [6]: `remaining: ${(8 - adtLen(imported.fighters))}`
    },
    fighternext: {
        [0]: "Take photos and",
        [1]: "record sounds to",
        [2]: "create your own",
        [3]: "customized fighter.",
        [4]: "Build a stable of",
        [5]: "ruthless fighting",
        [6]: "machines!"
    },
    capturesel: {
        [0]: "Here, you will use",
        [1]: "photos to bring",
        [2]: "your fighters to life!",
        [3]: "  ",
        [4]: "Please choose how you",
        [5]: "wish to proceed with",
        [6]: "providing your photos!"
    },
    uploadsel: {
        [0]: "Please choose how you",
        [1]: "wish to upload your photos!",
        [2]: "  ",
        [3]: "Individual: Upload one by one.",
        [4]: "Template: Found on this site.",
        [5]: "  ",
        [6]: "Edit it as you desire!"
    },
    createbg: {
        [0]: "To save a new",
        [1]: "background or",
        [2]: "retake the photo",
        [3]: "of an existing",
        [4]: "background,",
        [5]: "tap any slot."
    },
    fighterinstru: {
        [0]: "You'll need to take",
        [1]: "13 pictures and",
        [2]: "record 10 different",
        [3]: "sounds to create a",
        [4]: "successful fighter.",
        [5]: "  ",
        [6]: "Let's get to work!"
    },
    fighterstart: {
        [0]: "Use the camera",
        [1]: "to take pictures of",
        [2]: "yourself in a variety",
        [3]: "of fighting poses!"
    },
    na: {
        [0]: "No information is",
        [1]: "available for this menu."
    }
}

export const Messages = {
    import: {
        [0]: `Successfully imported:`,
        [1]: `${adtLen(imported.fighters)} fighters and ${adtLen(imported.backgrounds)} backgrounds.`,
        [2]: `Data size: ${imported.size}`
    },
    camera: {
        [0]: "Please allow Photo Dojo JS",
        [1]: "access to your webcam."
    },
    noCamera: {
        [0]: "Photo Dojo JS was unable",
        [1]: "to find or load your webcam.",
    },
    wrongBackgroundSize: {
        [0]: "Your uploaded background size",
        [1]: "is larger than 640x480.",
        [2]: "Please ensure it is 640x480",
        [3]: "to allow for proper dimensions."
    }
}

export const modeDescriptions = {
    versus: "Have some chaotic fun with a friend!",
    survival: "Defeat 100 enemies and show you rock!",
    modeback: "Return to the title screen",
    na: "Select a mode"
}

export const menuTitles = {
    createselect: "Create main menu",
    capturesel: "Capture type",
    uploadsel: "Upload type",
    createbg: "Create background",
    createfighter: "Photo shoot"
}

export const photoOrder = {
    [0]: { name: "Game face!", type: "basic", write: "face" },
    [1]: { name: "Face of defeat!", type: "basic", write: "defeat" },
    [2]: { name: "Fireball!", type: "fireball", write: "fireball" },
    [3]: { name: "Punch!", type: "punch", write: "punch" },
    [4]: { name: "Battle stance!", type: "stance", write: "stance" },
    [5]: { name: "March!", type: "march", write: "march" },
    [6]: { name: "Take damage!", type: "hurt", write: "hurt" },
    [7]: { name: "Kick!", type: "kick", write: "kick" },
    [8]: { name: "Shoot a fireball!", type: "shoot", write: "shoot" },
    [9]: { name: "Duck and cover!", type: "crouch", write: "crouch" },
    [10]: { name: "Jump!", type: "jump", write: "jump" },
    [11]: { name: "Taunt your opponent!", type: "taunt", write: "taunt" },
    [12]: { name: "Strike a victory pose!", type: "victory", write: "victory" },
}

export const soundOrder = {
    [0]: { name: "Greet your opponent!", example: "You're going down!" },
    [1]: { name: "Howl of defeat!", example: "Noooooo!!!!" },
    [2]: { name: "Punch sound!", example: "This is gonna hurt!" },
    [3]: { name: "You've been hit!", example: "That'll leave a mark!" },
    [4]: { name: "Kick sound!", example: "Hiiiiii-YAH!" },
    [5]: { name: "Fireball warning!", example: "In your face!" },
    [6]: { name: "Taunt your opponent!", example: "That all you got?!" },
    [7]: { name: "Victory cheer!", example: "I reign supreme!" },
    [8]: { name: "Signature Move!", example: "Get a load of this!" },
    [9]: { name: "Desperation Move!", example: "Not without a fight!" }
}

export default { Notes }