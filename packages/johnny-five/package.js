Package.describe({
  summary: "Arduino with JavaScript"
});

Npm.depends({"johnny-five": "https://github.com/jongd/johnny-five/tarball/e559c10ea4cfa8477f2b661f3457734d136e9e86"});

Package.on_use(function (api) {
  api.add_files("johnny-five.js", "server");
});