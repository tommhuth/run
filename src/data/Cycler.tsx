import random from "@huth/random"
 
export default class Cycler<T> {
    private i: number
    private lastWasRandom = false
    public readonly randomPickChance: number
    private startAt: number
    private options: T[]

    constructor(options: T[], randomPickChance = .1, startAt = 0) {
        this.options = options
        this.randomPickChance = randomPickChance
        this.startAt = startAt
        this.i = startAt
    }
    peak() {
        return this.options[this.i % this.options.length]
    }
    next() {
        if (!this.lastWasRandom) {
            const doRandom = random.boolean(this.randomPickChance)

            this.lastWasRandom = doRandom

            return doRandom ? random.pick(...this.options) : this.options[this.i++ % this.options.length]
        }  
    
        this.lastWasRandom = false

        return this.options[this.i++ % this.options.length] 
    }
    reset() {
        this.i = this.startAt
    }
} 