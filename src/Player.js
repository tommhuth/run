 
import { MeshBuilder, PhysicsImpostor as Impostor, Vector3, StandardMaterial, Color3 } from "babylonjs"  
import EventLite from "event-lite"
import { Config } from "./pathway/Pathway";

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
        const mesh = MeshBuilder.CreateSphere(null, { segments: 16, diameter: .35 }, scene)
        const mat = new StandardMaterial(null, scene) 

        mat.emissiveColor = Color3.White()
        mesh.material = mat
        mesh.receiveShadows = true
        mesh.position.set(0, 13, 0)  
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
        this.position.set(0, .35/2, 10) 
        this.impostor.setMass(1) 
        this.running = true
        this.emit("reset" )
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
            let isWithin = this.position.z >= block.group.position.z  && this.position.z  <= block.group.position.z + block.depth 
            let isAbove = this.position.y > block.position.y
 
            if (isWithin && isAbove) { 
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
            const velocity = this.impostor.getLinearVelocity().clone() 
            const fallen = this.position.y < -Config.HEIGHT
            const stopped = velocity.z < 1 && this.position.y >= -Config.HEIGHT
        
            if ((fallen || stopped) && this.ticks > 5) {
                let reason = fallen ? "fell off" : "crashed"
                
                this.emit("gameover", { reason })
            } 

            velocity.z = this.speed
            velocity.x = this.rotation / 90 * 4
    
            this.impostor.setLinearVelocity(velocity) 
            this.rotation += (this.targetRotation - this.rotation) / 4

            this.ticks++ 
        } else { 
            const velocity = this.impostor.getLinearVelocity().clone() 
            
            velocity.z = 0
            velocity.y = velocity.y < -10 ? 0 : velocity.y

            this.impostor.setLinearVelocity(velocity) 
        }
    }
}  
