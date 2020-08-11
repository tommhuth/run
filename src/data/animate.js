import anime from "animejs"

export default function animate({
    from,
    to,
    render = () => { },
    complete = () => { },
    start = () => { }, 
    delay = 0,
    duration = 300,
    easing = "easeOutQuart",
    ...rest
}) { 
    let targets = from
    let id = setTimeout(() => {
        anime({
            targets,
            ...to,
            duration,
            easing, 
            change() {
                render(targets)
            },
            complete() {
                render(targets)
                complete(targets)
            },
            ...rest,
            begin: start
        })
    }, delay)

    return () => {
        anime.remove(targets)
        clearTimeout(id)
    }
}