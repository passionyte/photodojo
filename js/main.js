import { CANVAS, CTX, w, h, cenX, cenY, MS_PER_FRAME } from "./globals.js"

let NOW = performance.now()

function update() {
    requestAnimationFrame(update)

    // Begin FPS trap

    const time_since = (performance.now() - NOW)

    if (time_since < MS_PER_FRAME) return
    console.log(time_since)

    NOW = performance.now()

    // End FPS trap

    
}
update()