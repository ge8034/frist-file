/**
 * 认证相关类型定义
 */

// 用户ID类型
export type UserId = string;

// 用户角色
export type UserRole = 'user' | 'admin' | 'moderator';

// 认证提供者
export type AuthProvider = 'email' | 'google' | 'github' | 'apple';

// 认证令牌
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// 用户实体
export interface User {
  id: UserId;
  email: string;
  username: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// 登录表单
export interface LoginForm {
  email: string;
  password: string;
}

// 注册表单
export interface RegisterForm {
  email: string;
  password: string;
  username: string;
}
