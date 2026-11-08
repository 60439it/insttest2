# Projekt-Setup (webSETUP.md)

Diese Anleitung liegt im Hauptverzeichnis eines neuen Projekts als `webSETUP.md`. Arbeite sie von oben nach unten ab.

## Wichtig

- Vor jedem Schritt prüfen, ob er schon erledigt ist (Ordner, Link, Datei vorhanden?). Nichts doppelt anlegen, nichts überschreiben.
- Schlägt ein Schritt fehl: anhalten und den Fehler melden, nicht improvisieren.
- Befehle in dieser Datei sind PowerShell, sofern nicht anders angegeben.

### Platzhalter

| Platzhalter | Bedeutung | Beispiel |
| --- | --- | --- |
| `!PROJEKTVERZEICHNIS!` | Absoluter Pfad des Ordners, in dem diese `webSETUP.md` liegt. Zur Laufzeit ermitteln. | `D:\Kilge\Projects\Mein Shop` |
| `!PROJEKTNAME!` | Aus dem Ordnernamen gebildet: Kleinbuchstaben, Leerzeichen → `_`, ä → ae, ö → oe, ü → ue, ß → ss, nur `a-z`, `0-9`, `_`. Wird für Junction, lokale URL und GitHub-Repository verwendet. | `mein_shop` |

- Für Pfade im Projekt IMMER `!PROJEKTVERZEICHNIS!` verwenden, nie `D:\Kilge\Projects\!PROJEKTNAME!`.
- Weicht `!PROJEKTNAME!` vom Ordnernamen ab, beide Werte nennen und vor dem ersten Schritt bestätigen lassen.

### Feste Pfade

| Was | Pfad |
| --- | --- |
| XAMPP (in Befehlen `$xampp`) | `D:\Kilge\Projects\XAMPP\SERVER` |
| Lokale URL des Projekts | `http://localhost/!PROJEKTNAME!/` |
| GitHub-Konto | `60439it` |

## 1. Ordnerstruktur anlegen

```text
!PROJEKTVERZEICHNIS!
├── mats            Dateien, die ich für die Entwicklung speichern möchte (kommt nicht ins Repository)
├── htdocs          alle Dateien, die später auf den Server kopiert werden
├── setupAndUpdate  von dir erstellte Dateien für Setup und Update, z. B. Einrichtung und
│                   Änderung der SQL-Datenbank (folgt zu einem späteren Zeitpunkt)
└── instPack        existiert bereits, enthält die Dateien für dieses Setup (kommt nicht ins Repository)
```

## 2. Tools einbinden

Diese Webseite benötigt die folgenden Tools, Addons und Libraries.

### consent-tool

Das consent-tool holt die Einwilligung zur Ausführung von Scripten ein. Es wird auf jeder Seite eingebunden. Die einwilligungspflichtigen Scripte werden später ergänzt.

- Fertig angepasste Dateien: `!PROJEKTVERZEICHNIS!\instPack\consent-tool\tool` (Aufbau wie `htdocs`)
- Infos, Herstelleranleitung und Liste der Änderungen: `!PROJEKTVERZEICHNIS!\instPack\consent-tool\info` (wird nicht kopiert)

Den Inhalt von `tool` nach `htdocs` kopieren. Vorhandene Dateien nicht überschreiben, sondern anhalten und nachfragen:

```powershell
$src = "!PROJEKTVERZEICHNIS!\instPack\consent-tool\tool"
$dst = "!PROJEKTVERZEICHNIS!\htdocs"
$conflicts = Get-ChildItem $src -Recurse -File -Force | Where-Object { Test-Path (Join-Path $dst $_.FullName.Substring($src.Length + 1)) }
if ($conflicts) { $conflicts.FullName } else { Copy-Item "$src\*" $dst -Recurse -Force }
```

Ergebnis:

- `htdocs\consent\`: das Tool samt `.htaccess`, die `user_consent_drdsgvo.json` sperrt.
- `htdocs\includes\consent.php`: wird in jede Seite direkt vor `</body>` eingebunden (siehe 4.1). Die Seite muss direkt in `htdocs` liegen.

## 3. Lokalen Server einrichten

**3.1 Junction anlegen**, damit XAMPP den Ordner `htdocs` des Projekts ausliefert:

```powershell
$xampp = "D:\Kilge\Projects\XAMPP\SERVER"
$link = "$xampp\htdocs\!PROJEKTNAME!"
if (-not (Test-Path $link)) { New-Item -ItemType Junction -Path $link -Target "!PROJEKTVERZEICHNIS!\htdocs" }
```

Existiert `$link` schon und zeigt auf ein anderes Ziel: anhalten und nachfragen.

**3.2 Apache und MySQL starten**, falls sie noch nicht laufen. Die `.bat`-Dateien laufen dauerhaft im Vordergrund, deshalb immer in einem eigenen Fenster starten und nie direkt in der Shell ausführen:

```powershell
$xampp = "D:\Kilge\Projects\XAMPP\SERVER"
if (-not (Get-Process httpd -ErrorAction SilentlyContinue)) { Start-Process "$xampp\apache_start.bat" -WorkingDirectory $xampp -WindowStyle Minimized }
if (-not (Get-Process mysqld -ErrorAction SilentlyContinue)) { Start-Process "$xampp\mysql_start.bat" -WorkingDirectory $xampp -WindowStyle Minimized }
```

Danach prüfen, ob beide Prozesse laufen (`Get-Process httpd, mysqld`). Läuft einer nicht, die Meldung im gestarteten Fenster melden.

## 4. Test

**4.1 Startseite `htdocs\index.php` anlegen**: eine einfache HTML5-Seite (`lang="de"`, `charset="utf-8"`, Viewport-Meta) mit der Überschrift „Hallo Welt“ und direkt vor `</body>`:

```php
<?php include __DIR__ . '/includes/consent.php'; ?>
```

**4.2 Automatisch prüfen**: Jede Adresse muss den erwarteten Statuscode liefern.

| Adresse (relativ zu `http://localhost/!PROJEKTNAME!/`) | Erwartet |
| --- | --- |
| `index.php` | 200, enthält „Hallo Welt“ und `drdsgvo-consent-script.js` |
| `consent/drdsgvo-consent-script.js` | 200 |
| `consent/drdsgvo_consent.def` | 200 |
| `consent/css/drdsgvo.css` | 200 |
| `consent/js/jquery-2.2.0.min.js` | 200 |
| `consent/user_consent_drdsgvo.json` | 403 (gesperrt) |

Für die Abfragen `Invoke-WebRequest -UseBasicParsing` verwenden, 4xx-Antworten abfangen. Ergebnis als Tabelle melden.

**4.3 Im Browser prüfen lassen**: Die Seite im Standardbrowser öffnen (`Start-Process "http://localhost/!PROJEKTNAME!/"`) und mich bitten zu prüfen:

- Erscheint die Einwilligungsabfrage?
- Lassen sich „Einverstanden“ und „Nur notwendige“ ohne Fehlermeldung klicken?
- Öffnet „Datenschutzeinstellungen anpassen“ die Abfrage erneut?

**4.4 Anhalten.** Frag mich, ob ich zufrieden bin, und warte auf „BESTANDEN“.

## 5. Aufgaben nach bestandenem Test

### 5.1 Setup-Datei löschen

```powershell
Remove-Item "!PROJEKTVERZEICHNIS!\webSETUP.md"
```

### 5.2 GitHub: privates Repository anlegen und ersten Commit hochladen

Ziel: Das Projekt liegt danach als **privates** Repository `60439it/!PROJEKTNAME!` auf GitHub, der Branch `main` ist hochgeladen und verknüpft.
Dieser Abschnitt ist die ausdrückliche Freigabe dafür: Repository anlegen, committen und pushen, ohne vorher nachzufragen.

#### 1. Ausgangslage prüfen

- `git rev-parse --is-inside-work-tree`: Ist das Projekt schon ein Git-Repository, nicht neu initialisieren.
- `git remote -v`: Gibt es schon ein `origin`, nichts anlegen. Melde die vorhandene URL und frag nach.
- `git config --global user.name` und `user.email` müssen gesetzt sein. Fehlen sie, frag nach (nichts erfinden).
- `gh auth status`: Prüfen, ob die GitHub CLI installiert und angemeldet ist.

#### 2. .gitignore

Lege im Projekt eine `.gitignore` an, falls keine da ist, sonst ergänze sie. Pflichteinträge:

```gitignore
# Setup und lokale Entwicklungsdateien
instPack/
mats/
BERICHT.md

# Einwilligungsnachweise der Besucher (personenbezogene Daten)
htdocs/consent/user_consent_drdsgvo.json

# Zugangsdaten, Abhängigkeiten, Build, System
.env
node_modules/
vendor/
dist/
*.log
.DS_Store
Thumbs.db
```

Vor dem Commit `git status` prüfen: Es dürfen keine Passwörter, Schlüssel oder großen Binärdateien dabei sein.

#### 3. Lokaler Commit

```bash
git init -b main
git add .
git commit -m "Setup"
```

#### 4. Privates Repository anlegen und pushen

Mit GitHub CLI (bevorzugt), ein einziger Befehl:

```bash
gh repo create !PROJEKTNAME! --private --source=. --remote=origin --push
```

Ohne GitHub CLI: Nicht ins öffentliche Repo ausweichen. Stattdessen beim Nutzer nachfragen, welcher Weg gewählt werden soll:

- a) CLI einrichten: `winget install --id GitHub.cli`, danach führt der Nutzer selbst `gh auth login` aus (interaktiv). Dann Schritt 4 wiederholen.
- b) Der Nutzer legt das Repository auf github.com an: Name `!PROJEKTNAME!`, Sichtbarkeit **Private**, **ohne** README, .gitignore oder Lizenz. Danach:

  ```bash
  git remote add origin https://github.com/60439it/!PROJEKTNAME!.git
  git push -u origin main
  ```

#### 5. Ergebnis prüfen und melden

- `gh repo view 60439it/!PROJEKTNAME! --json visibility` muss `PRIVATE` liefern (falls gh vorhanden).
- `git status` meldet „up to date with 'origin/main'“.

## 6. Abschlussbericht

- Erstelle den Abschlussbericht in der Datei: "BERICHT.md" im Hauptverzeichnis.

- Checkliste aller Schritte: erledigt, übersprungen (weil schon vorhanden) oder fehlgeschlagen
- Lokale URL und GitHub-URL
- Offene Punkte vor dem Livegang:
  - Impressum und Datenschutzerklärung anlegen.
  - consent-tool: die Punkte aus `instPack\consent-tool\info\consent_korrektur.md`, Abschnitt „Offene Punkte vor dem Livegang“ (jQuery-Update prüfen, echte Domain in `htdocs\consent\consent-backend.php`, Links auf Impressum und Datenschutz in `htdocs\includes\consent.php`, Cookies in der Datenschutzerklärung beschreiben, Dienste in `drdsgvo_consent.def` und `website-script.js` eintragen).
