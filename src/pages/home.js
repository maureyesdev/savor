/** @returns {{ title: string, view: string, behavior(root: HTMLElement): void | (()=>void) }} */
export function HomePage() {
  return {
    title: 'Home',
    view: `<p>Welcome to the Home Page</p>`,
    behavior: [],
  };
}
