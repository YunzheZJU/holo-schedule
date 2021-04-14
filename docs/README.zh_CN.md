<p align="center"><img src="/src/icons/icon@128.png" alt="holo-schedule logo"></p>

# holo-schedule

![Test status](https://github.com/YunzheZJU/holo-schedule/workflows/Test/badge.svg)

—— 与Hololive同行。

一枚扩展，掌握所有Hololive预约直播。突击也不在话下！

[English](/README.md) [日本語](/docs/README.ja.md) [DE](/docs/README.de.md)

### 目次

1. [从商店安装](#从商店安装)
1. [浏览器支持](#浏览器支持)
1. [开发依赖项](#开发依赖项)
1. [构建](#构建)
1. [测试](#测试)
1. [开发](#开发)

## 从商店安装

你可以从官方下载页
[Mozilla AMO](https://addons.mozilla.org/firefox/addon/holo-schedule/) 
和
[Chrome Web Store](https://chrome.google.com/webstore/detail/holoschedule/fjicegllhddldnnkgfefblholeegpcad)
安装本扩展。

[![Mozilla AMO](/docs/get-the-add-on.png)](https://addons.mozilla.org/firefox/addon/holo-schedule/)
[![Chrome Web Store](/docs/available-in-the-chrome-web-store.png)](https://chrome.google.com/webstore/detail/holoschedule/fjicegllhddldnnkgfefblholeegpcad)

## 浏览器支持

| 浏览器                     | 支持等级                                             |
| ------------------------- | -------------------------------------------------- |
| Firefox (>=57.0)          | *正式支持* 版本 57 是支持 Firefox 新版扩展的最低版本。     |
| Chrome (>=57.0)           | *正式支持* 版本 57 是支持 CSS 栅格布局的最低 Chrome 版本。 |
| Opera / Edge (>=79.0.309) | *非正式支持* 宣称与 Chrome API 兼容的浏览器。            |

建议使用**最新的 3 个版本的 Firefox和 Chrome** 以解锁 holo-schedule 的全部功能。

Holo-schedule 应该可以在包含 Opera 和新版 Edge 在内的基于 Chromium 的浏览器上工作。

## 开发依赖项

* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* 最新版本的 Firefox 或 Chrome

## 构建

从源代码构建 holo-schedule 并安装到你的浏览器。

*注意: 如果你在 Windows 系统上开发，请使用 `dir` 命令代替 `ls`。*

在命令行终端中执行以下命令：
```bash
# Clone
git clone https://github.com/YunzheZJU/holo-schedule.git && cd holo-schedule
# 安装开发依赖项
yarn
# 构建扩展
yarn run web-ext:build
# 可用于直接安装的浏览器扩展将被写往 web-ext-artifacts 目录
ls web-ext-artifacts
# 未打包的扩展将被写往 dist 目录
ls dist
```

## 测试

Holo-schedule 使用 [JEST](https://jestjs.io/) 作为测试框架。

请先依照 [构建步骤](#构建) 以保证所有的开发依赖项被正确安装。

然后，执行以下命令：
```bash
yarn run test
```

## 开发

在本机开发 holo-schedule 。

请先依照 [构建步骤](#构建) 以保证所有的开发依赖项被正确安装。

然后，执行以下命令：
```bash
yarn run dev
```

接着，打开新的命令行终端窗口，执行以下命令：
```bash
# 在 Firefox 上开发
yarn run start
# 或在 Chrome 上运行
yarn run start:chromium
```