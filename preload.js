const { webFrame } = require("electron")

// Load discords preload
const path = process.env.DISCORD_PRELOAD
if (path) { require(path) }
else { console.error("No preload path found!") }

((window) => {
  // Simple add item to both 'global' and 'window'
  const toWindow = (key, value) => {
    window[key] = value
    global[key] = value
  }
  // DomLoaded event
  async function DomLoaded() {
    // Add require to window
    toWindow("require", require)
    // Remove Discods devtools alert
    await window.DiscordNative.window.setDevtoolsCallbacks(null, null)
  }
  if (window.document.readyState === "loading") window.document.addEventListener("DOMContentLoaded", DomLoaded)
  else DomLoaded()
})(webFrame.top.context)
