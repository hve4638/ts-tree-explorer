export class TreeNavigateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TreeNavigateError';
  }
}