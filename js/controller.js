// Passionyte 2025

'use strict'

import { GAME } from "./main.js"

export const KEYS = {
    // P1 controls
    SPACE:32, // jump
    W:87, // jump
    A:65,
    S:83,
    D:68, // duck
    O:79, // taunt
    P:80, // attack
    // P2 controls
    UP:38, // jump
    DN:40, // duck
    LT:37,
    RT:39,
    ENTER:13, // jump
    DEL:110, // taunt
    PGDN:99, // attack
    // Misc controls
    BACKSPACE:8
}

class Bind {
    type
    key
    action

    constructor(t, k, a) {
        this.type = t
        this.key = k
        this.action = a
    }
}

export class Controller {
    binds = []
    downKeys = []
    owner

    isKeyFromClassDown(c) {
        let result = false

        for (const b of this.binds) {
            if ((b.type == c) && this.downKeys[b.key]) {
                result = true
                break
            }    
        }

        return result
    }

    isKeyDown(k) {
        return (this.downKeys[k])
    }

    bindNew(t, k, a) {
        if (typeof(k) == "string") k = KEYS[k]

        const b = new Bind(t, k, a)

        this.binds.push(b)
    }

    findBindFromKeyCode(c) {
        let result
        
        for (const b of this.binds) {
            if (b.key == c) {
                result = b
                break
            }
        }

        return result
    }

    onKeyDown(key) {
        const bind = this.findBindFromKeyCode(key)

        if (bind) {
            if (!this.downKeys[key] && GAME.controls) {
                this.downKeys[key] = true

                if (bind.action) this.owner[bind.action]()
            }
        }
    }

    onKeyUp(key) {
        const bind = this.findBindFromKeyCode(key)

        if (bind) {
            if (this.downKeys[key]) this.downKeys[key] = false
        }
    }

    constructor(b, o) {
        for (const a of b) this.bindNew(a.type, a.key, a.action) // Bind all inputs sent into constructor
        this.owner = o // assign a 'owner' of the controller

        document.addEventListener("keydown", e => {
            this.onKeyDown(e.keyCode)
        })
        document.addEventListener("keyup", e => {
            this.onKeyUp(e.keyCode)
        })
    }
}

export default { Controller }