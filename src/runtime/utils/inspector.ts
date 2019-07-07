import inspector from 'inspector';

export function startInspector(val, wait = false) {
  let port = undefined;
  let host = undefined;

  if (typeof val === 'string') {
    if (val.includes(':')) {
      const [hostRaw, portRaw] = val.split(':');
      port = parseInt(portRaw, 10);
      host = hostRaw;
    } else if (val.length > 0) {
      port = parseInt(val, 10);
    }
  }

  inspector.open(port, host, wait);
  return inspector;
}
