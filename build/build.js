import { parseArgs } from "util";
import fs from "fs/promises";
import json from "../package.json";

if (!json.version) {
  const error = new Error();
  error.message = "Version could not be imported from package.json";
  throw error;
}

/**
 *
 * @param {string} version
 */
function bumpVersion(version) {
    console.log(version)
  if (isNaN(version)) {
    throw new Error("version provided is not a number");
  }
  let v = parseInt(version);
  v++;
  return v;
}

async function writeToJSON() {
  try {
    await fs.writeFile("../package.json", JSON.stringify(json, null, 2));
    console.log("version successfully updated to:", json.version);
  } catch (e) {
    console.error(e);
  }
}

try {
  const output = await Bun.build({
    entrypoints: ["../models/MSSQL.js", "../models/PGSQL.js"],
    outdir: "./dist",
    minify: true,
    target: "node",
    naming: "[name].bundle.js",
  });

  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      major: {
        default: false,
        type: "boolean",
      },
      minor: {
        default: false,
        type: "boolean",
      },
      build: {
        default: false,
        type: "boolean",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  const [major, minor, build] = json.version.split(".");

  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();

  if (month < 10) {
    month = `0${month}`;
  }

  if (day < 10) {
    day = `0${day}`;
  }

  const versionDateString = `(${year}.${month}.${day})`;

  switch (true) {
    case values.major:
      const newMajor = bumpVersion(major);
      json.version = `${newMajor}.${minor}.${build} ${versionDateString}`;
      await writeToJSON();
      break;
    case values.minor:
      const newMinor = bumpVersion(minor);
      json.version = `${major}.${newMinor}.${build} ${versionDateString}`;
      await writeToJSON();

      break;
    case values.build:
      const newBuild = bumpVersion(build.slice(0, build.indexOf(" ")).trim());
      console.log(newBuild);
      json.version = `${major}.${minor}.${newBuild} ${versionDateString}`;
      await writeToJSON();
      break;
    default:
      console.log(
        "successfuly build but version was not modified:",
        json.version
      );
      break;
  }
} catch (e) {
  console.error(e);
}
