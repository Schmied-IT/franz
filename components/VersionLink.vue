<template>
    <a :href="$config.public.repository" target="_blank">
        <button>
            v{{ $config.public.version }}
        </button>
    </a>
</template>