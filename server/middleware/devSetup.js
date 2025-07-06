// LiveReload (Development Only - remove or comment out for production)
const setupLiveReload = (app, path) => {
  if (process.env.NODE_ENV !== "production") {
    try {
      const livereload = require("livereload");
      const connectLivereload = require("connect-livereload");

      const liveReloadServer = livereload.createServer({
        port: 35731, // Use a different port to avoid conflicts
        exts: ["html", "css", "js", "ejs"],
      });
      liveReloadServer.watch(path.join(__dirname, "../../client/views"));
      liveReloadServer.watch(path.join(__dirname, "../../client/public"));
      app.use(connectLivereload());

      liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
          liveReloadServer.refresh("/");
        }, 100);
      });
    } catch (e) {
      console.warn(
        "Livereload setup failed. Ensure livereload and connect-livereload are installed if in development.",
        e.message
      );
    }
  }
};

module.exports = { setupLiveReload };
