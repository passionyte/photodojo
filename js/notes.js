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
        [4]: "    ",
        [5]: "Fighter slots",
        [6]: `remaining: ${(8 - adtLen(profile.fighters))}`
    },
    fighternext: {
        [0]: "Here, you will use",
        [1]: "photos to bring",
        [2]: "your fighters to life!",
        [3]: "   ",
        [4]: "Please choose how you",
        [5]: "wish to proceed with",
        [6]: "providing your photos!"
    },
    na: {
        [0]: "No information is",
        [1]: "available for this menu."
    }
}

export default { Notes }