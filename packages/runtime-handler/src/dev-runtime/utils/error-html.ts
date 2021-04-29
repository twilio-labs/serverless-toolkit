import { html } from 'common-tags';
import { readFileSync } from 'fs';

let normalizeCss = '';
const normalizeCssPath = require.resolve('normalize.css');

export function wrapErrorInHtml<T extends Error>(
  err: T,
  filePath?: string
): string {
  if (!normalizeCss) {
    normalizeCss = readFileSync(normalizeCssPath, 'utf8');
  }

  return html`
    <html>
      <style>
        ${normalizeCss}/**/

        body {
          font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
          color: #565b73;
          font-weight: 300;
          line-height: 1.8;
          margin: 10px 30px;
        }

        h1 {
          color: #152748;
          font-weight: 500;
          font-size: 1.4em;
        }

        h2,
        strong {
          color: #152748;
          font-size: 1em;
          font-weight: 500;
        }

        .stack-trace {
          background: #233659;
          color: #fff;
          padding: 20px;
          border-radius: 5px;
        }
      </style>
      <h1>Runtime Error</h1>
      ${filePath ? `<p>Error thrown in <code>${filePath}</code></p>` : ''}
      <hr />
      <p>
        ${`<strong>${err.name}:</strong> ${err.message.replace(
          /\n/g,
          '<br/>'
        )}`}
      </p>
      <h2>Stack Trace</h2>
      ${`<pre class="stack-trace">${err.stack}</pre>`}
    </html>
  `;
}
