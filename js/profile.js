// Passionyte 2025

'use strict'

export const defProfile = {
    best: {
        points: 0,
        rank: "Fail",
        enemies: 0
    },
    fighters: {},
    backgrounds: {}
}

const key = "PhotoDojoJS"
export let loaded = false
export let profile = loadData() || defProfile

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

export default { profile }