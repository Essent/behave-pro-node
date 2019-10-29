#!/usr/bin/env node
"use strict";
var BehavePro = require("../lib/behavepro");
var args = require("minimist")(process.argv.slice(2));
var packageJson = require("../package.json");
var chalk = require("chalk");

if (args.help) {
  console.log(
    chalk.cyan("Behave Pro NodeJS client v" + packageJson.version) +
      "\n\n" +
      "$ behavepro [--id PROJECT ID] [--userId USER] [--apiKey KEY]\n\n" +
      "   [--host HOST]         Behave Pro host - default: 'http://behave.pro'\n" +
      "   [--id PROJECT ID]     JIRA project id\n" +
      "   [--userId USER]       Behave Pro user id\n" +
      "   [--apiKey KEY]        Behave Pro api key\n" +
      "   [--output DIRECTORY]  Output directory - default: 'features'\n" +
      "   [--manual]            Include scenarios marked as manual\n" +
      "   [--config CONFIG]     JSON config file - relative to current directory\n\n" +
      "Further docs at http://docs.behave.pro"
  );
  return;
}

var settings = {
  host: args.host || "https://behave.pro",
  id: args.key || args.project || args.id,
  userId: args.user || args.userId,
  apiKey: args.api || args.apiKey || args.password,
  output: args.output || args.dir || args.directory || "features",
  manual: args.manual || args.m || false,
  config: args.config || "config.json"
};

if (settings.id && settings.userId && settings.apiKey) {
  BehavePro.fetchFeatures(settings);
} else {
  BehavePro.fetchFeaturesFromConfig(settings);
}
