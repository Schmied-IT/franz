import * as fs from 'fs';
import * as path from 'path';

const idPattern = /[\w-]+/;

export default defineEventHandler((event) => {
    const id = event.context.params!.id;

    if (!idPattern.test(id)) {
        return Promise.reject("Invalid ID Pattern");
    }

    var resolve: (value: any) => void;
    var reject: (reason?: any) => void;
    const p = new Promise((r, re) => { resolve = r; reject = re; });
    const filePath = path.resolve(path.join('.', '.storage', `${id}.json`));

    fs.readFile(filePath, (err, buffer) => {
        if (err) {
            return reject(err)
        }
        var obj = JSON.parse(buffer.toString('utf8'))
        return resolve(obj);
    });

    return p;
});
