<template>
    <div class="dialog">
        <div class="m-05 flex-col">
            <input ref="searchInput" v-model="languageFilter" type="text" placeholder="Select Language Mode" @keyup.enter="onEnterPressed"/>
            <div class="radioList">
                <label v-for="lang in filteredLangs">
                    <input type="radio" name="languageRadio" :value="lang.id" :checked="lang.id == currentLanguage"
                        @change="langChanged" />
                    <span class="radioListItem">{{ lang.id }}</span>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { languages } from "monaco-editor";

const props = defineProps<{
    currentLanguage: string,
    show: boolean
}>();

const emit = defineEmits<{
    (e: "langChanged", lang: string): void
}>();

const allLangs = languages.getLanguages();

const searchInput = ref<HTMLInputElement>(null);

const languageFilter = ref("");
const filteredLangs = computed(() => {
    const needle = languageFilter.value.toLowerCase();
    return allLangs
        .filter((l) => l.id.includes(needle));
});

function langChanged(event: Event) {
    const langId = (event.target as HTMLInputElement).value;
    emit("langChanged", langId);
}

watch(props, (newVal) => {
    if (newVal.show) {
        languageFilter.value = "";
        searchInput.value?.focus();
    }
}, {
    flush: "post"
});

function onEnterPressed(){
    if(filteredLangs.value.length == 1) {
        emit("langChanged", filteredLangs.value[0].id);
    }
}
</script>

<style scoped>
.radioList {
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
    gap: .25em;

    max-height: 50vh;
    overflow-y: scroll;

    label {
        width: 100%;
        box-sizing: border-box;

        input[type="radio"] {
            position: absolute;
            opacity: 0;
        }

        input[type="radio"]:hover+.radioListItem {
            background-color: var(--input-hover-background);
        }

        input[type="radio"]:checked+.radioListItem {
            background-color: var(--input-active-background);
            border: 1px solid var(--input-active-border);
            color: var(--input-active-foreground);
        }
    }

    .radioListItem {
        display: inline-block;
        box-sizing: border-box;
        width: 100%;
        border-radius: 4px;
        padding: 0 0.25em;
        margin-top: .25em;
    }

    .radioList label:first .radioListItem {
        margin-top: 0;
    }

    scrollbar-color: var(--slider-color);
    scrollbar-width: 14px;
}

.radioList::-webkit-scrollbar {
    width: 14px;
    position: absolute;
}

.radioList::-webkit-scrollbar-thumb {
    background-color: var(--slider-color);
    opacity: 0.5;
    border-radius: 0;
}
</style>