#!/usr/bin/env node
// utility script to bump version numbers in package.json and android/app/build.gradle - run without args for help.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get command line arguments
const args = process.argv.slice(2);

// Read package.json to get current version
const packageJsonPath = path.join(process.cwd(), 'package.json');
const androidBuildGradlePath = path.join(
  process.cwd(),
  'android',
  'app',
  'build.gradle',
);

let fileContent;
let currentVersion = null;

try {
  fileContent = fs.readFileSync(packageJsonPath, 'utf8');
  const versionMatch = fileContent.match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/);
  if (versionMatch) {
    currentVersion = versionMatch[1];
  }
} catch (error) {
  console.error(`Error reading package.json: ${error.message}`);
  process.exit(1);
}

// Show usage if no arguments provided
if (args.length === 0) {
  console.log(
    'Usage: bump-version.js [--patch | --minor | --major] [--update] [--commit]\n',
  );
  console.log('Arguments:');
  console.log('  --patch      Increment the patch version (last digit)');
  console.log(
    '  --minor      Increment the minor version (middle digit, reset patch to 0)',
  );
  console.log(
    '  --major      Increment the major version (first digit, reset minor and patch to 0)',
  );
  console.log(
    '  --update     Update the package.json and android/app/build.gradle files',
  );
  console.log(
    '  --commit     Update, commit, and push to git (implies --update)\n',
  );
  console.log('Examples:');
  console.log(
    '  bump-version.js --patch                    # Show new patch version',
  );
  console.log(
    '  bump-version.js --minor --update           # Update to new minor version',
  );
  console.log(
    '  bump-version.js --major --commit           # Bump major version and push\n',
  );
  if (currentVersion) {
    console.log(`Current version: ${currentVersion}`);
  }
  process.exit(0);
}

// Parse arguments
let bumpType = null;
let shouldUpdate = false;
let shouldCommit = false;

for (const arg of args) {
  if (['--patch', '--minor', '--major'].includes(arg)) {
    bumpType = arg.replace('--', '');
  } else if (arg === '--update') {
    shouldUpdate = true;
  } else if (arg === '--commit') {
    shouldCommit = true;
    shouldUpdate = true; // --commit implies --update
  }
}

// Validate that a bump type was provided
if (!bumpType) {
  console.error('Error: You must specify --patch, --minor, or --major');
  process.exit(1);
}

// Extract version using regex
const versionMatch = fileContent.match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/);

if (!versionMatch) {
  console.error(
    'Error: Could not find version in X.Y.Z format in package.json',
  );
  process.exit(1);
}

currentVersion = versionMatch[1];

// Parse current version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newMajor = major;
let newMinor = minor;
let newPatch = patch;

switch (bumpType) {
  case 'patch':
    newPatch++;
    break;
  case 'minor':
    newMinor++;
    newPatch = 0;
    break;
  case 'major':
    newMajor++;
    newMinor = 0;
    newPatch = 0;
    break;
}

const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
const newVersionCode = newMajor * 10000 + newMinor * 100 + newPatch;

// Print new version
console.log(newVersion);

// Update package.json and android/app/build.gradle if --update flag is provided
if (shouldUpdate) {
  const updatedPackageJson = fileContent.replace(
    `"version": "${currentVersion}"`,
    `"version": "${newVersion}"`,
  );

  try {
    fs.writeFileSync(packageJsonPath, updatedPackageJson);
  } catch (error) {
    console.error(`Error writing package.json: ${error.message}`);
    process.exit(1);
  }

  try {
    let androidGradleContent = fs.readFileSync(androidBuildGradlePath, 'utf8');
    androidGradleContent = androidGradleContent.replace(
      /versionCode\s+\d+/,
      `versionCode ${newVersionCode}`,
    );
    androidGradleContent = androidGradleContent.replace(
      /versionName\s+"[^"]+"/,
      `versionName "${newVersion}"`,
    );
    fs.writeFileSync(androidBuildGradlePath, androidGradleContent);
  } catch (error) {
    console.error(`Error writing android/app/build.gradle: ${error.message}`);
    process.exit(1);
  }

  // Commit and push if --commit flag is provided
  if (shouldCommit) {
    try {
      execSync('git add package.json android/app/build.gradle', {
        stdio: 'inherit',
      });
      execSync(
        `git commit -m "Bump version: ${currentVersion} → ${newVersion}"`,
        {
          stdio: 'inherit',
        },
      );
      execSync('git push', { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error during git operations: ${error.message}`);
      process.exit(1);
    }
  }
}
