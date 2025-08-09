export interface ApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  data: T;
}

export interface CountResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  data: number;
}
