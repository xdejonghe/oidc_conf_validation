import fs from "fs";

export default class ConfFileLoader {
    static getConf<Type>(path: string): Type {
        const conf: Buffer = fs.readFileSync(path);
        const confAsString: string = conf.toString();
        console.log(`Use configuration - conf: ${confAsString}`)

        return Object.freeze(JSON.parse(confAsString)) as Type;
    }
}