import { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Copy, Check, Download, ExternalLink, Terminal, Wrench, Battery, Usb, RefreshCw } from "lucide-react";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 text-xs text-white transition-colors">
      {copied ? <><Check className="w-3 h-3 text-green-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
    </button>
  );
}

function Code({ children }) {
  return (
    <div className="bg-slate-950 rounded-lg p-3 flex items-start justify-between gap-3 mt-1">
      <pre className="font-mono text-green-300 text-xs whitespace-pre-wrap flex-1 leading-relaxed">{children}</pre>
      <CopyBtn text={children} />
    </div>
  );
}

function Warn({ children }) {
  return <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-xs my-2"><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{children}</span></div>;
}
function Info({ children }) {
  return <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs my-2">{children}</div>;
}
function Good({ children }) {
  return <div className="flex gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-xs my-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{children}</span></div>;
}

function Step({ n, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-slate-200 rounded-xl overflow-hidden mb-3 bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors">
        <span className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{n}</span>
        <span className="font-semibold text-slate-800 text-sm flex-1">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-700 space-y-2">{children}</div>}
    </div>
  );
}

function DownloadBtn({ label, filename, content }) {
  const dl = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = filename; a.click();
  };
  return (
    <button onClick={dl} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
      <Download className="w-4 h-4" />{label}
    </button>
  );
}

// ── SCRIPTS ──────────────────────────────────────────────────────────────────

const SCRIPT_RESTORE_STOCK = `#!/bin/bash
# ================================================================
# GALITH (ASUS CX1500CKA) — Restore Stock Firmware
# Run this ON the Chromebook after getting a shell
# ================================================================
# This restores the stock ChromeOS firmware so recovery USB works.
# Must be run from: Ctrl+Alt+F2 (→ key) → login: chronos
# ================================================================

echo "=== GALITH Stock Firmware Restorer ==="
echo "Device: ASUS CX1500CKA | Board: GALITH | JasperLake"
echo ""
echo "This will run the MrChromebox firmware script."
echo "When the menu appears, choose: Restore Stock Firmware"
echo ""
echo "BEFORE RUNNING: Make sure you have a ChromeOS Recovery USB"
echo "plugged in — the script needs it to extract stock firmware."
echo ""
read -p "Press ENTER when ready..."

cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh
`;

const SCRIPT_LINUX_LIVE_RESTORE = `#!/bin/bash
# ================================================================
# GALITH — Restore Stock Firmware from Linux Live USB
# Run this on a Linux live environment booted on the Chromebook
# ================================================================
# Use this if you can't boot ChromeOS at all.
# Boot a Linux live USB (Ubuntu recommended), open terminal, run this.
# ================================================================

echo "=== GALITH Stock Firmware Restorer (Linux Live) ==="
echo ""
echo "Checking for curl..."
which curl || sudo apt-get update && sudo apt-get install -y curl

echo ""
echo "Running MrChromebox firmware script..."
echo "When menu appears: choose 'Restore Stock Firmware'"
echo "You will need your ChromeOS Recovery USB plugged in."
echo ""
read -p "Press ENTER when ready..."

cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh
`;

const SCRIPT_MAKE_RECOVERY_USB = `#!/bin/bash
# ================================================================
# GALITH — Create ChromeOS Recovery USB (Linux/Mac)
# Run this on a WORKING computer, NOT the broken Chromebook
# ================================================================

echo "=== GALITH ChromeOS Recovery USB Creator ==="
echo "Device: ASUS CX1500CKA | Board: GALITH"
echo ""

mkdir -p ~/galith_recovery && cd ~/galith_recovery

echo "[1/3] Downloading latest stable ChromeOS recovery image for GALITH..."
echo "Source: https://cros.tech/device/galith/"
echo ""

# Try to get the latest URL from cros.tech (falls back to known stable)
RECOVERY_URL="https://dl.google.com/dl/edgedl/chromeos/recovery/chromeos_16552.53.0_galith_recovery_stable-channel_mp-v3.bin.zip"

curl -L --progress-bar -o galith_recovery.zip "$RECOVERY_URL"

echo ""
echo "[2/3] Extracting..."
unzip -o galith_recovery.zip

BIN=$(ls *.bin 2>/dev/null | head -1)
if [ -z "$BIN" ]; then
  echo "ERROR: .bin not found. Try downloading manually from cros.tech/device/galith/"
  exit 1
fi

echo "[3/3] Recovery image ready: ~/galith_recovery/$BIN"
echo ""
echo "Now flash it to USB. Run: bash flash_usb.sh"
echo "Or use Rufus on Windows (DD mode, NOT ISO mode)"
`;

const SCRIPT_FLASH_USB = `#!/bin/bash
# ================================================================
# GALITH — Flash Recovery .bin to USB (Linux/Mac)
# Run AFTER make_recovery_usb.sh
# ================================================================

echo "=== GALITH USB Flasher ==="
echo ""
echo "Current drives:"
lsblk -d -o NAME,SIZE,MODEL | grep -v loop
echo ""

BIN=$(ls ~/galith_recovery/*.bin 2>/dev/null | head -1)
if [ -z "$BIN" ]; then
  echo "ERROR: No .bin found in ~/galith_recovery/ — run make_recovery_usb.sh first"
  exit 1
fi

echo "Recovery image: $BIN"
echo ""
read -p "Enter USB drive name (e.g. sdb — NOT sdb1): " DRIVE
DEVICE="/dev/$DRIVE"

if [ ! -b "$DEVICE" ]; then
  echo "ERROR: $DEVICE not found. Check lsblk output above."
  exit 1
fi

echo ""
echo "!! WARNING: $DEVICE will be COMPLETELY ERASED !!"
read -p "Type YES to confirm: " CONFIRM
[ "$CONFIRM" != "YES" ] && echo "Cancelled." && exit 0

echo "Flashing... do not unplug anything."
sudo dd if="$BIN" of="$DEVICE" bs=4M status=progress conv=fsync && sync

echo ""
echo "Done! Eject USB and use it for ChromeOS recovery."
`;

const SCRIPT_LINUX_LIVE_HOWTO = `# ================================================================
# How to boot a Linux Live USB on GALITH (ASUS CX1500CKA)
# Use this if ChromeOS won't boot and you need a shell
# ================================================================

STEP 1 — Create a Ubuntu Live USB (on working computer):
  Windows: Download Ubuntu ISO from ubuntu.com/download/desktop
           Use Rufus → select ISO → "ISO mode" (NOT dd mode this time)
  Linux:   sudo dd if=ubuntu.iso of=/dev/sdX bs=4M status=progress

STEP 2 — Boot it on the ASUS:
  a) Hold ESC+Refresh+Power to enter Recovery Mode
  b) At recovery screen, press Ctrl+D → Enter to enable Developer Mode
     (WARNING: wipes all data on the Chromebook)
  c) Wait for Developer Mode to set up (~5 min)
  d) At the "OS Verification is OFF" screen, press Ctrl+L
     If Ctrl+L does nothing: you need RW_LEGACY firmware first (see below)

  --- OR if you already have UEFI Full ROM firmware on it ---
  Just plug in the Ubuntu USB and it should boot automatically or
  press ESC during boot for the boot menu.

STEP 3 — Once Ubuntu live desktop loads:
  Open terminal (Ctrl+Alt+T)
  Run: bash restore_stock_firmware_linux_live.sh

# ================================================================
# GALITH Write Protect Method: CR50 / Battery Disconnect
# ================================================================
# If the firmware script says write protect is ON and blocks you:
#
# 1. Power off completely, unplug charger
# 2. Open the laptop back panel (small Phillips screws around edges)
# 3. Find the battery connector on the motherboard — unplug it
# 4. Close laptop, plug in charger ONLY (no battery connected)
# 5. Boot and run the firmware script — WP will now be disabled
# 6. After flashing, power off, unplug charger, reconnect battery
# 7. Close laptop, boot normally
#
# Reference: https://docs.mrchromebox.tech/docs/firmware/wp/disabling.html
`;

const README = `================================================================
GALITH (ASUS CX1500CKA) — FULL RECOVERY PACKAGE
Board: GALITH-HKFU | Platform: Intel JasperLake | Status: EOL
================================================================

YOUR PROBLEM (based on symptoms):
  Recovery runs 5 min then fails with "error: recovery your device"
  
  ROOT CAUSE: The firmware on your device has been modified 
  (MrChromebox UEFI Full ROM was likely flashed at some point).
  The stock ChromeOS recovery cannot write back to firmware 
  because hardware write-protect is blocking it.
  
  This is explicitly documented by MrChromebox:
  "If you disabled firmware write protection via battery disconnect,
   you'll need to disconnect the battery AGAIN for recovery to 
   complete successfully."

================================================================
FILES IN THIS PACKAGE
================================================================
  README.txt                            — This file (read first)
  1_make_recovery_usb.sh               — Download GALITH .bin (Linux/Mac)
  2_flash_usb.sh                       — Flash .bin to USB (Linux/Mac)
  3_restore_stock_firmware.sh          — Restore stock firmware on Chromebook
  4_restore_stock_firmware_linux.sh    — Same but from Linux live USB
  5_linux_live_howto.txt               — How to boot Linux live on GALITH

================================================================
PATH A — If you can still get a shell on the Chromebook
(ChromeOS loads partially, or you can reach login screen)
================================================================

Step 1: Get a terminal
  At login screen → Ctrl+Alt+F2 (F2 = right-arrow key)
  Login: chronos (no password)

Step 2: Run the firmware restore script
  bash 3_restore_stock_firmware.sh
  OR paste manually:
  cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh

Step 3: In the firmware script menu, choose:
  "Restore Stock Firmware"
  When prompted, insert your ChromeOS Recovery USB
  The script extracts the stock firmware from it

Step 4: After stock firmware is restored, reboot
  Enter Recovery Mode: ESC+Refresh+Power
  Insert recovery USB → recovery should now SUCCEED

================================================================
PATH B — If ChromeOS won't boot at all
(need to boot Linux live USB on the Chromebook)
================================================================

Step 1: On a working computer, create a Ubuntu live USB
  Download Ubuntu ISO: https://ubuntu.com/download/desktop
  Flash with Rufus in ISO mode (NOT dd mode) — Windows
  Or: sudo dd if=ubuntu.iso of=/dev/sdX bs=4M — Linux

Step 2: Enable Developer Mode on the broken Chromebook
  ESC+Refresh+Power → at recovery screen press Ctrl+D → Enter
  Wait ~5 min, then Ctrl+D again to boot

Step 3: Boot the Ubuntu USB
  At Developer Mode screen press Ctrl+L
  If Ctrl+L does nothing, the device likely has UEFI Full ROM
  already — just plug in Ubuntu USB and boot (press ESC for menu)

Step 4: In Ubuntu terminal, run:
  bash 4_restore_stock_firmware_linux.sh

Step 5: After stock firmware restored, follow PATH A from Step 4

================================================================
PATH C — Write Protect is blocking the firmware restore
(script says WP is ON and can't proceed)
================================================================

GALITH write-protect method: CR50 / Battery Disconnect

To disable write protect on GALITH:
  1. Power off laptop completely, unplug charger
  2. Remove back panel screws (small Phillips, around the edges)
  3. Disconnect the battery ribbon/connector from the motherboard
  4. Plug charger back in (no battery) 
  5. Boot — WP is now disabled
  6. Run the firmware script, restore stock firmware
  7. When done: power off, unplug charger, reconnect battery
  8. Reassemble, boot normally

Reference: https://docs.mrchromebox.tech/docs/firmware/wp/disabling.html

================================================================
CREATING THE CHROMEOS RECOVERY USB (Windows — easiest)
================================================================
Method 1: Chrome Recovery Utility (recommended)
  Install: https://chrome.google.com/webstore/detail/chromebook-recovery-utili/pocpnlppkickgojjlmhdmidojbmbodfm
  Search for: ASUS Chromebook CX1500CKA
  OR select manually: ASUS → Chromebook CX1500CKA

Method 2: Manual with Rufus
  Download .bin from: https://cros.tech/device/galith/
  Open Rufus → select .bin file
  !! MUST choose "DD Image" mode — NOT ISO !!
  Flash and eject

================================================================
KEY COMBOS FOR ASUS CX1500CKA
================================================================
Recovery Mode:     ESC + Refresh(↻) + Power
Enable Dev Mode:   (at recovery screen) Ctrl+D → Enter
Boot ChromeOS:     Ctrl+D (at developer screen)  
Boot Legacy/UEFI:  Ctrl+L (at developer screen)
Terminal VT2:      Ctrl+Alt+F2 → login: chronos
Return to VT7:     Ctrl+Alt+F1 (back to ChromeOS login)

================================================================
USEFUL LINKS
================================================================
Recovery images:       https://cros.tech/device/galith/
MrChromebox docs:      https://docs.mrchromebox.tech
Write protect guide:   https://docs.mrchromebox.tech/docs/firmware/wp/disabling.html
Firmware script:       https://docs.mrchromebox.tech/docs/fwscript.html
Recovery USB guide:    https://docs.mrchromebox.tech/docs/reverting/recovery-usb.html
Restore stock guide:   https://docs.mrchromebox.tech/docs/reverting/flashing-stock.html
Chrultrabook forum:    https://forum.chrultrabook.com
Rufus:                 https://rufus.ie/en/
================================================================
`;

export default function Home() {
  const files = [
    { name: "README.txt", content: README },
    { name: "1_make_recovery_usb.sh", content: SCRIPT_MAKE_RECOVERY_USB },
    { name: "2_flash_usb.sh", content: SCRIPT_FLASH_USB },
    { name: "3_restore_stock_firmware.sh", content: SCRIPT_RESTORE_STOCK },
    { name: "4_restore_stock_firmware_linux.sh", content: SCRIPT_LINUX_LIVE_RESTORE },
    { name: "5_linux_live_howto.txt", content: SCRIPT_LINUX_LIVE_HOWTO },
  ];

  const downloadAll = () => {
    files.forEach((f, i) => setTimeout(() => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([f.content], { type: "text/plain" }));
      a.download = f.name; a.click();
    }, i * 350));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold">ASUS CX1500CKA — Full Recovery Package</h1>
          <p className="text-slate-400 text-xs mt-0.5">Board: <span className="font-mono text-green-400">GALITH-HKFU</span> · Intel JasperLake · All scripts pre-configured</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ROOT CAUSE BOX */}
        <div className="bg-red-900 text-white rounded-xl p-4">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1">Why your recovery fails after 5 minutes</p>
              <p className="text-red-200 text-xs leading-relaxed">
                Your Chromebook's firmware has been modified (MrChromebox UEFI Full ROM was flashed on it at some point). 
                The stock ChromeOS recovery image runs fine but then <strong>can't write back to the firmware chip</strong> because hardware write-protect is still active. 
                This is documented by MrChromebox: <em>"If you disabled firmware write protection via battery disconnect, you'll need to disconnect the battery AGAIN for recovery to complete."</em>
              </p>
              <p className="text-red-200 text-xs mt-2 font-semibold">
                You need to restore the stock firmware first — THEN run the ChromeOS recovery USB.
              </p>
            </div>
          </div>
        </div>

        {/* DOWNLOAD ALL */}
        <div className="bg-white rounded-xl border-2 border-blue-300 p-4">
          <p className="font-bold text-slate-800 mb-1">Download the full package (5 scripts + README)</p>
          <p className="text-slate-500 text-xs mb-3">Put all files on a USB stick. README.txt has the full walkthrough for every scenario.</p>
          <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">
            <Download className="w-4 h-4" /> Download All 6 Files
          </button>
        </div>

        {/* THE 3 PATHS */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
          <p className="font-bold text-slate-800 mb-3 text-sm">Which path applies to you?</p>
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
              <p className="font-bold">PATH A — Chromebook gets to login screen (even broken)</p>
              <p className="mt-0.5">→ Ctrl+Alt+F2 → chronos → run firmware restore script → then recovery USB</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-bold">PATH B — Chromebook won't boot at all</p>
              <p className="mt-0.5">→ Boot Ubuntu live USB on the Chromebook → run firmware restore script → then recovery USB</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <p className="font-bold">PATH C — Firmware script says write protect is ON</p>
              <p className="mt-0.5">→ Open laptop, disconnect battery → run script with WP disabled → reconnect battery → recovery USB</p>
            </div>
          </div>
        </div>

        {/* STEP BY STEP */}
        <Step n="1" title="PATH A — Get a terminal on the Chromebook (if it partially boots)">
          <p>At the <strong>login screen</strong> (even the broken/recovery screen), try this:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs mt-2">
            <li>Press <kbd className="bg-slate-100 border rounded px-1 font-mono">Ctrl+Alt+F2</kbd> — F2 is the <strong>→ right-arrow key</strong></li>
            <li>You'll get a black terminal. Login: <code className="bg-slate-100 px-1 rounded font-mono">chronos</code> (no password)</li>
            <li>Run the firmware restore command:</li>
          </ol>
          <Code>cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh</Code>
          <p className="text-xs mt-2">In the menu that appears, select <strong>"Restore Stock Firmware"</strong>. Have your ChromeOS recovery USB plugged in — the script pulls the stock firmware off it.</p>
          <DownloadBtn label="Download script 3 (restore firmware)" filename="3_restore_stock_firmware.sh" content={SCRIPT_RESTORE_STOCK} />
        </Step>

        <Step n="2" title="PATH B — Boot a Linux live USB on the broken Chromebook">
          <Warn>Only needed if ChromeOS won't boot at all and you can't get a terminal.</Warn>
          <p className="text-xs font-semibold mb-1">On a working computer — create a Ubuntu live USB:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Download Ubuntu ISO: <a href="https://ubuntu.com/download/desktop" target="_blank" className="text-blue-600 underline">ubuntu.com/download/desktop <ExternalLink className="inline w-3 h-3" /></a></li>
            <li>Flash with Rufus in <strong>ISO mode</strong> (not dd mode — this is different from ChromeOS recovery!)</li>
          </ol>
          <p className="text-xs font-semibold mt-3 mb-1">On the broken Chromebook — enable Developer Mode:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Press <kbd className="bg-slate-100 border rounded px-1 font-mono">ESC+Refresh↻+Power</kbd></li>
            <li>At recovery screen press <kbd className="bg-slate-100 border rounded px-1 font-mono">Ctrl+D</kbd> → Enter → wait ~5 min (wipes data)</li>
            <li>Insert Ubuntu USB, press <kbd className="bg-slate-100 border rounded px-1 font-mono">Ctrl+L</kbd> at the developer screen</li>
            <li>If Ctrl+L does nothing → device has UEFI Full ROM → plug USB in and press ESC at boot for boot menu</li>
          </ol>
          <p className="text-xs font-semibold mt-3 mb-1">In Ubuntu terminal:</p>
          <Code>cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh</Code>
          <Good>Choose "Restore Stock Firmware" with ChromeOS recovery USB plugged in.</Good>
          <DownloadBtn label="Download script 4 (Linux live restore)" filename="4_restore_stock_firmware_linux.sh" content={SCRIPT_LINUX_LIVE_RESTORE} />
        </Step>

        <Step n="3" title="PATH C — Write protect is ON, script can't flash (open the laptop)">
          <Warn>Only if the firmware script says write protect is enabled and blocks you. For GALITH the WP method is: CR50 / Battery Disconnect.</Warn>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
            <p className="font-bold text-slate-800">How to disable write protect on GALITH:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Power off completely, unplug charger</li>
              <li>Remove back panel screws (small Phillips screws around the edges)</li>
              <li>Find battery connector on motherboard — <strong>unplug it</strong></li>
              <li>Plug charger back in (laptop runs on charger only, no battery)</li>
              <li>Boot and run firmware restore script — WP is now disabled</li>
              <li>After firmware restored: power off, unplug charger, <strong>reconnect battery</strong></li>
              <li>Reassemble and boot normally</li>
            </ol>
          </div>
          <p className="text-xs mt-2"><a href="https://docs.mrchromebox.tech/docs/firmware/wp/disabling.html" target="_blank" className="text-blue-600 underline">Full write protect guide <ExternalLink className="inline w-3 h-3" /></a></p>
        </Step>

        <Step n="4" title="After firmware restored — run ChromeOS recovery USB (your final step)">
          <Good>Once stock firmware is restored, your recovery USB WILL work. This is the same USB you already have.</Good>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Power off Chromebook completely</li>
            <li>Press <kbd className="bg-slate-100 border rounded px-1 font-mono">ESC+Refresh↻+Power</kbd></li>
            <li>Wait for "Chrome OS is missing or damaged" screen</li>
            <li>Insert your recovery USB</li>
            <li>Recovery runs automatically — wait 5-15 min</li>
            <li>Chromebook reboots — setup ChromeOS fresh</li>
          </ol>
          <Info>The recovery USB you already made is fine. The issue was never the USB — it was the firmware needing to be restored first.</Info>
        </Step>

        {/* Individual downloads */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-800 text-sm mb-3">Download files individually</p>
          <div className="space-y-2">
            {files.map(f => (
              <div key={f.name} className="flex items-center justify-between gap-2 py-1 border-b border-slate-100 last:border-0">
                <span className="font-mono text-xs text-slate-600">{f.name}</span>
                <DownloadBtn label="↓" filename={f.name} content={f.content} />
              </div>
            ))}
          </div>
        </div>

        {/* Key combos */}
        <div className="bg-slate-900 text-white rounded-xl p-4 text-xs">
          <p className="font-bold text-slate-300 mb-2">⌨️ Key combos — ASUS CX1500CKA</p>
          <div className="space-y-1 font-mono">
            {[
              ["Recovery Mode", "ESC + Refresh↻ + Power"],
              ["Enable Dev Mode", "Ctrl+D → Enter (at recovery screen)"],
              ["Boot ChromeOS", "Ctrl+D (at dev screen)"],
              ["Boot Linux/UEFI", "Ctrl+L (at dev screen)"],
              ["Terminal", "Ctrl+Alt+F2 → login: chronos"],
              ["Back to ChromeOS UI", "Ctrl+Alt+F1"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-500 w-32 flex-shrink-0">{k}:</span>
                <span className="text-yellow-300">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          Sources: <a href="https://docs.mrchromebox.tech" target="_blank" className="text-blue-500 underline">MrChromebox</a> · <a href="https://cros.tech/device/galith" target="_blank" className="text-blue-500 underline">cros.tech/device/galith</a> · <a href="https://forum.chrultrabook.com" target="_blank" className="text-blue-500 underline">chrultrabook forum</a>
        </p>
      </div>
    </div>
  );
}