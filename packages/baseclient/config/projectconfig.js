const config = {
  shogunConfig: {
    baseUrl: "http://localhost:9876/shogun2-webapp",
    user: "admin",
    password: "🔑"
  },
  appConfig: {
    // path relative to the baseclients Main.tsx, e.g.
    // projectMainPath: "./../../myproject/",
    projectMainPath: "./",
    projectMainClass: "ProjectMain"
  }
};
module.exports = config;
