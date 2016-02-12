"use strict";

// TODO figure out exact order of operations with logging.

const fs = require("fs");
const request = require("request");

const monitorActiveRequests = require("./");

const noop = () => {};

const readPackageJson = () => fs.readFile("./package.json", noop);
const requestSomething = () => request("http://api.classdojo.com/", noop);

const DURATION = 300;

function networkLoop () {
  setTimeout(function () {
    callCount(requestSomething, rand())
    networkLoop();
  }, DURATION);
}

function fsLoop () {
  setTimeout(function () {
    callCount(readPackageJson, rand())
    fsLoop();
  }, DURATION);
}

const rand = () => Math.ceil(Math.random() * 100)

function callCount (f, n) {
  while (n) {
    f();
    --n;
  }
}

const stop = monitorActiveRequests(report);

function report (added, removed) {
  if (removed.length) {
    console.log("removed", stringifySummary(summarizeRequests(removed)));
  }

  if (added.length) {
    console.log("added", stringifySummary(summarizeRequests(added)));
  }
}

function summarizeRequests (requests) {
  return requests.reduce(function (map, request) {
    var name = request.constructor.name;
    if (map[name] == null) map[name] = 0;
    map[name] += 1;
    return map;
  }, {})
}

function stringifySummary (summary) {
  return Object.keys(summary).map(k => `${k}: ${summary[k]};`).join(" ");
}

fsLoop();
networkLoop();

