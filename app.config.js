/* global __dirname */

const fs = require("fs");
const path = require("path");

const appJson = require("./app.json");

const readDotEnvValue = (key) => {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return undefined;

  const line = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${key}=`));

  if (!line) return undefined;

  return line.split("=").slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
};

const googleMapsApiKey =
  process.env.GOOGLE_MAPS_API_KEY || readDotEnvValue("GOOGLE_MAPS_API_KEY");

module.exports = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    config: {
      ...appJson.expo.android?.config,
      googleMaps: {
        ...appJson.expo.android?.config?.googleMaps,
        apiKey: googleMapsApiKey,
      },
    },
  },
  updates: {
    ...appJson.expo.updates,
    url: "https://u.expo.dev/349e4cf6-ce87-4216-98a1-a9d26a278880",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
};
