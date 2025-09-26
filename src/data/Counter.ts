export default class Counter {
    public current = 0
    private max = 0
    private start: number

    constructor(max: number, start = 0) {
        this.max = max
        this.start = start
    }

    reset() {
        this.current = 0
    }

    next() {
        this.current = this.start + ((this.current + 1 - this.start) % (this.max - this.start))

        return this.current
    }
}