// Passionyte 2025

'use strict'

import { VIDEO, helperCANVAS, helperCTX, DEBUG } from "./globals.js"

export class Camera {
    active = false
    width
    height
    video
    helper // represents a helper canvas for getting the contents of video

    init() {
        if (DEBUG) globalThis.cam = this
        if (!this.active) {
            // initialize the user's web cam as our source
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                this.video.srcObject = stream
                this.video.play()
            })
            .catch((err) => { // got an error, disable
                console.error(err)    
                this.active = false
            })

            this.video.addEventListener("canplay", (ev) => {
                this.active = true

                // set width and height
                this.video.width = this.width
                this.video.height = this.height
                this.helper.width = this.width
                this.helper.height = this.height
                /*this.helper.style.width = this.width
                this.helper.style.height = this.height*/

                helperCTX.drawImage(this.video, 0, 0, this.width, this.height)
            })
        }
    }

    stop() {
        if (this.active) {
            this.active = false
            this.video.srcObject = undefined
            this.video.pause() // idk
        }
    }

    photo() {
        // return the 'photo'
        if (this.active) return this.helper.toDataURL("image/png")

        return false
    }

    draw(ctx, x = 0, y = 0, w = this.width, h = this.height) { // draws LIVE video contents
        if (!this.active) return

        try {
            ctx.drawImage(this.video, 0 + w/2, 0 + h/2, (w), (h), x, y, w, h*2) 
            setTimeout(function() {
                try { 
                    ctx.drawImage(this.video, 0 + w/2, 0 + h/2, (w), (h), x, y, w, h*2) 
                }
                catch (e) {}
            }, 100)
        }
        catch (e) {}
    }

    constructor(v = VIDEO, helper = helperCANVAS, w = 600, h = 400) {
        this.video = v
        this.helper = helper
        this.helperCTX = helper.getContext("2d") || helperCTX
        this.width = w
        this.height = h
    }
}

export default { Camera }