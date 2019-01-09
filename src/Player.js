 
import { MeshBuilder, PhysicsImpostor as Impostor, Vector3 } from "babylonjs"  
import EventLite from "event-lite"
import { Config } from "./pathway/Pathway"
import materials from "./materials"

const PLAYER_DIAMETER = .5

export default class Player extends EventLite {
    score = 0  
    rotation = 0
    targetRotation = 0
    speed = 4  
    canJump = false 
    running = false
    ticks = 0
    hasRestart = false 

    constructor(scene) {
        super()
        const mesh = MeshBuilder.CreateSphere(null, { segments: 10, diameter: PLAYER_DIAMETER }, scene) 

        mesh.material = materials.player
        mesh.receiveShadows = true
        mesh.position.set(0, 20, 0)  
        mesh.physicsImpostor = new Impostor(mesh, Impostor.SphereImpostor, { mass: 0, restitution: 0, friction: 0 }, scene)
        
        this.mesh = mesh
        this.scene = scene  

        this.on("gameover", () => {
            this.running = false
            this.impostor.setLinearVelocity(Vector3.Zero())
        })
    }
    get impostor() {
        return this.mesh.physicsImpostor
    }
    get position() {
        return this.mesh.position
    } 
    start() { 
        this.rotation = 0
        this.ticks = 0
        this.position.set(0, PLAYER_DIAMETER/2, 10) 
        this.impostor.setMass(1) 
        this.running = true

        if (this.hasRestart) {
            this.emit("reset" ) 
        } else {
            this.hasRestart = true 
        } 
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

        if (this.running) {
            const floorDelimiter = -(Config.HEIGHT + 5)
            const velocity = this.impostor.getLinearVelocity().clone() 
            const fallen = this.position.y < floorDelimiter
            const stopped = velocity.z < 1 && this.position.y >= floorDelimiter
        
            if ((fallen || stopped) && this.ticks > 5) {
                let reason = fallen ? "fell off" : "crashed"
                
                this.emit("gameover", { reason })
            } else { 
                velocity.z = this.speed
                velocity.x = this.rotation / 90 * 4
        
                this.impostor.setLinearVelocity(velocity) 
                this.rotation += (this.targetRotation - this.rotation) / 4
    
                this.ticks++ 
            }
        } else { 
            const velocity = this.impostor.getLinearVelocity().clone() 
            
            velocity.z = 0
            velocity.y = velocity.y < -10 ? 0 : velocity.y

            this.impostor.setLinearVelocity(velocity) 
        }
    }
}  
