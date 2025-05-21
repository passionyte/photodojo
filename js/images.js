// Passionyte 2025

'use strict'

import { URL } from "./globals.js"

export const ImageMemory = {}

export function newImage(n) {
    let i = ImageMemory[n] // if already created, return the image, no point in creating duplicates like in sounds
    if (i) return i

    i = new Image()
    i.src = (URL + "imgs/") + n || "template.jpg" // ensure the image can be found

    ImageMemory[n] = i // log to memory

    return i
}

// Image preloads

newImage("healthbar.png")
newImage("healthfill.png")
newImage("shadow.png")
newImage("plricon.png")
newImage("enemycounter.png")
newImage("100enemies.png")
newImage("100enemiesflash.png")
newImage("background.jpg")
newImage("clear.png")
newImage("title.png")
newImage("survivalbg.png")
newImage("survivalbgwin.png")
newImage("newrecord.png")
newImage("survivalclear.png")
newImage("scorebox.png")
newImage("scoreboxgreen.png")
newImage("scoreboxlong.png")
newImage("scoreboxlarge.png")
newImage("gradeC.png")
newImage("gradeB.png")
newImage("gradeA.png")
newImage("gradeS.png")
newImage("VS.png")
newImage("battlebutton.png")
newImage("createbutton.png")
newImage("vsbutton.png")
newImage("survivalbutton.png")

for (let i = 0; (i < 6); i++) newImage(`ready${i}.png`)
for (let i = 0; (i < 12); i++) newImage(`attack${i}.png`)
for (let i = 0; (i < 10); i++) newImage(`num${i}.png`)
for (let i = 0; (i < 6); i++) newImage(`nav${i}.png`)
for (let i = 0; (i < 4); i++) newImage(`flame${i}.png`)
for (let i = 0; (i < 10); i++) newImage(`score${i}.png`)
for (let i = 0; (i < 8); i++) newImage(`load${i}.png`)