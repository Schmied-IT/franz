<template>
    <div class="maincontainer">
        <div class="navbar flex-action-bar">
            <span>Franz!</span>

            <button class="push" :class="fileChanged ? 'unsaved' : 'saved'" @click="saveFile()">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
                    <path
                        d="M433.9 129.9l-83.9-83.9A48 48 0 0 0 316.1 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V163.9a48 48 0 0 0 -14.1-33.9zM224 416c-35.3 0-64-28.7-64-64 0-35.3 28.7-64 64-64s64 28.7 64 64c0 35.3-28.7 64-64 64zm96-304.5V212c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12V108c0-6.6 5.4-12 12-12h228.5c3.2 0 6.2 1.3 8.5 3.5l3.5 3.5A12 12 0 0 1 320 111.5z" />
                </svg>
            </button>
        </div>
        <ClientOnly>
            <MonacoEditor :language="currentLanguage" @file-changed="fileChanged = true" @inited="editorInited"
                ref="editorRef" />
            <template #fallback>
                <div class="editor"></div>
            </template>
        </ClientOnly>
        <div class="footer flex-action-bar">
            <span>{{ $config.public.version }}</span>

            <button class="push" @click="openDialogs.push('languageSelect')">{{ currentLanguage }}</button>
        </div>
        <div class="dialogwrapper" @click.self="closeDialogs()" :style="{
            'display': hasOpenDialog ? 'flex' : 'none'
        }">
            <ClientOnly>
                <LanguageSelectDialog :show="hasOpenDialog" :currentLanguage="currentLanguage"
                    @langChanged="changeLanguage" />
            </ClientOnly>
        </div>
    </div>
</template>
<script setup lang="ts">
import MonacoEditor from "~/components/MonacoEditor.vue"

import {getPlaceholderText} from "~/model/DummyMonaco";

const openDialogs = ref<string[]>([]);
const hasOpenDialog = computed(() => {
    return openDialogs.value.length > 0;
});

function closeDialogs() {
    openDialogs.value = [];
}

const editorRef = ref<InstanceType<typeof MonacoEditor> | null>(null);

const fileChanged = ref(false);
const currentLanguage = ref("markdown");

const currentKey = ref<CryptoKey | null>(null);

const route = useRoute();
var loadedPaste: Ref<any>;

if (route.params.slug.length > 0) {
    const { data } = await useFetch(`/api/pastes/${route.params.slug[0]}`);
    loadedPaste = data;
}

var decryptResolve: (s: string) => void;
const decryptPromise = new Promise<string>((r, _) => decryptResolve = r);

onMounted(() => {
    if (loadedPaste) {
        currentLanguage.value = loadedPaste.value.language;
        if (process.client) {
            decryptPaste();
        }
    }
})

async function decryptPaste() {
    if (!process.client) {
        return;
    }
    const subtle = window.crypto.subtle;
    const keyEncoded = window.location.hash.slice(1);
    const jwk: JsonWebKey = {
        alg: "A256GCM",
        ext: true,
        k: keyEncoded,
        key_ops: ["encrypt", "decrypt"],
        kty: "oct"
    }
    const key = await subtle.importKey("jwk", jwk, {
        name: 'AES-GCM'
    } as AesKeyAlgorithm, jwk.ext, jwk.key_ops);
    currentKey.value = key;

    const encoder = new TextEncoder();
    if (!loadedPaste) {
        alert("no loaded Paste");
    }
    const cipher = base64ToBytes(loadedPaste.value.content);
    const iv = base64ToBytes(loadedPaste.value.iv);

    const decrypted = await subtle.decrypt({
        name: 'AES-GCM',
        iv: iv
    }, key, cipher);

    const decoder = new TextDecoder();
    const source = decoder.decode(decrypted);

    decryptResolve(source);
}

function editorInited() {
    if (loadedPaste) {
        decryptPromise.then((source) => {
            console.log("try to set source for editor");
            editorRef.value?.setSource(source);
            console.log("done setting source for editor");
        });
    } else {
        editorRef.value?.setSource(getPlaceholderText());
    }
}

function changeLanguage(langId: string) {
    currentLanguage.value = langId;
    closeDialogs();
}

async function saveFile() {
    if (!process.client) {
        return;
    }

    const subtle = window.crypto.subtle;

    var key: CryptoKey;
    if (loadedPaste && currentKey.value) {
        key = currentKey.value;
    } else {
        key = await subtle.generateKey({
            name: 'AES-GCM',
            length: 256
        }, true, ['encrypt', 'decrypt']);
        const jwkOut = await subtle.exportKey('jwk', key);
        location.hash = `#${jwkOut.k}`;
    }

    const inputString = editorRef.value!.getSource();

    const encoder = new TextEncoder();
    const encoded = encoder.encode(inputString);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const cipher = await window.crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: iv,
    }, key, encoded);

    const base64encrypted = bytesToBase64(new Uint8Array(cipher));
    console.log("encrypted", base64encrypted);

    const base64IV = bytesToBase64(iv);
    console.log("iv", base64IV);

    var postBody = {
        id: null,
        iv: base64IV,
        content: base64encrypted,
        language: currentLanguage.value
    };

    if (loadedPaste) {
        postBody.id = loadedPaste.value.id;
    }

    const { data } = await useFetch(`/api/pastes`, {
        method: "post",
        body: JSON.stringify(postBody)
    });
    loadedPaste = data;
    location.pathname = `/${loadedPaste.value.id}`;
    fileChanged.value = false;
}


// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
function base64ToBytes(base64: string): Uint8Array {
    const binString = atob(base64);
    //@ts-ignore fooBar
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
function bytesToBase64(bytes: Uint8Array): string {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

</script>