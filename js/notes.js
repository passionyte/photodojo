// Passionyte 2025

'use strict'

import { profile } from "./profile.js"
import { adtLen } from "./globals.js"

export const Notes = {
    createselect: {
        [0]: "Here's your chance", 
        [1]: "to create and edit",
        [2]: "backgrounds and",
        [3]: "fighters!",
        [4]: "   ",
        [5]: "Fighter slots",
        [6]: `remaining: ${(8 - adtLen(profile.fighters))}`
    },
    fighternext: {
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

export default { Notes }