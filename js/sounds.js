// Passionyte 2025

'use strict'

import { URL } from "./globals.js"

export const SoundMemory = {}

export function newSound(save, src, v, l) {
    const s = new Audio((URL + "snds/") + src) // combine the URL so our reference is found regardless if this is the preview or a live site

    s.volume = v || 0.1
    s.loop = (l)
    s.preload = "metadata" // ensure we preload audios to avoid unnecessary Silence. . .

    if (save) SoundMemory[src] = s // log to memory if chosen
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

// preload definitions

newSound(true, "go.wav")
newSound(true, "ready.wav")
newSound(true, "100enemies.wav")
newSound(true, "mode.wav")

export default { SoundMemory }