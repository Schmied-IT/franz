<template>
    <div class="maincontainer">
        <div class="navbar flex-action-bar">
            <span>Franz!</span>

            <button class="push" :class="fileChanged ? 'unsaved' : 'saved'" @click="saveFile()">
                <SaveIcon />
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
            <VersionLink />

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

import { getPlaceholderText } from "~/model/DummyMonaco";
import type Paste from "~/model/Paste";
import { decryptPaste, encryptPaste, extractKeyFromHash } from "~/model/crypto";

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

const route = useRoute();

const loadedPaste: Ref<Paste | undefined> = ref();
const currentPaste: Ref<Paste | undefined> = ref();
var pasteId: string|undefined;

if (route.params.slug.length > 0) {
    pasteId = route.params.slug[0];
    const { data } = await useFetch(`/api/pastes/${pasteId}`);
    loadedPaste.value = data.value as Paste;
}

var decryptResolve: (p: Paste) => void;
const decryptPromise = new Promise<Paste>((r, _) => decryptResolve = r);

onMounted(async () => {
    if (loadedPaste.value) {
        if (process.client) {
            const keyEncoded = extractKeyFromHash();
            if (keyEncoded != undefined) {
                try {
                    const decryptedPaste = await decryptPaste(keyEncoded, loadedPaste.value);
                    if (decryptedPaste) {
                        decryptResolve(decryptedPaste);
                    } else {
                        // TODO Decode Error
                    }
                } catch (e) {
                    decryptResolve({ id: pasteId, content: getPlaceholderText(`${e}`), language: "markdown" })
                }
            } else {
                // TODO No Key Provided
            }
        }
    } else {
        if (loadedPaste.value === null) {
            decryptResolve({ id: pasteId, content: getPlaceholderText("Error loading Paste!"), language: "markdown" })
        } else {
            decryptResolve({ content: getPlaceholderText(), language: "markdown" });
        }
    }
})

function editorInited() {
    decryptPromise.then((paste) => {
        currentPaste.value = paste;
        editorRef.value?.setSource(currentPaste.value.content);
        changeLanguage(currentPaste.value.language);
    });
}

function changeLanguage(langId: string) {
    currentLanguage.value = langId;
    closeDialogs();
}

async function saveFile() {
    if (!currentPaste.value) {
        // TODO no pasteLoaded
        return;
    }
    currentPaste.value.content = editorRef.value!.getSource();
    currentPaste.value.language = currentLanguage.value;

    const postBody: Paste | null = await encryptPaste(currentPaste.value, extractKeyFromHash());

    const { data } = await useFetch(`/api/pastes`, {
        method: "post",
        body: JSON.stringify(postBody)
    });

    currentPaste.value = data.value as Paste;
    location.pathname = `/${currentPaste.value.id}`;
    fileChanged.value = false;
}
</script>