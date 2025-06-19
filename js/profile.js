// Passionyte 2025

'use strict'

import { parse, stringify } from "./globals.js"

export const defProfile = {
    best: { // best survival results
        points: 0,
        rank: "Fail",
        enemies: 0
    },
    track: 1 // music track player selected
}

const key = "PhotoDojoJS" // localStorage key
export let loaded = false
export let profile = loadData() || defProfile
export let imported = { // stores large background and fighter data
    backgrounds: {},
    fighters: {}
}
export const filename = "photodojojs_exports" // exported fighter & backgrounds file name

export function saveData(newProfile) { // saves localStorage data
    if (loaded) {
        localStorage.setItem(key, stringify(newProfile))
        profile = newProfile
    }
}

export function loadData() { // loads localStorage data
    const s = localStorage.getItem(key)

    if (s) return parse(s) // return the loaded data

    loaded = true
}

export function importData(str) { // imports fighter and background file
    const data = parse(str)

    if (data.backgrounds && data.fighters) { // simply read the parsed data and make sure we can find some fighter and background data
        imported = data
        return data
    }

    return false
}

export function exportData() { // exports fighter and background file
    const str = stringify(imported)

    const f = new File([str], filename + ".txt") // create the .txt file with the contents being our JSON string

    const l = document.createElement("a") // create a interactable file download button
    l.style.display = "none" // but make sure the player can't see or interact with it
    l.href = URL.createObjectURL(f)
    l.download = f.name // set the object to our newly created file

    l.click() // forces download window to open

    setTimeout(function() {
        l.remove()
    }, 1000)
}

export default { profile }