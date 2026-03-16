import { useState } from "react";
import { CheckCircle, Circle, ChevronDown, ChevronUp, AlertTriangle, Download, Terminal, Usb, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";

const RECOVERY_URL = "https://dl.google.com/dl/edgedl/chromeos/recovery/chromeos_16552.53.0_galith_recovery_stable-channel_mp-v3.bin.zip";
const RECOVERY_CROS_TECH = "https://cros.tech/device/galith/";
const RECOVERY_UTIL_URL = "https://chrome.google.com/webstore/detail/chromebook-recovery-utili/pocpnlppkickgojjlmhdmidojbmbodfm";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 p-1 rounded hover:bg-slate-600 transition-colors text-slate-300 hover:text-white">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CodeBlock({ code }) {
  return (
    <div className="bg-slate-900 rounded-lg p-3 mt-2 flex items-start justify-between gap-2 font-mono text-sm text-green-300 break-all">
      <span>{code}</span>
      <CopyButton text={code} />
    </div>
  );
}

function Step({ number, title, icon: Icon, color, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className={`rounded-xl border-2 ${color} overflow-hidden mb-4`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {number}
        </div>
        <Icon className="w-5 h-5 flex-shrink-0 text-slate-600" />
        <span className="font-semibold text-slate-800 flex-1">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-4 bg-white border-t border-slate-100">{children}</div>}
    </div>
  );
}

function Warn({ children }) {
  return (
    <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm mb-3">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function Note({ children }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm mb-3">
      {children}
    </div>
  );
}

function Li({ children }) {
  return (
    <li className="flex gap-2 items-start text-slate-700 text-sm mb-2">
      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function NumLi({ n, children }) {
  return (
    <li className="flex gap-3 items-start text-slate-700 text-sm mb-3">
      <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{n}</span>
      <span>{children}</span>
    </li>
  );
}

export default function Home() {
  const [scenario, setScenario] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <RefreshCw className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">ChromeOS Recovery Guide</h1>
          </div>
          <p className="text-slate-400 text-sm">ASUS CX1500CKA · Board: <span className="text-green-400 font-mono font-bold">GALITH-HKFU</span> · Intel JasperLake</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Device confirmed */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Your device is confirmed supported</p>
            <p className="text-green-700 text-xs mt-1">GALITH supports both RW_LEGACY (keep ChromeOS) and UEFI Full ROM firmware. Recovery images are available.</p>
          </div>
        </div>

        {/* Scenario picker */}
        {!scenario && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-800 mb-3">What's your situation right now?</h2>
            <div className="grid gap-3">
              {[
                { id: "broken", label: "ChromeOS is broken / won't boot", sub: "Shows error, missing OS, damaged screen, or stuck", color: "border-red-300 bg-red-50 hover:bg-red-100" },
                { id: "devmode", label: "I'm in Developer Mode and have a terminal", sub: "You see the white 'OS verification is OFF' screen on boot", color: "border-blue-300 bg-blue-50 hover:bg-blue-100" },
                { id: "normal", label: "ChromeOS is working fine", sub: "I want to set up dual boot or understand my options", color: "border-green-300 bg-green-50 hover:bg-green-100" },
              ].map(s => (
                <button key={s.id} onClick={() => setScenario(s.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${s.color}`}>
                  <p className="font-semibold text-slate-800">{s.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {scenario && (
          <button onClick={() => setScenario(null)} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
            ← Change scenario
          </button>
        )}

        {/* ───────── SCENARIO: BROKEN ───────── */}
        {scenario === "broken" && (
          <div>
            <Warn>Your GALITH has reached End of Life (EOL) — Google no longer updates it. This doesn't stop recovery, it just means the firmware script can't install RW_LEGACY on EOL devices. Plain ChromeOS recovery still works fine.</Warn>

            <Step number={1} title="What you need before starting" icon={CheckCircle} color="border-slate-200" defaultOpen={true}>
              <ul className="space-y-1">
                <Li>A second computer (Windows, Mac, or Linux) — any will work</Li>
                <Li>A USB drive, 8GB or larger (all data on it will be erased)</Li>
                <Li>Google Chrome browser installed on the second computer</Li>
                <Li>An internet connection</Li>
              </ul>
              <Note>You do NOT need to run any scripts. You do NOT need a terminal. You do NOT need to open the laptop.</Note>
            </Step>

            <Step number={2} title="Create your ChromeOS Recovery USB" icon={Download} color="border-blue-200" defaultOpen={true}>
              <p className="text-sm text-slate-600 mb-3">Do this on your working second computer. There are two methods — try Method A first:</p>

              <div className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-200">
                <p className="font-semibold text-slate-800 text-sm mb-2">✅ Method A — Chromebook Recovery Utility (easiest, Windows/Mac/ChromeOS)</p>
                <ol className="space-y-1">
                  <NumLi n={1}>Install the <a href={RECOVERY_UTIL_URL} target="_blank" className="text-blue-600 underline">Chromebook Recovery Utility <ExternalLink className="inline w-3 h-3" /></a> Chrome extension</NumLi>
                  <NumLi n={2}>Open it, click the gear icon → "Use a recovery image file" — OR — search for <strong>ASUS Chromebook CX1500CKA</strong></NumLi>
                  <NumLi n={3}>Plug in your USB drive</NumLi>
                  <NumLi n={4}>Select your USB drive and click Continue → Create Now</NumLi>
                  <NumLi n={5}>Wait for it to finish (5–15 min). Done!</NumLi>
                </ol>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="font-semibold text-slate-800 text-sm mb-2">🔧 Method B — Manual download + Rufus (Windows, if Method A fails)</p>
                <ol className="space-y-1">
                  <NumLi n={1}>
                    Go to <a href={RECOVERY_CROS_TECH} target="_blank" className="text-blue-600 underline">cros.tech/device/galith <ExternalLink className="inline w-3 h-3" /></a> → click "Recovery Images" → download the latest stable .zip → extract the .bin file
                  </NumLi>
                  <NumLi n={2}>Download <a href="https://rufus.ie/en/" target="_blank" className="text-blue-600 underline">Rufus <ExternalLink className="inline w-3 h-3" /></a></NumLi>
                  <NumLi n={3}>Open Rufus, plug in USB, click SELECT and choose your .bin file</NumLi>
                  <NumLi n={4}><strong className="text-red-700">CRITICAL:</strong> When Rufus asks, choose <strong>"DD Image"</strong> mode — NOT ISO mode</NumLi>
                  <NumLi n={5}>Click Start and wait</NumLi>
                </ol>
                <Warn>If you pick ISO mode in Rufus, the recovery will fail. Must be DD mode.</Warn>
              </div>
            </Step>

            <Step number={3} title="Enter Recovery Mode on your ASUS" icon={RefreshCw} color="border-purple-200" defaultOpen={true}>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="font-semibold text-yellow-800 text-sm">On your broken ASUS CX1500CKA:</p>
              </div>
              <ol className="space-y-2">
                <NumLi n={1}>Make sure the laptop is completely <strong>powered off</strong></NumLi>
                <NumLi n={2}>Press and hold <kbd className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">ESC</kbd> + <kbd className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">Refresh ↻</kbd> (the circular arrow key, top row), then while holding both, press <kbd className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">Power</kbd></NumLi>
                <NumLi n={3}>Release all keys when the screen lights up</NumLi>
                <NumLi n={4}>You should see a screen saying <strong>"Chrome OS is missing or damaged"</strong> or similar recovery screen</NumLi>
              </ol>
              <Note>The Refresh key is the circular arrow ↻ in the top row — usually the 4th key from the left on a Chromebook keyboard. It is NOT F3 like on some keyboards.</Note>
            </Step>

            <Step number={4} title="Run the recovery" icon={Usb} color="border-green-200" defaultOpen={true}>
              <ol className="space-y-2">
                <NumLi n={1}>When you see the recovery screen on the broken laptop, plug in your recovery USB</NumLi>
                <NumLi n={2}>The recovery starts automatically — you'll see a progress bar</NumLi>
                <NumLi n={3}>Wait 5–20 minutes. Do not unplug anything.</NumLi>
                <NumLi n={4}>The device will reboot automatically when done</NumLi>
                <NumLi n={5}>Remove the USB when the laptop restarts</NumLi>
                <NumLi n={6}>Set up ChromeOS as if it were brand new</NumLi>
              </ol>
              <Note>If recovery fails, try a different USB drive. Some USB drives have compatibility issues with ChromeOS recovery.</Note>
            </Step>

            <Step number={5} title="OPTIONAL: After recovery — install RW_LEGACY for dual boot" icon={Terminal} color="border-orange-200">
              <Warn>Skip this step if you just want ChromeOS working again. Only do this if you want to also run Linux.</Warn>
              <p className="text-sm text-slate-600 mb-3">Once ChromeOS is working again, to run the MrChromebox firmware script:</p>
              <ol className="space-y-2">
                <NumLi n={1}>At the ChromeOS login screen, press <kbd className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">Ctrl+Alt+F2</kbd> (F2 = right arrow key →)</NumLi>
                <NumLi n={2}>Log in as: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">chronos</code> (no password)</NumLi>
                <NumLi n={3}>Run this command:</NumLi>
              </ol>
              <CodeBlock code="cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh" />
              <p className="text-sm text-slate-600 mt-3">Select option <strong>1</strong> — "Install/Update RW_LEGACY Firmware". This lets you dual-boot ChromeOS + Linux without opening the laptop.</p>
              <Warn>Because GALITH is EOL, the script will NOT offer RW_LEGACY — only UEFI Full ROM (which removes ChromeOS). If you want to keep ChromeOS, just stop after Step 4 — recovery is all you need.</Warn>
            </Step>
          </div>
        )}

        {/* ───────── SCENARIO: DEV MODE ───────── */}
        {scenario === "devmode" && (
          <div>
            <Note>You're in a great position — you have terminal access. The firmware script will run directly on your device.</Note>

            <Step number={1} title="Open a terminal (VT2 shell)" icon={Terminal} color="border-blue-200" defaultOpen={true}>
              <p className="text-sm text-slate-600 mb-2">At the login screen (don't log in):</p>
              <ol className="space-y-2">
                <NumLi n={1}>Press <kbd className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">Ctrl+Alt+F2</kbd> — F2 is the <strong>right arrow →</strong> key on your keyboard</NumLi>
                <NumLi n={2}>You'll see a black text screen asking for login</NumLi>
                <NumLi n={3}>Type <code className="bg-slate-100 px-1 rounded font-mono">chronos</code> and press Enter (no password needed)</NumLi>
              </ol>
            </Step>

            <Step number={2} title="Run the MrChromebox Firmware Script" icon={Terminal} color="border-green-200" defaultOpen={true}>
              <p className="text-sm text-slate-600 mb-2">Copy and paste this exact command:</p>
              <CodeBlock code="cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh" />
              <p className="text-sm text-slate-600 mt-3">The script will detect your GALITH device automatically and show you a menu.</p>
              <Warn>GALITH is EOL. The script will likely only show UEFI Full ROM (which removes ChromeOS). RW_LEGACY is blocked on EOL devices. If you want to keep ChromeOS, use the ChromeOS Recovery USB method instead (select "ChromeOS is broken" above).</Warn>
            </Step>

            <Step number={3} title="What the menu options mean for GALITH" icon={CheckCircle} color="border-purple-200" defaultOpen={true}>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-semibold text-green-800 text-sm">Option 1 — RW_LEGACY (if available)</p>
                  <p className="text-green-700 text-xs mt-1">Keeps ChromeOS, adds ability to boot Linux. No hardware opening needed. BUT: likely greyed out/disabled for GALITH (EOL).</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="font-semibold text-orange-800 text-sm">Option 2 — UEFI Full ROM</p>
                  <p className="text-orange-700 text-xs mt-1">Replaces firmware entirely. Removes ChromeOS permanently. Requires disabling hardware write-protect (opening laptop). Only do this if you want Linux/Windows instead of ChromeOS.</p>
                </div>
              </div>
            </Step>
          </div>
        )}

        {/* ───────── SCENARIO: NORMAL ───────── */}
        {scenario === "normal" && (
          <div>
            <Note>Good news — your device boots! You're in the best position. Here's what you can do with GALITH.</Note>

            <Step number={1} title="Your options on a working GALITH" icon={CheckCircle} color="border-green-200" defaultOpen={true}>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-semibold text-green-800 text-sm">✅ Keep ChromeOS (just use it)</p>
                  <p className="text-green-700 text-xs mt-1">GALITH is EOL but still fully functional. You just won't get future ChromeOS updates. No changes needed.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-semibold text-blue-800 text-sm">⚠️ RW_LEGACY for dual boot</p>
                  <p className="text-blue-700 text-xs mt-1">Normally this would let you dual-boot Linux. However, GALITH is EOL and MrChromebox blocks RW_LEGACY on EOL devices. You'd need UEFI Full ROM instead.</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="font-semibold text-orange-800 text-sm">🔧 UEFI Full ROM (replace ChromeOS)</p>
                  <p className="text-orange-700 text-xs mt-1">Completely replaces ChromeOS with Linux or Windows. Requires opening the laptop to remove a write-protect screw/jumper, then running the firmware script.</p>
                </div>
              </div>
            </Step>

            <Step number={2} title="To run the firmware script on a working device" icon={Terminal} color="border-slate-200">
              <ol className="space-y-2">
                <NumLi n={1}>First enable Developer Mode: power off → hold <kbd className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono">ESC+Refresh↻+Power</kbd> → at recovery screen press <kbd className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono">Ctrl+D</kbd> → Enter</NumLi>
                <NumLi n={2}><strong>Warning: Developer Mode wipes all your data.</strong> Back up first!</NumLi>
                <NumLi n={3}>Once in Developer Mode, at the login screen press <kbd className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono">Ctrl+Alt+→</kbd></NumLi>
                <NumLi n={4}>Login as <code className="bg-slate-100 px-1 rounded font-mono">chronos</code></NumLi>
                <NumLi n={5}>Run the script:</NumLi>
              </ol>
              <CodeBlock code="cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh" />
            </Step>
          </div>
        )}

        {/* Always-visible quick reference */}
        <div className="mt-6 bg-slate-900 text-white rounded-xl p-4">
          <p className="font-bold text-sm mb-3 text-slate-300">📋 Quick Reference — GALITH / ASUS CX1500CKA</p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between gap-2"><span>Board name:</span><span className="font-mono text-green-400">GALITH</span></div>
            <div className="flex justify-between gap-2"><span>Platform:</span><span className="font-mono text-green-400">Intel JasperLake</span></div>
            <div className="flex justify-between gap-2"><span>Status:</span><span className="font-mono text-amber-400">EOL (still recoverable)</span></div>
            <div className="flex justify-between gap-2"><span>Recovery key combo:</span><span className="font-mono text-green-400">ESC + Refresh + Power</span></div>
            <div className="flex justify-between gap-2"><span>Terminal shortcut:</span><span className="font-mono text-green-400">Ctrl+Alt+F2 → chronos</span></div>
            <div className="border-t border-slate-700 pt-2 mt-2">
              <p className="text-slate-400 mb-1">Recovery image source:</p>
              <a href={RECOVERY_CROS_TECH} target="_blank" className="text-blue-400 underline break-all">cros.tech/device/galith</a>
            </div>
            <div className="border-t border-slate-700 pt-2 mt-2">
              <p className="text-slate-400 mb-1">Firmware script command:</p>
              <div className="flex items-center gap-1">
                <code className="text-green-300 text-xs break-all">cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh</code>
                <CopyButton text="cd; curl -LOf https://mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Need more help? Visit <a href="https://forum.chrultrabook.com" target="_blank" className="text-blue-500 underline">forum.chrultrabook.com</a></p>
      </div>
    </div>
  );
}