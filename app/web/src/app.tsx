/// <reference types="vite-plugin-pages/client-solid" />

import { Router } from '@solidjs/router';
import routes from '~solid-pages';
import './index.css';
import { MetaProvider } from '@solidjs/meta';

export function App(props: { url?: string }) {
  return (
    <MetaProvider>
      <Router
        children={routes}
        url={props.url}
        root={props => (
          <div>
            hello
            {props.children}
          </div>
        )}
      />
    </MetaProvider>
  );
}
