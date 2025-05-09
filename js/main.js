import { CANVAS, CTX, w, h, cenX, cenY, MS_PER_FRAME } from "./globals.js"
import { Fighter } from "./fighter.js"

let NOW = performance.now()
const P1 = new Fighter(cenX, cenY, 137, 256)

function update() {
    requestAnimationFrame(update)

    // Begin FPS trap

    const time_since = (performance.now() - NOW)

    if (time_since < MS_PER_FRAME) return

    console.log(`FPS: ${time_since * 1000}`)
    console.log(time_since)

    NOW = performance.now()

    // End FPS trap

    P1.update()
}
update()