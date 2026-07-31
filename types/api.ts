export type ActionResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

export type ApiMessageResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};
