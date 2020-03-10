import { Random, MersenneTwister19937 } from "random-js"

export default new Random(MersenneTwister19937.seed(1))