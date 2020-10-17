#!/usr/bin/env node
"use strict";
const BehavePro = require("./lib/behavepro");
const _ = require("lodash");

const defaultSettings = {
  host: "https://behave.pro",
  output: "features",
  manual: false,
  config: "config.json"
};

module.exports = function(settings) {
  _.defaults(settings, defaultSettings);
  return BehavePro.fetchFeatures(settings)
};
