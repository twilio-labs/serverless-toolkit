import { stripIndent } from 'common-tags';
import { errorMessage } from '../printers/utils';

const EXAMPLE_SERVICE_SID = 'ZSf9dec7e059e0695f4c8axxxxxxxxxxxx';

export default function checkForValidServiceSid(
  serviceSid?: string
): string | never {
  if (
    typeof serviceSid === 'string' &&
    serviceSid.startsWith('ZS') &&
    serviceSid.length === 34
  ) {
    return serviceSid;
  }

  let message = '';
  let title = '';
  if (typeof serviceSid === 'undefined') {
    title = 'Could not find Service SID';
    message = stripIndent`
      We could not find a Twilio Serverless Service SID to perform this action.

      You can either pass the Service SID via the "--service-sid" flag or by storing it in a ".twilio-functions" file inside your project like this:

        {
          "serviceSid": "${EXAMPLE_SERVICE_SID}"
        }
    `;
  } else if (
    typeof serviceSid !== 'string' ||
    !serviceSid.startsWith('ZS') ||
    serviceSid.length !== 34
  ) {
    title = 'Invalid Service SID Format';
    message = stripIndent`
      The passed Twilio Serverless Service SID is not valid. 

      A valid Twilio Serverless Service SID has the format: ${EXAMPLE_SERVICE_SID}

      Make sure it has the right format inside your ".twilio-functions" file or that you are passing properly using the "--service-sid" flag.
    `;
  }

  if (message) {
    console.error(errorMessage(title, message));
    process.exit(1);
  }

  throw Error('Unreachable Error');
}
