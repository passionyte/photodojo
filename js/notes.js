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
    na: {
        [0]: "No information is",
        [1]: "available for this menu."
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
    createbg: "Create background"
}

export default { Notes }