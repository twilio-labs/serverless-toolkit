import { ClientConfig } from '../../types';

export function getApiUrl(
  config: ClientConfig,
  product = 'serverless',
  apiVersion = 'v1'
): string {
  const configEdge = config.edge || process.env.TWILIO_EDGE;
  const configRegion = config.region || process.env.TWILIO_REGION;

  const edge = configEdge ? `${configEdge}.` : '';
  const region = configRegion ? `${configRegion}.` : '';
  return `https://${product}.${edge}${region}twilio.com/${apiVersion}`;
}
