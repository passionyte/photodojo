/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: images.js
 * Description: Handles image memory and creation.
 *
 * Author: Logan
 */

'use strict'

import { URL } from "./globals.js"

export const ImageMemory = {}

export function newImage(n, e) { // e is external; meaning external URL
    let i = ImageMemory[n] // if already created, return the image, no point in creating duplicates like in sounds
    if (i) return i

    i = new Image()
    i.src = e && n || (URL + "imgs/") + n || "template.jpg" // ensure the image can be found

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
newImage("gradeAA.png")
newImage("gradeAAA.png")
newImage("gradeS.png")
newImage("VS.png")
newImage("VSui.png")
newImage("battlebutton.png")
newImage("createbutton.png")
newImage("vsbutton.png")
newImage("survivalbutton.png")
newImage("sbutton.png")
newImage("sbuttonsel.png")
newImage("sbuttonpress.png")
newImage("lbutton.png")
newImage("lbuttonsel.png")
newImage("lbuttonpress.png")
newImage("pause.png")
newImage("2pdrawbg.png")
newImage("2pwinbg.png")
newImage("loser.png")
newImage("draw.png")
newImage("1pfacebase.png")
newImage("1pfacelose.png")
newImage("1pfacewin.png")
newImage("2pfacebase.png")
newImage("2pfacelose.png")
newImage("2pfacewin.png")
newImage("winner.png")
newImage("createselect.png")
newImage("createbg.png")
newImage("createvoice.png") // TODO: needs work to be combined with another image on the left (same with fighter edit)
newImage("hit.png")
newImage("bgbutton.png")
newImage("bgbuttonsel.png")
newImage("bgbuttonpress.png")
newImage("space.png")
newImage("feedplaceholder.png")
newImage("finishbg.png")
newImage("bgplaceholder.png")

for (let i = 0; (i < 6); i++) newImage(`ready${i}.png`)
for (let i = 0; (i < 12); i++) newImage(`attack${i}.png`)
for (let i = 0; (i < 10); i++) newImage(`num${i}.png`)
for (let i = 0; (i < 6); i++) newImage(`nav${i}.png`)
for (let i = 0; (i < 4); i++) newImage(`flame${i}.png`)
for (let i = 0; (i < 10); i++) newImage(`score${i}.png`)
for (let i = 0; (i < 8); i++) newImage(`load${i}.png`)

export default { ImageMemory }