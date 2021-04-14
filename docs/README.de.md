<p align="center"><img src="/src/icons/icon@128.png" alt="holo-schedule logo"></p>

# holo-schedule

![Test status](https://github.com/YunzheZJU/holo-schedule/workflows/Test/badge.svg)

—— Keep in touch with Hololive.

Eine browser extension für alle Livestreams

[Eng](/README.md) [中文](/docs/README.zh_CN.md) [日本語](/docs/README.ja.md)

### Inhaltsverzeichnis

Du kannst die Erweiterung auf den offiziellen Stores downloaden
[Mozilla AMO](https://addons.mozilla.org/firefox/addon/holo-schedule/) 
oder
[Chrome Web Store](https://chrome.google.com/webstore/detail/holoschedule/fjicegllhddldnnkgfefblholeegpcad).

[![Mozilla AMO](/docs/get-the-add-on.png)](https://addons.mozilla.org/firefox/addon/holo-schedule/)
[![Chrome Web Store](/docs/available-in-the-chrome-web-store.png)](https://chrome.google.com/webstore/detail/holoschedule/fjicegllhddldnnkgfefblholeegpcad)

## Unterstützte Browser

| Browser                   | Support Level                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| Firefox (>=57.0)          | *Offiziell Unterstützt* v57 ist die mindeste Version von Firefox um moderne Erweiterungen zu nutzen |
| Chrome (>=57.0)           | *Offiziell Unterstützt* v57 ist die mindeste Version von Chrome um CSS Grid Layout zu nutzen        |
| Opera / Edge (>=79.0.309) | *Unoffiziell Unterstützt* als ein Chrome kompatibles Ziel.                                          |

**Die letzten 3 Firefox und Chrome Versionen** sind zu empfehlen, um alle Funktionen von holo-schedule zu geniessen.

Holo-schedule sollte auch auf alle neuen Browser die auf Chromium basieren laufen. Zum Beispiel Opera und Edge

## System Abhängigkeiten
* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* Die neuste Version von Firefox oder Chrome

## Build

Kompiliere holo-schedule vom Quellcode und installiere es manuell in einen Browser.

*Note: Nutze 'dir' anstatt 'ls', falls sie auf Windows entwickeln*

Run
```bash
# Klone das Repository
git clone https://github.com/YunzheZJU/holo-schedule.git && cd holo-schedule

# Installiere die Abhängigkeiten
yarn

# Kompiliere die Browser Erweiterung
yarn run web-ext:build

# Die Erweiterung wird in web-ext-artifacts/ geschrieben
ls web-ext-artifacts

# Ausgabe wird in dist/ geschrieben
ls dist
```

## Test

Holo-schedule benutzt [JEST](https://jestjs.io/) als eine Test Framework.

Bitte befolgen Sie zuerst [build procedures](#build), damit alle Abhängigkeiten installiert sind.

Führe danach folgendes aus:
```bash
yarn run test
```

## Develop

Entwickle holo-schedule auf Ihrer lokalen Maschine.

Bitte befolgen Sie zuerst [build procedures](#build), damit alle Abhängigkeiten installiert sind.

Führe danach folgendes aus:
```bash
yarn run dev
```

Öffnen sie danach ein neues Fenster/Tab ihrer Konsole
```bash
# Start developing in Firefox
yarn run start
# Or Chrome
yarn run start:chromium
```