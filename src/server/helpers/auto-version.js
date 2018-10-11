import { version } from "../../../package.json"
  
export default function (file) { 
    return `${file}?v=${version}` 
}
