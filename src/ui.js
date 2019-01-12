export function distanceAlert(distance, duration = 4000) {
    let el = document.getElementById("distance")

    el.innerHTML = `${distance} <span>m</span>`
    el.classList.add("on")

    setTimeout(() => el.classList.remove("on"), duration)
}
