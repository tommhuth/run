export default class LocalStorage {
    static set(key, value = null) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value))
        } catch (e) {
            // do nothing
        }
    }

    static get(key) {
        try {
            let value = window.localStorage.getItem(key)

            try {
                return JSON.parse(value)
            } catch (e) {
                return value
            }
        } catch (e) {
            return null
        }
    } 
    
    static remove(key) {
        try {
            window.localStorage.removeItem(key)
        } catch (e) {
            // do nothing
        }
    } 
}