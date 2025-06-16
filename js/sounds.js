/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: sounds.js
 * Description: Sound engine script that will create, store and play sounds.
 *
 * Author: Logan
 */

'use strict'

import { URL } from "./globals.js"

export const SoundMemory = {}

export function newSound(save, src, v, l) {
    const s = new Audio((URL + "snds/") + src) // combine the URL so our reference is found regardless if this is the preview or a live site

    s.volume = v || 0.1
    s.loop = (l)
    s.preload = "metadata" // ensure we preload audios to avoid unnecessary Silence. . .

    if (save) SoundMemory[src] = s // log to memory if chosen

    return s
}

export function playSound(src, n) {
    const s = SoundMemory[src]

    if (s) {
        if (!n) { // play the sound, starting it over
            s.play()
        }
        else { // create a new sound and play it (may be unreliable?)
            newSound(false, src, s.volume, s.loop).play()
        }
    }
}

export function stopSound(src) {
    if (typeof(src) != "string") {
        src.pause()
        src.currentTime = 0
    }
    else {
        const s = SoundMemory[src]

        if (s) {
            s.pause()
            s.currentTime = 0
        }
    }
}

// preload definitions

newSound(true, "go.wav")
newSound(true, "ready.wav")
newSound(true, "100enemies.wav")
newSound(true, "mode.wav")
newSound(true, "title.mp3", undefined, true)
newSound(true, "victory.mp3")
newSound(true, "loading.wav", undefined, true)
newSound(true, "loadingcomplete.wav")
newSound(true, "select.wav")
newSound(true, "pause.wav")
newSound(true, "resume.wav")
newSound(true, "text.wav")
newSound(true, "titlebutton.wav")
newSound(true, "titlecancel.wav")
newSound(true, "createbutton.wav")
newSound(true, "createcancel.wav")
newSound(true, "taunt.wav")
newSound(true, "attention.wav")
newSound(true, "start.wav")
newSound(true, "battle.mp3", undefined, true)
newSound(true, "results.mp3", undefined, true)
newSound(true, "create.mp3", undefined, true)
newSound(true, "electro.mp3", undefined, true)
newSound(true, "rockandroll.mp3", undefined, true)
newSound(true, "clubbeat.mp3", undefined, true)

export default { SoundMemory }