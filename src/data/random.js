const random = {
    boolean(likelyhood = .5) {
        return Math.random() < likelyhood
    },
    float(min, max) {
        return Math.random() * (max - min) + min
    },
    integer(min, max) {
        return Math.round(random.float(min, max))
    },
    pick(...list) {
        return list[Math.floor(Math.random() * list.length)]
    }
} 

export default random