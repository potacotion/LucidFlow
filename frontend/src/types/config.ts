/**
 * 全局配置 (来自 config.global.json)
 */
export interface GlobalConfig {
  appName: string;
  multiUserMode: boolean;
  theme: any;
  language: any;
}

/**
 * 用户个人配置 (来自数据库)
 */
export interface UserConfig {
  theme?: any;
  language?: any;
}
