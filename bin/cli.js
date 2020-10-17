#!/usr/bin/env node
"use strict";
const BehavePro = require("../lib/behavepro");
const args = require("minimist")(process.argv.slice(2));
const packageJson = require("../package.json");
const chalk = require("chalk");

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

const settings = {
  host: args.host || "https://behave.pro",
  id: args.key || args.project || args.id,
  userId: args.user || args.userId,
  apiKey: args.api || args.apiKey || args.password,
  output: args.output || args.dir || args.directory || "features",
  manual: args.manual || args.m || false,
  config: args.config || "config.json",
};

const errorHandler = (err) => {
  console.error("There was an error:", err);
  process.exit(1); //mandatory (as per the Node.js docs)
};

if (settings.id && settings.userId && settings.apiKey) {
  BehavePro.fetchFeatures(settings).catch(errorHandler);
} else {
  BehavePro.fetchFeaturesFromConfig(settings).catch(errorHandler);
}

process.on("uncaughtException", errorHandler);
