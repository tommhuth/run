export function flip() {
    return Math.random() > .5 ? 1 : -1
}

export function getFlipRotation() {
    const rotations = [0, Math.PI, -Math.PI, Math.PI * 2, Math.PI * -2]
    
    return rotations[Math.floor(Math.random() * rotations.length) ]
}

export function resize(mesh, width, height, depth) {
    mesh.scaling.set(1/mesh.width * width, 1/mesh.height * height, 1/mesh.depth * depth)
}
  
export function randomList(...args) {
    return args[Math.floor(Math.random() * args.length)]
}

export function getRandomRotation(){
    return Math.PI * 2 * Math.random() * flip()
}
