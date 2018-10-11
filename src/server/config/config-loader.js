import nconf from "nconf"
import fs from "fs" 

const defaults = JSON.parse(fs.readFileSync(__dirname + "/default.json"))

nconf.argv().env().defaults(defaults)
  
export default nconf.get()
