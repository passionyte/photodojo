// Passionyte 2025

'use strict'

export const defProfile = {
    best: {
        points: 0,
        rank: "Fail",
        enemies: 0
    }
}

const key = "PhotoDojoJS"
export let profile = loadData() || defProfile
export let loaded = false

export function saveData(newProfile) {
    if (newProfile.best > 0 && loaded) {
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