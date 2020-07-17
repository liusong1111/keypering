# 👛keypering (work-in-progress👷🔧️👷‍♀️⛏)

**Keypering** ia a [nervos CKB](https://www.nervos.org/) desktop wallet prototype for dApp interaction.

## Status

**This project is still in its early stages of development**

## Development Setup

### Prerequisites

First you need to install [nodejs](https://nodejs.org/) and [yarn](https://yarnpkg.com/).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), 
and built with [Ant Design Mobile](https://mobile.ant.design/), 
[Source Code Pro](https://github.com/adobe-fonts/source-code-pro), 
[Google Lato Font](https://fonts.google.com/specimen/Lato), 
[Feature Icon](https://github.com/feathericons/feather).

It also uses [Tauri](https://github.com/tauri-apps/tauri) to build a desktop GUI.
check [Tauri docs](https://tauri.studio/docs/getting-started/intro) to setup development environment.

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Start a http server, which is listening on :3000, for development.

The page will reload if you make edits.

You will also see any lint errors in the console.

### `yarn tauri dev`

Compile and open the desktop app, which loads `http://127.0.0.1:3000/` as homepage.

The app will recompile if you make edits on rust code. 

## How to build production
First, Setup the tauri

for windows:

https://tauri.studio/docs/getting-started/setup-windows

for mac:

https://tauri.studio/docs/getting-started/setup-macos

And, run the following commands to build a standalone executable file:

```shell
yarn install
yarn build
yarn tauri build
```

Check `src-tauri/target/release/keypering.exe`

## License

Keypering is released under the terms of the MIT license. See [COPYING](https://github.com/liusong1111/keypering-ui/blob/develop/COPYING) for more information or see https://opensource.org/licenses/MIT.
