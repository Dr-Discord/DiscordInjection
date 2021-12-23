const { webFrame } = require("electron")

// Load discords preload
const path = process.env.DISCORD_PRELOAD
if (path) { require(path) }
else { console.error("No preload path found!") }

((window) => {
  const toWindow = (key, value) => {
    if (key.name === undefined){
      window[key] = value
      global[key] = value
    }
    else {
      window[key.name] = key
      global[key.name] = key
    }
  }
  async function DomLoaded() {
    toWindow(require)
    await window.DiscordNative.window.setDevtoolsCallbacks(null, null)
  }
  if (window.document.readyState === "loading") window.document.addEventListener("DOMContentLoaded", DomLoaded)
  else DomLoaded()
})(webFrame.top.context)