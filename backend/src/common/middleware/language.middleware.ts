
import { Request, Response, NextFunction } from 'express';
import acceptLanguage from 'accept-language';

// 定义支持的语言列表
const SUPPORTED_LANGUAGES = ['en', 'zh-CN'];
acceptLanguage.languages(SUPPORTED_LANGUAGES);

// 扩展 Express 的 Request 类型
declare global {
  namespace Express {
    interface Request {
      language: string;
    }
  }
}

/**
 * 中间件：从 'Accept-Language' 请求头中解析语言。
 * 将解析出的语言代码附加到 `req.language`。
 * 如果没有匹配的语言，则默认为 'en'。
 * 
 * @param req - Express 请求对象。
 * @param res - Express 响应对象。
 * @param next - Express next 函数。
 */
export const languageMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const langHeader = req.headers['accept-language'];
  
  // 使用 accept-language 库解析语言
  const language = acceptLanguage.get(langHeader) || 'en';
  
  // 将解析出的语言附加到请求对象上
  req.language = language;
  
  next();
};
