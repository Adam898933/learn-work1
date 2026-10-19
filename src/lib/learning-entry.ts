/** A fresh visit shows the educational cover; only an explicit reload opens the app. */
export function canAccessLearningHub(navigationType: string | undefined): boolean {
  return navigationType === "reload";
}