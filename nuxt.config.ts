import pkg from './package.json';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: "Franz!"
    }
  },
  runtimeConfig: {
    public: {
      version: pkg.version
    }
  },
  vite: {
    plugins: [monacoEditorPlugin({})]
  }
});
