<p align="center"><img src="/src/icons/icon@128.png" alt="holo-schedule logo"></p>

# holo-schedule

![Test status](https://github.com/YunzheZJU/holo-schedule/workflows/Test/badge.svg)

—— Keep in touch with Hololive.

ホロライブの配信を表示するブラウザ拡張です。

[Eng](/README.md) [中文](docs/README.zh_CN.md)

### 目次

1. [インストール](#インストール)
1. [対応ブラウザ](#対応ブラウザ)
1. [依存関係](#依存関係)
1. [ビルド](#ビルド)
1. [テスト](#テスト)
1. [開発](#開発)

## インストール

以下の公式ページでダウンロードできます。
[Mozilla AMO](https://addons.mozilla.org/firefox/addon/holo-schedule/) 
または  
[Chrome Web Store](https://chrome.google.com/webstore/detail/holoschedule/fjicegllhddldnnkgfefblholeegpcad)

[![Mozilla AMO](./get-the-add-on.png)](https://addons.mozilla.org/firefox/addon/holo-schedule/)
[![Chrome Web Store](./available-in-the-chrome-web-store.png)](https://chrome.google.com/webstore/detail/holoschedule/fjicegllhddldnnkgfefblholeegpcad)

## 対応ブラウザ

| ブラウザ                   | サポート                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| Firefox (>=57.0)          | *サポートされています。* バージョン57が最低のFirefoxの新しいアドオンに対応しているバージョンです。     |
| Chrome (>=57.0)           | *サポートされています。* バージョン57が最低のCSSグリッドレイアウトに対応しているバージョンです。             |
| Opera / Edge (>=79.0.309) | *正式にサポートされていません。* Chrome互換の拡張として利用できます。                                             |

**最新以下3のFirefoxまたはChromeのバージョン**がすべての機能を利用するのに推奨されています。

Holo-scheduleは、Operaや新しいEdgeを含む、Chromiumベースのブラウザで動くようになっています。

## 依存関係

* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* 最新のFirefoxまたはChrome

## ビルド

ソースコードからビルドして、手動でブラウザに入れる方法

*Note: Windowsを使用している場合、'ls'の代わりに'dir'を使用してください。*

以下のスクリプトを実行してください。
```bash
# クローン
git clone https://github.com/YunzheZJU/holo-schedule.git && cd holo-schedule

# 依存関係のインストール
yarn

# 拡張のビルド
yarn run web-ext:build

# 拡張はweb-ext-artifacts/に書き込まれます。
ls web-ext-artifacts

# 出力はdist/に書き込まれます。
ls dist
```

## テスト

Holo-scheduleは、[JEST](https://jestjs.io/)をテストフレームワークとして使用しています。

 [ビルド手順](#ビルド)を確認して、依存関係が正しくインストールされていることを確認してください。

そして、以下を実行してください。
```bash
yarn run test
```

## 開発

ローカルでholo-scheduleを開発する方法。


 [ビルド手順](#ビルド)を確認して、依存関係が正しくインストールされていることを確認してください。

そして、以下を実行してください。
```bash
yarn run dev
```

その後に、新しくコマンドラインを開いて、以下を実行してください。
```bash
# Firefoxで開発を始める
yarn run start
# Chromeの場合
yarn run start:chromium
```
