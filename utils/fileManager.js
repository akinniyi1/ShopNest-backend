const fs = require('fs-extra');

async function readJson(filePath) {
  try {
    return await fs.readJson(filePath);
  } catch (err) {
    return [];
  }
}

async function writeJson(filePath, data) {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (err) {
    console.error('Failed to write JSON:', err);
    return false;
  }
}

module.exports = { readJson, writeJson };
