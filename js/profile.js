// Passionyte 2025

'use strict'

import { parse, stringify } from "./globals.js"

export const defProfile = {
    best: {
        points: 0,
        rank: "Fail",
        enemies: 0
    },
}

const key = "PhotoDojoJS"
export let loaded = false
export let profile = loadData() || defProfile
export let imported = {
    backgrounds: {},
    fighters: {}
}
export const filename = "photodojojs_exports.txt"

export function saveData(newProfile) {
    if (loaded) {
        localStorage.setItem(key, stringify(newProfile))
        profile = newProfile
    }
}

export function loadData() {
    const s = localStorage.getItem(key)

    if (s) {
        return parse(s)
    }

    loaded = true
}

export function importData(str) {
    const data = parse(str)

    if (data.backgrounds && data.fighters) {
        imported = data
        return data
    }

    return false
}

export function exportData() {
    const str = stringify(imported)

    const f = new File([str], filename)

    const l = document.createElement("a")
    l.style.display = "none"
    l.href = URL.createObjectURL(f)
    l.download = f.name

    l.click()

    setTimeout(function() {
        l.remove()
    }, 1000)
}

export default { profile }