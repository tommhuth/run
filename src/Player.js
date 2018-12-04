 
import { MeshBuilder, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"  
import uuid from "uuid"

export default class Player {
    score = 0  
    rotation = 0
    speed = 4
    previousY = 0
    jumping = true
    allowsJumping = true

    constructor(scene) {
        const mesh = MeshBuilder.CreateSphere(uuid.v4(), { segments: 16, diameter: .35 }, scene)
        
        mesh.position.set(0, 1, 0) 
        mesh.physicsImpostor = new Impostor(mesh, Impostor.SphereImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)

        this.mesh = mesh
        this.scene = scene 

        window.addEventListener("deviceorientation", (e) => {
            this.rotation = e.gamma
        }, false)

        document.addEventListener("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            
            if (!this.jumping && this.allowsJumping) {
                this.jumping = true
                this.allowsJumping = false 
                setTimeout(() => {
                    this.allowsJumping = true
                    console.log("allows is true")
                }, 500) 
                //console.log("jumping", this.jumping)
                this.mesh.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), this.mesh.position)  
            }
        })
        document.addEventListener("keydown", e => {
            if(e.keyCode === 68){
                this.speed = 4
            }
            if(e.keyCode === 65){
                this.speed = -4
            }
        })
    }

    get position() {
        return this.mesh.position
    }

    getAbsolutePosition() {
        return this.mesh.getAbsolutePosition()
    }

    beforeRender(pathway) {   
        const velocity = this.mesh.physicsImpostor.getLinearVelocity().clone() 
    
        velocity.z = this.speed //this.position.y < -1 ? 0 : this.speed
        velocity.x = this.rotation / 90 * 4

        this.mesh.physicsImpostor.setLinearVelocity(velocity)

        this.rotation *= .95  
 
        for (let block of pathway.path) { 
            let isWithin = this.mesh.position.z >= block.group.position.z && this.mesh.position.z <= block.group.position.z + block.depth
            
            if (isWithin) { 
                for (let child of block.floor){
                    if (child.intersectsMesh(this.mesh, true)) {
                        this.jumping = false
                        break
                        //console.log("jumping", this.jumping)
                    }
                }
            }
        } 
    }
}  
