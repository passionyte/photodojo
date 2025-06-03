/**
 * ICS4U - Final Project (RST)
 * Mr. Brash 🐿️
 * 
 * Title: profile.js
 * Description: Handles saving and loading player profiles.
 *
 * Author: Logan
 */

'use strict'

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
        localStorage.setItem(key, JSON.stringify(newProfile))
        profile = newProfile
    }
}

export function loadData() {
    const s = localStorage.getItem(key)

    if (s) {
        return JSON.parse(s)
    }

    loaded = true
}

export function importData(str) {
    console.log(str)

    const data = JSON.parse(str)

    if (data.backgrounds && data.fighters) {
        imported = data
        console.log("success")
        return data
    }

    return false
}

export function exportData() {
    const str = JSON.stringify(imported)

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