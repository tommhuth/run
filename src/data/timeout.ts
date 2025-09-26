export default function timeout(cb: () => void, delay: number){ 
    let rafId: number
    let time = 0
    let prev:number
    const tick = () => {
        if (prev) {
            time += Math.min(Date.now() - prev, (1 / 30) * 1000) 
        }  

        prev = Date.now()

        if (time >= delay) {
            cb()
        } else {
            rafId = requestAnimationFrame(tick)
        }
    }

    tick()

    return () => {
        cancelAnimationFrame(rafId)
    }
} 