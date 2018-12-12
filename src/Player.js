 
import { MeshBuilder, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"  
import uuid from "uuid" 
import EventLite from "event-lite"

export default class Player extends EventLite {
    score = 0  
    rotation = 0
    targetRotation = 0
    speed = 4 
    jumping = true
    allowsJumping = true 
    running = false
    ticks = 0

    constructor(scene) {
        super()
        const mesh = MeshBuilder.CreateSphere(uuid.v4(), { segments: 16, diameter: .35 }, scene)
        
        mesh.receiveShadows = true
        mesh.position.set(0, 10, 0)  
        mesh.physicsImpostor = new Impostor(mesh, Impostor.SphereImpostor, { mass: 0, restitution: 0, friction: 0 }, scene)
        
        this.mesh = mesh
        this.scene = scene 

        this.on("gameover", () => {
            this.running = false
            this.mesh.physicsImpostor.setLinearVelocity(Vector3.Zero())
        })
    }

    get position() {
        return this.mesh.position
    } 
    start() { 
        this.rotation = 0
        this.ticks = 0
        this.mesh.position.set(0, 4, 0) 
        this.mesh.physicsImpostor.setMass(1) 
        this.running = true
        this.emit("reset" )
    }
    jump() { 
        if (!this.jumping && this.allowsJumping) {
            this.jumping = true
            this.allowsJumping = false 
            this.mesh.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), this.mesh.position)  

            setTimeout(() => {
                this.allowsJumping = true
            }, 400)  
        }
    }
    move(rotation) { 
        this.targetRotation = rotation
    }
    getAbsolutePosition() {
        return this.mesh.getAbsolutePosition()
    }
    beforeRender(pathway) {   
        if (this.running) {
            const velocity = this.mesh.physicsImpostor.getLinearVelocity().clone() 
            const fallen = this.mesh.position.y < -3
            const stopped = velocity.z < 1 
        
            if ((fallen || stopped) && this.ticks > 5) {
                this.reason = fallen ? "fell" : "fell behind"
                this.emit("gameover", { reason: this.reason  })
            } 

            velocity.z = this.speed
            velocity.x = this.rotation / 90 * 4
    
            this.mesh.physicsImpostor.setLinearVelocity(velocity) 
            this.rotation += (this.targetRotation - this.rotation) / 4

            this.ticks++
     
            for (let block of pathway.path) { 
                let isWithin = this.mesh.position.z >= block.group.position.z && this.mesh.position.z <= block.group.position.z + block.depth
                
                if (isWithin) { 
                    for (let child of block.floor){
                        if (child.intersectsMesh(this.mesh, false)) {
                            this.jumping = false
                            break
                        }
                    }
                }
            }  
        } else { 
            const velocity = this.mesh.physicsImpostor.getLinearVelocity().clone() 
            
            velocity.z = 0
            velocity.y = velocity.y < -10 ? 0 : velocity.y

            this.mesh.physicsImpostor.setLinearVelocity(velocity) 
        }
    }
}  
