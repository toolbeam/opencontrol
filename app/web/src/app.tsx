/// <reference types="vite-plugin-pages/client-solid" />

import { Router } from '@solidjs/router';
import routes from '~solid-pages';
import './index.css';

export function App() {
  return (
    <Router
      children={routes}
      root={props => (
        <div>
          hello
          {props.children}
        </div>
      )}
    />
  );
}
