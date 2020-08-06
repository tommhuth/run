
import { Random, MersenneTwister19937 } from "random-js"

const random = new Random(MersenneTwister19937.seed(1))

export default random