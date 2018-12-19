 
import { MeshBuilder, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"  
import uuid from "uuid" 
import EventLite from "event-lite"

export default class Player extends EventLite {
    score = 0  
    rotation = 0
    targetRotation = 0
    speed = 4  
    canJump = false 
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
        this.position.set(0, 4, 0) 
        this.mesh.physicsImpostor.setMass(1) 
        this.running = true
        this.emit("reset" )
    }
    jump() { 
        if (this.canJump) { 
            this.canJump = false 
            this.mesh.physicsImpostor.applyImpulse(new Vector3(0, 5, 0), this.position)   
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
            let isWithin = this.position.z >= block.group.position.z && this.position.z <= block.group.position.z + block.depth
            let isAbove = this.position.y > block.position.y

            if (isWithin && isAbove) { 
                let result = false 

                for (let child of block.floor){
                    if (child.intersectsMesh(this.mesh, false)) {
                        this.canJump = result = true

                        break
                    }
                }

                if (!result) {
                    this.canJump = false
                }
            }
        }

        if (this.running) {
            const velocity = this.mesh.physicsImpostor.getLinearVelocity().clone() 
            const fallen = this.position.y < -6
            const stopped = velocity.z < 1 && this.position.y > 0
        
            if ((fallen || stopped) && this.ticks > 5) {
                this.reason = fallen ? "fell" : "fell behind"
                this.emit("gameover", { reason: this.reason  })
            } 

            velocity.z = this.speed
            velocity.x = this.rotation / 90 * 4
    
            this.mesh.physicsImpostor.setLinearVelocity(velocity) 
            this.rotation += (this.targetRotation - this.rotation) / 4

            this.ticks++
        } else { 
            const velocity = this.mesh.physicsImpostor.getLinearVelocity().clone() 
            
            velocity.z = 0
            velocity.y = velocity.y < -10 ? 0 : velocity.y

            this.mesh.physicsImpostor.setLinearVelocity(velocity) 
        }
    }
}  
