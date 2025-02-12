# franz

## ![Monaco Franze Image](/public/favicon.ico)

> a [monaco](https://github.com/microsoft/monaco-editor) based Pastebin alternative

## Features

* AES-GCM encryption
* Language Model Switcher
* Diff Editor

## Diff Editor

![Monaco Franze Image](/.docu/franz_diff.png)

The DiffEditor is available by prepending `/diff` to the URL path.

`http://localhost:3000` => `http://localhost:3000/diff`  
`http://localhost:3000/fooBar#someJWK` => `http://localhost:3000/diff/fooBar#someJWK`

## TODOs

* [ ] Validate Key, before overwriting current File
