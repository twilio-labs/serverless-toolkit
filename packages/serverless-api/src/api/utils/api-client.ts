import { ClientConfig } from '../../types';

const regionEdgeMap: { [index: string]: string } = {
  us1: 'ashburn',
  au1: 'sydney',
  ie1: 'dublin',
  'stage-us1': 'ashburn',
  'stage-au1': 'sydney',
};

export function getApiUrl(
  config: ClientConfig,
  product = 'serverless',
  apiVersion = 'v1'
): string {
  const configEdge = config.edge || process.env.TWILIO_EDGE;
  const configRegion = config.region || process.env.TWILIO_REGION;
  const region = configRegion ? `${configRegion}.` : '';

  if (!configEdge && configRegion) {
    const defaultEdge = regionEdgeMap[configRegion]
      ? `${regionEdgeMap[configRegion]}.`
      : '';
    return `https://${product}.${defaultEdge}${region}twilio.com/${apiVersion}`;
  }

  const edge = configEdge ? `${configEdge}.` : '';
  return `https://${product}.${edge}${region}twilio.com/${apiVersion}`;
}
