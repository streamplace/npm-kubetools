
var https = require("https");

module.exports = function(url, cb) {
  https.get(url).on("data", function(data) {
    console.log(data.length);
  });
}
