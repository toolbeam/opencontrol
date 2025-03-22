import { renderToString } from 'solid-js/web';
import { App } from './app';

export function render(props: { url: string }) {
  const app = renderToString(() => <App url={props.url} />);
  return { app };
}
