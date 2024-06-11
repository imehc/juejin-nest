export interface JwtUserData {
  userId: number;
  username: string;
  roles: string[];
  permissions: Permission[];
}

declare global {
  interface Request {
    user: JwtUserData;
    path: string;
    ip: string;
  }
  interface Response {
    statusCode: number;
  }
  interface Headers {
    authorization?: string;
  }
}

/** 返回统一的返回格式 */
export interface UnifiledResponse<T> {
  code: number;
  message: 'success' | 'fail';
  data: T;
}
