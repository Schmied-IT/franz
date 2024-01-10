import type Paste from "./Paste";

export async function decryptPaste(key: CryptoKey | string, paste?: Paste): Promise<Paste | null> {
    if (!process.client) {
        return null;
    }
    var currentKey: CryptoKey;
    const subtle = window.crypto.subtle;
    if (typeof key === "string") {
        currentKey = await decodeJWK(key as string);
    } else if (key instanceof CryptoKey) {
        currentKey = key;
    } else {
        throw new Error(`Unsupported Type for argument Key "${typeof key}"`);
    }

    if (!paste) {
        throw new Error("No Paste provided");
    }


    if(!paste.iv || !paste.content){
        throw new Error("Malformed Encrypted Paste");
    }

    const iv = base64ToBytes(paste.iv!);

    const contentCipher = base64ToBytes(paste.content);
    const contentDecrypted = await subtle.decrypt({
        name: 'AES-GCM',
        iv: iv
    }, currentKey, contentCipher);

    const decoder = new TextDecoder();
    const content = decoder.decode(contentDecrypted);
    var modified = "";
    if (paste.modified) {
        const modifiedCipher = base64ToBytes(paste.modified);
        const modifiedDecrypted = await subtle.decrypt({
            name: 'AES-GCM',
            iv: iv
        }, currentKey, modifiedCipher);

        const modifiedDecoder = new TextDecoder();
        modified = modifiedDecoder.decode(modifiedDecrypted);
    }

    const decryptedPaste: Paste = {
        id: paste.id,
        content: content,
        modified: modified,
        language: paste.language
    };
    return decryptedPaste;
}

export function extractKeyFromHash(): string | undefined {
    const encodedKey = window.location.hash.slice(1);
    if (encodedKey !== "") {
        return encodedKey;
    }
    return undefined;
}

export async function encryptPaste(paste: { id?: string, content: string, modified?: string, language: string }, key?: CryptoKey | string) {
    if (!process.client) {
        return null;
    }

    const subtle = window.crypto.subtle;

    var currentKey: CryptoKey;
    if (typeof key === "string") {
        currentKey = await decodeJWK(key as string);
    } else if (key instanceof CryptoKey) {
        currentKey = key;
    } else {
        currentKey = await generateNewKey();
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const base64IV = bytesToBase64(iv);

    const contentEncoder = new TextEncoder();
    const contentEncoded = contentEncoder.encode(paste.content);
    const contentCipher = await window.crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: iv,
    }, currentKey, contentEncoded);
    const contentBase64Encrypted = bytesToBase64(new Uint8Array(contentCipher));


    var modifiedBase64Encrypted: string | undefined = undefined;
    if (paste.modified) {
        const modifiedEncoder = new TextEncoder();
        const modifiedEncoded = modifiedEncoder.encode(paste.modified);
        const modifiedCipher = await window.crypto.subtle.encrypt({
            name: 'AES-GCM',
            iv: iv,
        }, currentKey, modifiedEncoded);
        modifiedBase64Encrypted = bytesToBase64(new Uint8Array(modifiedCipher));
    }

    const postBody = {
        id: paste.id,
        iv: base64IV,
        content: contentBase64Encrypted,
        modified: modifiedBase64Encrypted,
        language: paste.language,
    };

    return postBody;
}

async function decodeJWK(key: string): Promise<CryptoKey> {
    const subtle = window.crypto.subtle;
    const jwk: JsonWebKey = {
        alg: "A256GCM",
        ext: true,
        k: key,
        key_ops: ["encrypt", "decrypt"],
        kty: "oct"
    }
    /* @ts-ignore jwk is unknown or does not match some type */
    return await subtle.importKey("jwk", jwk, {
        name: 'AES-GCM'
    } as AesKeyAlgorithm, jwk.ext, jwk.key_ops);
}

async function generateNewKey(): Promise<CryptoKey> {
    const subtle = window.crypto.subtle;
    const key = await subtle.generateKey({
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']);
    const jwkOut = await subtle.exportKey('jwk', key);
    location.hash = `#${jwkOut.k}`;
    return key;
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
export function base64ToBytes(base64: string): Uint8Array {
    const binString = atob(base64);
    //@ts-ignore fooBar
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
export function bytesToBase64(bytes: Uint8Array): string {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}