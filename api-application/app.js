var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var logsRouter = require("./routes/logs");
const sqlInjectionDetector = require("./sqlInjectionDetector");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sqlInjectionDetector);

app.use("/", indexRouter);
app.use("/logs", logsRouter);

app.listen(8080, function () {
  console.log("API is running on port 8080");
});
