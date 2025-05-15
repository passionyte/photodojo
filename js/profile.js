export const defProfile = {
    best: {
        points: 0,
        rank: "Fail",
        enemies: 0
    }
}

const key = "PhotoDojo"
export let profile = loadData() || defProfile
export let loaded = false

export function saveData() {
    if (profile.best > 0 && loaded) {
        localStorage.setItem(key, JSON.stringify(profile))
    }
}

export function loadData() {
    const s = localStorage.getItem(key)

    if (s) {
        loaded = true

        return JSON.parse(s)
    }
}

export default { profile }