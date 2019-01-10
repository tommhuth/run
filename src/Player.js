 
import { MeshBuilder, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"
import materials from "./materials"

const PLAYER_DIAMETER = .5

export default class Player {
    score = 0  
    rotation = 0
    targetRotation = 0
    speed = 4  
    canJump = false  

    constructor(scene, shadowGenerator) {
        const mesh = MeshBuilder.CreateSphere(null, { segments: 10, diameter: PLAYER_DIAMETER }, scene) 

        mesh.material = materials.player
        mesh.receiveShadows = true
        mesh.position.set(0, 20, 0)  
        mesh.physicsImpostor = new Impostor(mesh, Impostor.SphereImpostor, { mass: 0, restitution: 0, friction: 0 }, scene)
        
        this.mesh = mesh
        this.scene = scene  
 
        shadowGenerator.addShadowCaster(mesh)
    }
    get impostor() {
        return this.mesh.physicsImpostor
    }
    get position() {
        return this.mesh.position
    } 
    start() { 
        this.rotation = 0 
        this.position.set(0, PLAYER_DIAMETER / 2 + .25, 10) 
        this.impostor.setMass(1)  
    }
    jump() { 
        if (this.canJump) { 
            this.canJump = false 
            this.impostor.applyImpulse(new Vector3(0, 5, 0), this.position)  
        }
    }
    move(rotation) { 
        this.targetRotation = rotation
    }
    getAbsolutePosition() {
        return this.mesh.getAbsolutePosition()
    }
    beforeRender(pathway) {   
        for (let block of pathway.path) { 
            let isWithin = this.position.z >= block.position.z  && this.position.z  <= block.position.z + block.depth 
            
            if (isWithin) { 
                let result = false 

                for (let child of block.floor) {
                    if (child.intersectsMesh(this.mesh, false)) {
                        result = true
                        break
                    }
                }
 
                this.canJump = result
            }
        }   
    }
}  
