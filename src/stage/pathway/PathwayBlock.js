import { Vector3, Axis, MeshBuilder, StandardMaterial, Color3 } from "babylonjs"
import { makeGroup, resize } from "../../utils/helpers"
import { clone } from "../../builders/models"

export default class PathwayBlock {
    illegalNext = []
    requiredNext = []
    coins = []
    width = 0
    height = 0
    depth = 0
    floor = []
    hasShadows = false

    static isAcceptableNext(_previous, _path) { 
        return true
    }
    constructor(scene, width = 0, height = 0, depth = 0) { 
        this.scene = scene
        this.group = makeGroup(scene, false) 
        this.width = width
        this.height = height 
        this.depth = depth        
    }
    get position() {
        return this.group.position
    }
    makeFloor(width, depth, position, debug = false){
        let floor = MeshBuilder.CreateBox(1, { width, depth, height: .35 }, this.scene)
        
        floor.position = position 
        floor.parent = this.group

        if (debug) {  
            floor.material = new StandardMaterial(null, this.scene)
            floor.material.diffuseColor = Color3.Red()
        } else { 
            floor.isVisible = false
        }

        this.floor.push(floor)
    }
    canAcceptNext(nextType, _path){
        return this.illegalNext.length ? !this.illegalNext.includes(nextType) : true
    } 
    remove() {
        this.group.dispose()
    }
    addCoin(position, time){ 
        let coin = clone("coin") 
        
        resize(coin, .3, .6, .3)
        
        coin.time = time
        coin.position = position
        coin.parent = this.group

        this.coins.push(coin)
    }
    addCoinLine(count, start, end, origin = new Vector3(0, .25, 0)) { 
        let gapX = (end.x - start.x) / (count - 1)
        let gapY = (end.y - start.y) / (count - 1)
        let gapZ = (end.z - start.z) / (count - 1) 

        for (let i = 0; i < count; i++) {
            let position = new Vector3(gapX * i + origin.x, gapY * i + origin.y, gapZ * i + origin.z)

            this.addCoin(position, i * .1)
        }
    }
    beforeRender() {  
        for (let coin of this.coins) { 
            coin.rotate(Axis.Y, coin.rotation.y + .035) 
        }
    }
}
