<p align="center"><img src="./icons/icon@128.png" alt="holo-schedule logo"></p>

# holo-schedule

![Test status](https://github.com/YunzheZJU/holo-schedule/workflows/Test/badge.svg)

—— Keep in touch with Hololive.

One browser extension COVERs all scheduled and guerrilla livestreams.

[日本語](docs/README.ja.md) [中文](docs/README.zh_CN.md)

### Table of contents

1. [Supported Browsers](#supported-browsers)
1. [System dependencies](#system-dependencies)
1. [Build](#build)
1. [Test](#test)
1. [Develop](#develop)

## Supported Browsers

| Browser                   | Support Level                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| Chrome (>=57.0)           | *Officially Supported* v57 is the minimum version required to support Firefox's modern add-on.     |
| Firefox (>=57.0)          | *Officially Supported* v57 is the minimum version required to support CSS Grid layout.             |
| Opera / Edge (>=79.0.309) | *Unofficially Supported* as a Chrome-compatible target                                             |

**last 3 Firefox and Chrome versions** are recommended to unlock all functionalities of holo-schedule.

Holo-schedule should work on all modern browsers based on chromium, including Opera and the new Edge.

## System dependencies

* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* Firefox or Chrome of the latest version

## Build

Build holo-schedule from source code and install it into your browser manually.

*Note: Use 'dir' instead of 'ls' if you are developing on Windows*

Run
```bash
# Clone this repository
git clone https://github.com/YunzheZJU/holo-schedule.git && cd holo-schedule

# Install dependencies
yarn

# Build web extension
yarn run web-ext:build

# Web extension will be written to web-ext-artifacts/
ls web-ext-artifacts

# Output files will be written to dist/
ls dist
```

## Test

Holo-schedule uses [JEST](https://jestjs.io/) as the test framework.

First please follow [build procedures](#build) to ensure your dependencies are installed properly.

Then run
```bash
yarn run test
```

## Develop

Developing holo-schedule on your local machine

First please follow [build procedures](#build) to ensure your dependencies are installed properly.

Then run
```bash
yarn run dev
```

After that, open another command line tab/window and run
```bash
# Start developing in Firefox
yarn run start
# Or Chrome
yarn run start:chromium
```

*TODO*