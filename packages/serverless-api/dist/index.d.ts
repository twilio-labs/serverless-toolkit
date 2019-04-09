/// <reference types="node" />
import events from 'events';
import { PackageJson } from 'type-fest';
import { FileInfo } from './fs';
declare type Config = {
    cwd: string;
    envPath: string;
    accountSid: string;
    authToken: string;
    env: {
        [key: string]: string | number | undefined;
    };
    serviceSid?: string;
    pkgJson: PackageJson;
    projectName: string;
    functionsEnv: string;
};
interface RawFunctionWithPath extends FileInfo {
    functionPath: string;
}
interface FunctionResource extends RawFunctionWithPath {
    sid: string;
}
export declare const DeployStatus: {
    CREATING_SERVICE: string;
    CONFIGURING_ENVIRONMENT: string;
    READING_FILESYSTEM: string;
    CREATING_FUNCTIONS: string;
    UPLOADING_FUNCTIONS: string;
    BUILDING: string;
    TIMED_OUT: string;
    ACTIVATING_DEPLOYMENT: string;
    DONE: string;
};
export declare class TwilioServerlessApiClient extends events.EventEmitter {
    private config;
    constructor(config: Config);
    deployLocalProject(): Promise<{
        serviceSid: string;
        environmentSid: string;
        buildSid: any;
        domain: string;
        functionResources: FunctionResource[];
    }>;
}
export default TwilioServerlessApiClient;
