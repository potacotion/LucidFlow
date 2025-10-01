import { promises as fs } from 'fs';
import path from 'path';

// Paths to configuration files
const defaultConfigPath = path.join(__dirname, '../config/config.default.json');
const globalConfigPath = path.join(__dirname, '../config/config.global.json');


// Default configuration content
const defaultConfigContent = {
  "appName": "LucidFlow",
  "port": 3000,
  "jwt": {
    "secret": "your-default-secret",
    "expiresIn": "1d"
  }
};


async function initializeConfig() {
  try {
    // 1. Ensure default config exists
    await fs.access(defaultConfigPath);
    console.log('Default config already exists.');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('Creating default config file...');
      await fs.writeFile(defaultConfigPath, JSON.stringify(defaultConfigContent, null, 2), 'utf-8');
      console.log('Default config file created successfully.');
    } else {
      throw error;
    }
  }

  try {
    // 2. Ensure global config exists
    await fs.access(globalConfigPath);
    console.log('Global config already exists.');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('Creating empty global config file...');
      await fs.writeFile(globalConfigPath, JSON.stringify({}, null, 2), 'utf-8');
      console.log('Global config file created successfully.');
    } else {
      throw error;
    }
  }
}

initializeConfig().catch(error => {
  console.error('Failed to initialize configuration:', error);
  process.exit(1);
});