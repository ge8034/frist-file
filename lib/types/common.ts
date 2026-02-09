/**
 * 通用类型定义
 */

// 唯一ID类型
export type Id = string;

// 实体类型
export interface Entity {
  id: Id;
}

// 值对象接口
export interface ValueObject {
  equals(other: unknown): boolean;
}
