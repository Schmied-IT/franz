<template>
    <div class="editor" ref="container"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';

let container = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneDiffEditor | null = null;
let modelOriginal: monaco.editor.ITextModel | null = null;
let modelModified: monaco.editor.ITextModel | null = null;

useHead({
    title: 'Franz! Diff'
});

const emit = defineEmits<{
    (e: "fileChanged"): void,
    (e: "inited"): void
}>();

const props = defineProps<{
    language: string,
    original?: string,
    modified?: string
}>();

var ignoreChanges = true;

onMounted(() => {
    if (process.client) {
        if (!container.value) {
            console.error("Container is missing", container.value);
            return;
        }
        editor = monaco.editor.createDiffEditor(container.value!, {
            theme: 'vs-dark',
            automaticLayout: true,
            originalEditable: true
        });

        modelOriginal = monaco.editor.createModel(props.original || "", props.language);
        modelModified = monaco.editor.createModel(props.modified || "", props.language);
        editor.setModel({
            original: modelOriginal!,
            modified: modelModified!
        });

        modelOriginal.onDidChangeContent((_e) => {
            if (!ignoreChanges)
                emit("fileChanged");
        })
        modelModified.onDidChangeContent((_e) => {
            if (!ignoreChanges)
                emit("fileChanged");
        });
        editor.focus();
        ignoreChanges = false;
        emit("inited");
    }
});

watch(props, (val, old) => {
    if (modelOriginal!.getLanguageId() != val.language) {
        monaco.editor.setModelLanguage(modelOriginal!, val.language);
        monaco.editor.setModelLanguage(modelModified!, val.language);
    }

    if (val.original && val.original !== old.original) {
        ignoreChanges = true;
        modelOriginal!.setValue(val.original)
        ignoreChanges = false;
    }
    if (val.modified && val.modified !== old.modified) {
        ignoreChanges = true;
        modelModified!.setValue(val.modified)
        ignoreChanges = false;
    }
});

function getSource(): { original: string, modified: string } {
    return {
        original: modelOriginal!.getValue(),
        modified: modelModified!.getValue()
    };
}

function setSource(original: string, modified: string) {
    ignoreChanges = true;
    modelOriginal!.setValue(original);
    modelModified!.setValue(modified);
    ignoreChanges = false;
}

defineExpose({
    getSource,
    setSource
})
</script>