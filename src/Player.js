 
import { MeshBuilder, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"  
import uuid from "uuid"

export default class Player {
    score = 0  
    rotation = 0
    targetRotation = 0
    speed = 4 
    jumping = true
    allowsJumping = true

    constructor(scene) {
        const mesh = MeshBuilder.CreateSphere(uuid.v4(), { segments: 16, diameter: .35 }, scene)
        
        mesh.position.set(0, 1, 0) 
        mesh.physicsImpostor = new Impostor(mesh, Impostor.SphereImpostor, { mass: 1, restitution: 0, friction: 0 }, scene)

        this.mesh = mesh
        this.scene = scene 

        window.addEventListener("deviceorientation", (e) => this.handleDeviceRotation(e), false)
        window.addEventListener("mousemove", (e) => this.handleMouseMove(e), false)
        window.addEventListener("click", (e) => this.handleClick(e))
    }

    get position() {
        return this.mesh.position
    }

    handleMouseMove(e) { 
        // normalize to 90 deg!
        this.targetRotation = (e.pageX - window.innerWidth / 2) / 2
    }
    handleDeviceRotation(e) {
        this.targetRotation = e.gamma
    }

    handleClick(e){
        e.preventDefault()
        e.stopPropagation()
        
        if (!this.jumping && this.allowsJumping) {
            this.jumping = true
            this.allowsJumping = false 
            this.mesh.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), this.mesh.position)  

            setTimeout(() => {
                this.allowsJumping = true
            }, 400)  
        }
    }

    getAbsolutePosition() {
        return this.mesh.getAbsolutePosition()
    }

    beforeRender(pathway) {   
        const velocity = this.mesh.physicsImpostor.getLinearVelocity().clone() 
    
        velocity.z = this.position.y < -1 ? 0 : this.speed
        velocity.x = this.rotation / 90 * 4

        this.mesh.physicsImpostor.setLinearVelocity(velocity)

        this.rotation += (this.targetRotation - this.rotation) / 4
 
        for (let block of pathway.path) { 
            let isWithin = this.mesh.position.z >= block.group.position.z && this.mesh.position.z <= block.group.position.z + block.depth
            
            if (isWithin) { 
                for (let child of block.floor){
                    if (child.intersectsMesh(this.mesh, true)) {
                        this.jumping = false
                        break
                    }
                }
            }
        } 
    }
}  
