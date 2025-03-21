import { renderToString } from 'solid-js/web';
import { App } from './app';

export function render() {
  const app = renderToString(App);
  return { app };
}
