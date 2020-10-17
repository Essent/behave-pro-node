#!/usr/bin/env node
// @ts-check
"use strict";
const fetch = require("node-fetch");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const mkdir = require("mkdirp");
const _ = require("lodash");
const chalk = require("chalk");

/**
 * @typedef {{
 * host?: string,
 * id?: string,
 * userId?: string,
 * apiKey?: string,
 * output?:string,
 * manual?: boolean,
 * config?: string
 * }} Settings
 */

/**
 *
 * @param {Settings} settings
 */
async function fetchFeaturesFromConfig(settings) {
  const settingsPath = path.join(process.cwd(), settings.config);
  try {
    await fs.promises.access(
      settingsPath,
      fs.constants.F_OK | fs.constants.R_OK
    );

    const configuration = require(settingsPath);
    const features = configuration.map(function (config) {
      _.extend(settings, config);
      return fetchFeatures(settings);
    });
    return await Promise.all(features);
  } catch (error) {
    throw new Error(
      chalk.red(`Could not find config at: ${chalk.bold(settingsPath)}`)
    );
  }
}

/**
 * 
 * @param {Settings} settings 
 */
async function fetchFeatures(settings) {
  const projectId = settings.id;
  const userId = settings.userId;
  const apiKey = settings.apiKey;

  ensureSettingsExist(projectId, userId, apiKey);

  console.log(
    chalk.cyan(
      `Downloading features from JIRA project ${chalk.bold(projectId)} ...`
    )
  );

  const url = [
    settings.host,
    "/rest/cucumber/1.0/project/",
    projectId,
    "/features?manual=",
    settings.manual,
  ].join("");

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${userId}:${apiKey}`).toString(
        "base64"
      )}`,
    },
  });

  let err = null;
  switch (response.status) {
    case 500:
      err = new Error(chalk.red("Server error: check your host url"));
      throw err;
    case 401:
      err = new Error(
        chalk.red("Unauthorized: ensure userId and apiKey are both valid")
      );
      throw err;
    case 200:
      break;
    default:
      err = new Error(
        chalk.red(response.status + " http error when downloading")
      );
      throw err;
  }

  const projectPath = path.join(settings.output, `${projectId}`);
  await mkdir(projectPath);
  const buffer = await response.buffer();
  await writeFeatures(buffer, projectPath);
  const filesCount = await countFeatures(projectPath);

  console.log(
    chalk.green(
      `Saved ${filesCount} ${
        filesCount > 1 ? "features" : "feature"
      } to ${path.join(process.cwd(), projectPath)}/`
    )
  );
}

module.exports = {
  fetchFeatures: fetchFeatures,
  fetchFeaturesFromConfig: fetchFeaturesFromConfig,
};

/**
 *
 * @param {Buffer} buffer
 * @param {string} featuresPath
 */
async function writeFeatures(buffer, featuresPath) {
  const zipPath = featuresPath + ".zip";
  await fs.promises.writeFile(zipPath, buffer);

  await fs
    .createReadStream(zipPath)
    .pipe(
      unzipper.Extract({
        path: featuresPath,
      })
    )
    .promise();

  await await fs.promises.unlink(zipPath);
}

/**
 *
 * @param {string} projectId
 * @param {string} userId
 * @param {string} apiKey
 */
function ensureSettingsExist(projectId, userId, apiKey) {
  let err = null;

  if (!projectId) {
    err = new Error(chalk.red("projectId is missing"));
  } else if (!userId) {
    err = new Error(chalk.red("userId is missing"));
  } else if (!apiKey) {
    err = new Error(chalk.red("apiKey is missing"));
  }

  if (err) {
    throw err;
  }
}

/**
 *
 * @param {string} path
 */
async function countFeatures(path) {
  const files = await fs.promises.readdir(path);
  return files.length;
}
