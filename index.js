const { join } = require("path")
const electron = require("electron")
const Module = require("module")

electron.app.commandLine.appendSwitch("no-force-async-hooks-checks")
// New BrowserWindow constructor
class BrowserWindow extends electron.BrowserWindow {
  constructor(opt) {
    if (!opt || !opt.webPreferences || !opt.webPreferences.preload || !opt.title) return super(opt)
    const originalPreload = opt.webPreferences.preload
    process.env.DISCORD_PRELOAD = originalPreload

    opt.webPreferences.contextIsolation = false
    opt.webPreferences.enableRemoteModule = true
    opt.webPreferences.preload = true
    opt.webPreferences.preload = join(__dirname, "preload.js")
    super(opt)
  }
}
// Kill CSP
electron.app.once("ready", () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(function({ responseHeaders }, callback) {
    for (const iterator of Object.keys(responseHeaders))
      if (iterator.includes("content-security-policy"))
        delete responseHeaders[iterator]

    callback({ 
      cancel: false, 
      responseHeaders
    })
  })
})
// New electron
const Electron = new Proxy(electron, { get: (target, prop) => prop === "BrowserWindow" ? BrowserWindow : target[prop] })
// Replace electron with new proxy
const electronPath = require.resolve("electron")
delete require.cache[electronPath].exports
require.cache[electronPath].exports = Electron
// Load Discord's asar
const basePath = join(process.resourcesPath, "app.asar")
const pkg = require(join(basePath, "package.json"))
electron.app.setAppPath(basePath)
electron.app.name = pkg.name
Module._load(join(basePath, pkg.main), null, true)
