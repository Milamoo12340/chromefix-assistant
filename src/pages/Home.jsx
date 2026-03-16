import { useState } from "react";
import { Download, Copy, Check, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, ExternalLink, FileText, Terminal, Usb } from "lucide-react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-white transition-colors flex-shrink-0">
      {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

function Code({ children }) {
  return (
    <div className="bg-slate-950 rounded-lg p-3 mt-2 flex items-start justify-between gap-3 font-mono text-sm text-green-300 break-all">
      <pre className="whitespace-pre-wrap flex-1 text-xs leading-relaxed">{children}</pre>
      <CopyButton text={children} />
    </div>
  );
}

function Section({ title, icon: Icon, color = "border-slate-200", children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border-2 ${color} overflow-hidden mb-4 bg-white`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
        <Icon className="w-5 h-5 text-slate-500 flex-shrink-0" />
        <span className="font-semibold text-slate-800 flex-1 text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0 space-y-3">{children}</div>}
    </div>
  );
}

function Warn({ children }) {
  return <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs"><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{children}</span></div>;
}
function Info({ children }) {
  return <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs">{children}</div>;
}
function Good({ children }) {
  return <div className="flex gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-xs"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{children}</span></div>;
}

function DownloadBtn({ label, filename, content, color = "bg-blue-600 hover:bg-blue-700" }) {
  const download = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={download} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold ${color} transition-colors`}>
      <Download className="w-4 h-4" /> {label}
    </button>
  );
}

// ─── SCRIPT CONTENTS ───────────────────────────────────────────────

const SCRIPT_STEP1_LINUX = `#!/bin/bash
# ============================================================
# STEP 1 — Download GALITH ChromeOS Recovery Image
# Run this on a working Linux/Mac computer
# ============================================================
# Your device: ASUS CX1500CKA | Board: GALITH | JasperLake

echo "=== GALITH ChromeOS Recovery Downloader ==="
echo ""
echo "This will download the latest stable ChromeOS recovery"
echo "image for your ASUS CX1500CKA (GALITH board)."
echo ""

# Create a working folder
mkdir -p ~/galith_recovery
cd ~/galith_recovery

echo "[1/3] Downloading recovery image..."
# Latest stable recovery image for GALITH
# Source: https://cros.tech/device/galith/
curl -L --progress-bar -o galith_recovery.zip \\
  "https://dl.google.com/dl/edgedl/chromeos/recovery/chromeos_16552.53.0_galith_recovery_stable-channel_mp-v3.bin.zip"

echo ""
echo "[2/3] Extracting .bin file..."
unzip -o galith_recovery.zip
BIN_FILE=$(ls *.bin 2>/dev/null | head -1)

if [ -z "$BIN_FILE" ]; then
  echo "ERROR: Could not find .bin file after extraction."
  echo "Try downloading manually from: https://cros.tech/device/galith/"
  exit 1
fi

echo "[3/3] Done! Recovery image: ~/galith_recovery/$BIN_FILE"
echo ""
echo "=== NEXT STEP ==="
echo "Run STEP 2 script to flash this .bin to your USB drive."
echo "Or use Rufus on Windows (see README.txt)"
`;

const SCRIPT_STEP2_LINUX = `#!/bin/bash
# ============================================================
# STEP 2 — Flash Recovery Image to USB Drive
# Run this on a working Linux/Mac computer
# ============================================================
# WARNING: THIS WILL ERASE THE USB DRIVE COMPLETELY

echo "=== GALITH Recovery USB Flasher ==="
echo ""
echo "Available drives:"
lsblk -d -o NAME,SIZE,MODEL | grep -v "loop"
echo ""
echo "WARNING: You are about to ERASE a USB drive."
echo "The ChromeOS .bin file MUST be in ~/galith_recovery/"
echo ""

BIN_FILE=$(ls ~/galith_recovery/*.bin 2>/dev/null | head -1)

if [ -z "$BIN_FILE" ]; then
  echo "ERROR: No .bin file found in ~/galith_recovery/"
  echo "Run STEP 1 script first."
  exit 1
fi

echo "Recovery image found: $BIN_FILE"
echo ""
read -p "Enter your USB drive device (e.g. sdb, NOT sdb1): " DRIVE
TARGET="/dev/$DRIVE"

if [ ! -b "$TARGET" ]; then
  echo "ERROR: $TARGET is not a valid block device. Check lsblk output above."
  exit 1
fi

echo ""
echo "About to flash: $BIN_FILE"
echo "Destination:    $TARGET"
echo ""
read -p "Are you SURE? Type YES to continue: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Flashing... this takes 5-15 minutes. Do not unplug anything."
sudo dd if="$BIN_FILE" of="$TARGET" bs=4M status=progress conv=fsync
sync

echo ""
echo "=== DONE! ==="
echo "Eject the USB drive and plug it into your broken ASUS CX1500CKA."
echo "See README.txt for recovery steps."
`;

const SCRIPT_STEP3_CHROMEOS = `#!/bin/bash
# ============================================================
# STEP 3 — MrChromebox Firmware Script
# Run this ON YOUR ASUS CX1500CKA after ChromeOS is recovered
# ============================================================
# HOW TO GET A TERMINAL ON YOUR CHROMEBOOK:
#   1. Boot to the ChromeOS login screen (do NOT log in)
#   2. Press Ctrl+Alt+F2  (F2 = right-arrow key on Chromebook)
#   3. Login: chronos  (no password)
#   4. Paste this command:

# cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh

# ============================================================
# The script above is the REAL firmware script from MrChromebox.
# It auto-detects your GALITH device.
#
# MENU OPTIONS EXPLAINED FOR GALITH (EOL device):
#
#   Option 1 - Install/Update RW_LEGACY Firmware
#     -> Likely DISABLED (greyed out) for GALITH because it is EOL
#     -> Would allow dual boot ChromeOS + Linux without opening laptop
#
#   Option 2 - Install/Update UEFI Full ROM Firmware
#     -> REPLACES ChromeOS entirely with standard PC firmware
#     -> Lets you install Linux or Windows
#     -> Requires: disabling hardware write-protect (open laptop, remove screw)
#     -> See: https://docs.mrchromebox.tech/docs/supported-devices.html
#        GALITH write-protect method: CR50 / jumper
#
#   Option 5 - Backup Current Firmware
#     -> ALWAYS do this first if option 2 is available
#     -> Save backup to USB drive
#
# ============================================================
# ACTUAL COMMAND TO RUN (copy this):
echo "Copy and run this command in your Chromebook terminal:"
echo ""
echo "cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh"
`;

const README = `============================================================
ASUS CX1500CKA (GALITH) — COMPLETE RECOVERY PACKAGE
============================================================
Device:   ASUS Chromebook CX1500CKA
Board:    GALITH-HKFU
Platform: Intel JasperLake
Status:   EOL (recoverable — see notes below)
Date:     March 2026
============================================================

FILES IN THIS PACKAGE:
  step1_download_recovery.sh  — Downloads ChromeOS recovery .bin for GALITH
  step2_flash_usb.sh          — Flashes the .bin to your USB drive (Linux/Mac)
  step3_firmware_script.sh    — Explains how to run MrChromebox firmware script
  README.txt                  — This file

============================================================
WHAT YOU PROBABLY NEED (READ THIS FIRST)
============================================================

SITUATION A — ChromeOS is broken / won't boot:
  → You need a ChromeOS Recovery USB.
  → You do NOT need the firmware script.
  → Follow METHOD 1 (easy) or METHOD 2 (manual) below.

SITUATION B — ChromeOS works, you want to run Linux too:
  → GALITH is EOL. MrChromebox blocks RW_LEGACY on EOL devices.
  → Your only option is UEFI Full ROM (replaces ChromeOS entirely).
  → You must open the laptop to remove the write-protect jumper.

============================================================
METHOD 1 — EASIEST: Chrome Recovery Utility (Windows/Mac)
============================================================
1. On a working computer, open Chrome browser
2. Install: Chromebook Recovery Utility
   https://chrome.google.com/webstore/detail/chromebook-recovery-utili/pocpnlppkickgojjlmhdmidojbmbodfm
3. Open the extension
4. Search for: ASUS Chromebook CX1500CKA
   (or select from list: ASUS → Chromebook CX1500CKA)
5. Insert an 8GB+ USB drive
6. Follow prompts — it downloads and flashes automatically
7. Done. Go to ENTERING RECOVERY MODE below.

============================================================
METHOD 2 — MANUAL (Windows with Rufus)
============================================================
1. Download the recovery image:
   Go to: https://cros.tech/device/galith/
   Click "Recovery Images" → download the latest stable .zip
   Extract the .zip — you get a .bin file

2. Download Rufus: https://rufus.ie/en/

3. Open Rufus, plug in 8GB+ USB drive
   Click SELECT → choose your .bin file
   !! CRITICAL: When asked, choose "DD Image" mode !!
   !! NOT "ISO mode" — recovery WILL FAIL if you pick ISO !!
   Click Start → wait 10-15 min

4. Done. Go to ENTERING RECOVERY MODE below.

============================================================
METHOD 3 — MANUAL (Linux/Mac with terminal scripts)
============================================================
1. Run: bash step1_download_recovery.sh
   (downloads recovery image to ~/galith_recovery/)

2. Run: bash step2_flash_usb.sh
   (flashes image to your USB — you pick the drive)

3. Done. Go to ENTERING RECOVERY MODE below.

============================================================
ENTERING RECOVERY MODE ON YOUR ASUS CX1500CKA
============================================================
1. Power off the laptop completely
2. Hold: ESC + Refresh(↻) + Power simultaneously
   - ESC = bottom left
   - Refresh = circular arrow ↻ key, top row, ~4th from left
   - Press and hold ESC+Refresh, THEN tap Power
3. Release all keys when screen lights up
4. You should see: "Chrome OS is missing or damaged"
5. Insert your recovery USB
6. Recovery starts automatically — progress bar appears
7. Wait 5-20 minutes — DO NOT unplug anything
8. Device reboots when done — remove USB
9. Set up ChromeOS as new

============================================================
AFTER RECOVERY — RUNNING THE FIRMWARE SCRIPT (OPTIONAL)
============================================================
Only needed if you want to modify firmware (e.g. install Linux).

1. At ChromeOS login screen, press: Ctrl + Alt + F2
   (F2 is the right-arrow → key on Chromebook keyboards)
2. Login as: chronos  (no password)
3. Run this command:
   cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh

NOTE: GALITH is EOL. The script will likely only show UEFI Full ROM.
RW_LEGACY (dual boot keeping ChromeOS) is blocked on EOL devices.

============================================================
IMPORTANT NOTES FOR GALITH (EOL DEVICE)
============================================================
- EOL = End of Life. Google stopped providing ChromeOS updates.
- This does NOT mean the device is broken or unrecoverable.
- Recovery USB still works perfectly.
- MrChromebox firmware script still works for UEFI Full ROM.
- RW_LEGACY firmware is blocked on EOL devices by MrChromebox.
- Write-protect method for GALITH: CR50 / jumper (inside laptop)

============================================================
USEFUL LINKS
============================================================
Recovery images:      https://cros.tech/device/galith/
MrChromebox docs:     https://docs.mrchromebox.tech
Firmware script docs: https://docs.mrchromebox.tech/docs/fwscript.html
Chrultrabook forum:   https://forum.chrultrabook.com
Rufus:                https://rufus.ie/en/
Chrome Recovery Util: https://chrome.google.com/webstore/detail/chromebook-recovery-utili/pocpnlppkickgojjlmhdmidojbmbodfm

============================================================
`;

export default function Home() {
  const downloadAll = () => {
    const files = [
      { name: "README.txt", content: README },
      { name: "step1_download_recovery.sh", content: SCRIPT_STEP1_LINUX },
      { name: "step2_flash_usb.sh", content: SCRIPT_STEP2_LINUX },
      { name: "step3_firmware_script.sh", content: SCRIPT_STEP3_CHROMEOS },
    ];
    files.forEach((f, i) => {
      setTimeout(() => {
        const blob = new Blob([f.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = f.name; a.click();
        URL.revokeObjectURL(url);
      }, i * 300);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold">ASUS CX1500CKA Recovery Package</h1>
          <p className="text-slate-400 text-xs mt-0.5">Board: <span className="text-green-400 font-mono">GALITH-HKFU</span> · Intel JasperLake · All scripts pre-configured for your device</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Download all */}
        <div className="bg-white rounded-xl border-2 border-blue-300 p-4">
          <p className="font-bold text-slate-800 mb-1 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Download Everything</p>
          <p className="text-slate-500 text-xs mb-3">All 4 files — README + 3 scripts — pre-configured for your GALITH device. Download them all, put on a USB stick.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" /> Download All 4 Files
            </button>
          </div>
          <p className="text-slate-400 text-xs mt-2">Or download individually below.</p>
        </div>

        {/* README */}
        <Section title="📄 README.txt — Start here. Full instructions for every scenario." icon={FileText} color="border-green-300" defaultOpen={true}>
          <Good>Read this first. It covers: Chrome Recovery Utility (easiest), manual Rufus method, Linux dd method, entering recovery mode, and the firmware script — all for your specific GALITH device.</Good>
          <pre className="bg-slate-950 text-green-300 text-xs rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap leading-relaxed">{README}</pre>
          <DownloadBtn label="Download README.txt" filename="README.txt" content={README} color="bg-green-600 hover:bg-green-700" />
        </Section>

        {/* Step 1 */}
        <Section title="📥 Script 1 — Download the GALITH recovery .bin (Linux/Mac)" icon={Download} color="border-blue-200">
          <Info>Run this on a working Linux or Mac computer. It downloads and extracts the correct ChromeOS recovery image for your GALITH device from Google's servers.</Info>
          <Warn>Windows users: use the Chrome Recovery Utility instead (see README). You don't need this script.</Warn>
          <Code>{SCRIPT_STEP1_LINUX}</Code>
          <div className="pt-1">
            <DownloadBtn label="Download step1_download_recovery.sh" filename="step1_download_recovery.sh" content={SCRIPT_STEP1_LINUX} />
          </div>
          <p className="text-slate-500 text-xs">Run with: <code className="bg-slate-100 px-1 rounded font-mono">bash step1_download_recovery.sh</code></p>
        </Section>

        {/* Step 2 */}
        <Section title="💾 Script 2 — Flash the .bin to USB drive (Linux/Mac)" icon={Usb} color="border-purple-200">
          <Info>Run this after Script 1. It shows your drives, asks which USB to flash to, and runs the dd command correctly. You tell it the drive letter (e.g. sdb) — it does the rest.</Info>
          <Warn>This ERASES the USB drive completely. Double-check the drive letter before typing YES.</Warn>
          <Code>{SCRIPT_STEP2_LINUX}</Code>
          <div className="pt-1">
            <DownloadBtn label="Download step2_flash_usb.sh" filename="step2_flash_usb.sh" content={SCRIPT_STEP2_LINUX} color="bg-purple-600 hover:bg-purple-700" />
          </div>
          <p className="text-slate-500 text-xs">Run with: <code className="bg-slate-100 px-1 rounded font-mono">bash step2_flash_usb.sh</code></p>
        </Section>

        {/* Step 3 */}
        <Section title="🔧 Script 3 — MrChromebox firmware script (run ON the Chromebook)" icon={Terminal} color="border-orange-200">
          <Info>This runs ON your ASUS CX1500CKA after ChromeOS is recovered. It's a reference/explainer — the real command to paste into your Chromebook terminal is inside.</Info>
          <Warn>GALITH is EOL — the firmware script will only offer UEFI Full ROM (replaces ChromeOS). RW_LEGACY (dual boot) is blocked on EOL devices.</Warn>
          <p className="text-slate-700 text-sm font-semibold mt-1">The one command you need (copy this to your Chromebook):</p>
          <Code>cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh</Code>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-200 mt-2">
            <p className="font-semibold mb-1">How to get a terminal on your Chromebook:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Boot to the ChromeOS login screen (don't log in)</li>
              <li>Press <kbd className="bg-white border rounded px-1 font-mono">Ctrl+Alt+F2</kbd> — F2 is the right-arrow → key</li>
              <li>Login: <code className="bg-white border rounded px-1 font-mono">chronos</code> (no password)</li>
              <li>Paste the command above</li>
            </ol>
          </div>
          <div className="pt-1">
            <DownloadBtn label="Download step3_firmware_script.sh" filename="step3_firmware_script.sh" content={SCRIPT_STEP3_CHROMEOS} color="bg-orange-600 hover:bg-orange-700" />
          </div>
        </Section>

        {/* Windows shortcut */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
          <p className="font-semibold text-slate-800 text-sm flex items-center gap-2 mb-2">
            🪟 Windows user? Skip Scripts 1 & 2 entirely.
          </p>
          <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
            <li>Install <a href="https://chrome.google.com/webstore/detail/chromebook-recovery-utili/pocpnlppkickgojjlmhdmidojbmbodfm" target="_blank" className="text-blue-600 underline">Chromebook Recovery Utility <ExternalLink className="inline w-3 h-3" /></a> in Chrome</li>
            <li>Search for <strong>ASUS Chromebook CX1500CKA</strong></li>
            <li>Plug in USB → it downloads and flashes automatically</li>
            <li>Then enter recovery mode on the broken laptop (ESC + Refresh↻ + Power)</li>
          </ol>
        </div>

        {/* Recovery mode reminder */}
        <div className="bg-slate-900 text-white rounded-xl p-4 text-xs">
          <p className="font-bold text-slate-300 mb-2">⌨️ Key combos for your ASUS CX1500CKA</p>
          <div className="space-y-1 text-slate-300">
            <div className="flex gap-2"><span className="text-slate-500 w-36 flex-shrink-0">Recovery Mode:</span><span className="font-mono text-yellow-300">ESC + Refresh↻ + Power</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-36 flex-shrink-0">Developer Mode:</span><span className="font-mono text-yellow-300">At recovery screen → Ctrl+D → Enter</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-36 flex-shrink-0">Terminal (VT2):</span><span className="font-mono text-yellow-300">Ctrl+Alt+F2 → login: chronos</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-36 flex-shrink-0">Boot ChromeOS:</span><span className="font-mono text-yellow-300">Ctrl+D at developer screen</span></div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          All scripts are pre-configured for GALITH. Sources: <a href="https://docs.mrchromebox.tech" target="_blank" className="text-blue-500 underline">MrChromebox</a> · <a href="https://cros.tech/device/galith" target="_blank" className="text-blue-500 underline">cros.tech</a>
        </p>
      </div>
    </div>
  );
}