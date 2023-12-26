import * as fs from 'fs';
import * as path from 'path';

import { randomUUID } from 'crypto';

const idPattern = /[\w-]+/;

export default defineEventHandler(async (event) => {
    var resolve: (value: void) => void;
    var reject: (reason?: any) => void;
    const p = new Promise((r, re) => { resolve = r; reject = re; });

    var body = await readBody(event);
    if (!body.id) {
        console.log("Need to generate ID");
        body.id = randomUUID();
    }

    if (!idPattern.test(body.id)) {
        return Promise.reject("Invalid ID Pattern");
    }

    const filePath = path.resolve(path.join('.', '.storage', `${body.id}.json`));
    

    const bodyString = JSON.stringify(body)

    fs.writeFile(filePath, bodyString, (err) => {
        if (err) {
            return reject(err);
        }
        return resolve(body);
    });

    return await p;
});
