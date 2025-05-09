<template>
    <div class="editor" ref="container"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';
import isMobile from '@/model/IsMobile';

let container = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let model: monaco.editor.ITextModel | null = null;

const emit = defineEmits<{
    (e: "fileChanged"): void,
    (e: "inited"): void
}>();

const props = defineProps<{
    language: string,
    source?: string
}>();

var ignoreChanges = true;

onMounted(() => {
    if (process.client) {
        if (!container.value) {
            console.error("Container is missing", container.value);
            return;
        }
        editor = monaco.editor.create(container.value!, {
            theme: 'vs-dark',
            automaticLayout: true,
            readOnly: isMobile(),
            domReadOnly: isMobile(),
            language: props.language
        });

        if (props.source) {
            editor.setValue(props.source);
        }
        editor.onDidChangeModelContent((_e) => {
            if (!ignoreChanges)
                emit("fileChanged");
        });
        model = editor.getModel();
        editor.focus();
        ignoreChanges = false;
        emit("inited");
    }
});

watch(props, (val, old) => {
    if (model!.getLanguageId() != val.language) {
        monaco.editor.setModelLanguage(model!, val.language);
    }

    if (val.source && val.source !== old.source) {
        ignoreChanges = true;
        editor!.setValue(val.source)
        ignoreChanges = false;
    }
});

function getSource(): string {
    return model!.getValue();
}

function setSource(source: string) {
    ignoreChanges = true;
    editor!.setValue(source);
    ignoreChanges = false;
}

defineExpose({
    getSource,
    setSource
})
</script>