type AuthFailureHandler = () => void;

const handlers = new Set<AuthFailureHandler>();

export function onAuthFailure(handler: AuthFailureHandler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function emitAuthFailure(): void {
  handlers.forEach((handler) => handler());
}
 