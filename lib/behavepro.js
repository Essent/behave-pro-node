#!/usr/bin/env node
"use strict";
const request = require("request");
const unzipper = require("unzipper");
const fs = require("fs");
const mkdir = require("mkdirp");
const _ = require("lodash");
const chalk = require("chalk");
const red = chalk.red;

const fetchFeaturesFromConfig = function(settings, callback) {
  fs.exists(process.cwd() + "/" + settings.config, function findConfig(exists) {
    if (exists) {
      const configuration = require(process.cwd() + "/" + settings.config);
      configuration.forEach(function(config) {
        _.extend(settings, config);
        fetchFeatures(settings, callback);
      });
    } else {
      const err = new Error(
        red("Could not find config at " + process.cwd() + "/" + settings.config)
      );
      throw err;
    }
  });
};

const fetchFeatures = function(settings, callback) {
  const projectId = settings.id;
  const userId = settings.userId;
  const apiKey = settings.apiKey;

  ensureSettingsExist(projectId, userId, apiKey, function() {
    console.log(
      chalk.cyan("Downloading features from JIRA project " + projectId + "...")
    );
    const url = [
      settings.host,
      "/rest/cucumber/1.0/project/",
      projectId,
      "/features?manual=",
      settings.manual
    ].join("");

    request(
      {
        url: url,
        headers: {
          Authorization:
            "Basic " + Buffer.from(userId + ":" + apiKey).toString("base64")
        },
        encoding: null
      },
      function(error, response, body) {
        if (error) throw error;
        let err = null;
        switch (response.statusCode) {
          case 500:
            err = new Error(red("Server error: check your host url"));
            throw err;
          case 401:
            err = new Error(
              red("Unauthorized: ensure userId and apiKey are both valid")
            );
            throw err;
          case 200:
            break;
          default:
            err = new Error(
              red(response.statusCode + " http error when downloading")
            );
            throw err;
        }

        const path = settings.output + "/" + projectId;
        mkdir(path, function(err) {
          if (err) throw err;
          writeFeatures(body, path, function() {
            countFeatures(path, function(files) {
              console.log(
                chalk.green(
                  `Saved ${files.length} ${
                    files.length > 1 ? "features" : "feature"
                  } to ${process.cwd()}/${path}/`
                )
              );
            });
            if (callback) callback();
          });
        });
      }
    );
  });
};

module.exports = {
  fetchFeatures: fetchFeatures,
  fetchFeaturesFromConfig: fetchFeaturesFromConfig
};

function writeFeatures(body, path, callback) {
  fs.writeFile(path + ".zip", body, function(err) {
    if (err) throw err;
    const stream = fs.createReadStream(path + ".zip").pipe(
      unzipper.Extract({
        path: path
      })
    );

    stream.on("close", function() {
      removeZip(path + ".zip");
      callback();
    });
  });
}

function ensureSettingsExist(projectId, userId, apiKey, callback) {
  let err = null;

  if (!projectId) {
    err = new Error(red("projectId is missing"));
  } else if (!userId) {
    err = new Error(red("userId is missing"));
  } else if (!apiKey) {
    err = new Error(red("apiKey is missing"));
  }

  if (err) {
    throw err;
  }

  return callback();
}

function countFeatures(path, callback) {
  fs.readdir(path, function(err, files) {
    callback(files);
  });
}

function removeZip(file, callback) {
  fs.unlink(file, function(err) {
    if (err) throw err;
    if (callback) callback();
  });
}
