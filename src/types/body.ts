export enum BodyMessage {
  Unknown = 'Unknown error',
  Unauthorised = 'Protected resource, use Authorization header to access',
}

export interface Body {
  message: BodyMessage;
}

export interface BodyError extends Body {
  error: boolean;
}
