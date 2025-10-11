import { promises as fs } from 'fs';
import path from 'path';
import EnvVars from '@src/common/constants/EnvVars';
import { UserSettings } from '@prisma/client';
import * as UserRepo from '@src/repos/UserRepo';
import { Prisma } from '@prisma/client';
import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import UserService from './UserService';


// Paths to configuration files
const defaultConfigPath = path.join(__dirname, '../../config/config.default.json');
const globalConfigPath = path.join(__dirname, '../../config/config.global.json');

// **** Functions **** //

/**
 * Reads and parses a JSON file, returning an empty object if it doesn't exist.
 */
async function _readConfigFile(filePath: string): Promise<object> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty object.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

/**
 * Get the global configuration, merged from default, global, and environment variables.
 */
async function getGlobalConfig(): Promise<object> {
  // 1. Read default config
  const defaultConfig = await _readConfigFile(defaultConfigPath);

  // 2. Read global config and merge
  const globalConfig = await _readConfigFile(globalConfigPath);
  const mergedConfig: Record<string, any> = { ...defaultConfig, ...globalConfig };

  // 3. Override with environment variables
  for (const key in mergedConfig) {
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
        mergedConfig[key] = process.env[key];
    }
  }

  return mergedConfig;
}

/**
 * Get user-specific settings from the database.
 */
async function getUserSettings(userId: number): Promise<Prisma.JsonObject> {
  const user = await UserRepo.getOne(userId);
  return (user?.settings?.data as Prisma.JsonObject) ?? {};
}

/**
 * Get the full configuration for a user (global + user-specific).
 */
async function getFullConfig(userId: number): Promise<object> {
  const globalConf = await getGlobalConfig();
  const userSettings = await getUserSettings(userId);
  return { ...globalConf, ...userSettings };
}

/**
 * Update user-specific settings in the database.
 */
async function updateUserSettings(userId: number, newSettings: Prisma.JsonObject): Promise<void> {
    await UserRepo.updateSettings(userId, newSettings);
}

/**
 * Update the global configuration file.
 */
async function updateGlobalSettings(newSettings: object): Promise<void> {
    try {
        const currentGlobalConfig = await _readConfigFile(globalConfigPath);
        const updatedConfig = { ...currentGlobalConfig, ...newSettings };
        await fs.writeFile(globalConfigPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Failed to update global settings: ${error}`);
    }
}

/**
 * Initialize global settings, only if no users exist.
 */
async function initializeSettings(newSettings: object): Promise<void> {
    const usersExist = await UserService.hasUsers();
    if (usersExist) {
        throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Cannot initialize settings when users already exist.');
    }
    await updateGlobalSettings(newSettings);
}

/**
 * Checks if the application is in multi-user mode from the global config.
 */
async function isMultiUserMode(): Promise<boolean> {
    const config = await getGlobalConfig() as { multiUserMode?: boolean };
    // Default to true if not specified
    return config.multiUserMode !== false;
}

// **** Export default **** //

export default {
  getGlobalConfig,
  getUserSettings,
  getFullConfig,
  updateUserSettings,
  updateGlobalSettings,
  initializeSettings,
  isMultiUserMode,
} as const;