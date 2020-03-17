import anime from "animejs" 

export default function animate({
    from,
    to,
    render,
    complete = () => { },
    timeout = 0,
    duration=300,
    easing = "easeOutQuart",
    ...rest
}) {
    let targets = from
    let id = setTimeout(() => {
        console.log("anime")
        anime({
            targets,
            ...to,
            duration,
            easing,
            ...rest,
            change() {
                render(targets) 
            },
            complete() {
                render(targets)
                complete(targets) 
            }
        })
    }, timeout)

    return () => {
        anime.remove(targets)
        clearTimeout(id)
    }
}