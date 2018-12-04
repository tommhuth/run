import { MeshBuilder, PhysicsHelper, PhysicsRadialImpulseFalloff } from "babylonjs"

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

export function makeGroup(scene, visible = false){
    const mesh = MeshBuilder.CreateGround(null, { width: .1, height: .1, subdivisions: 1 }, scene)

    if (visible) { 
        mesh.visibility = 1
    } else {
        mesh.isVisible = false 
    } 

    return mesh
}

export function explode(scene, position, radius, strength, delay = 0, debug = false) {
    setTimeout(() => {
        const physicsHelper = new PhysicsHelper(scene)  
        const explosion = physicsHelper.applyRadialExplosionForce(position, radius, strength, PhysicsRadialImpulseFalloff.Linear) 
          
        if (debug) { 
            explosion.getData().sphere.isVisible = true
            explosion.getData().sphere.visibility = .3   
        }
    }, delay)
}
