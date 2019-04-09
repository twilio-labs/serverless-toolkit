"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const events_1 = __importDefault(require("events"));
const got_1 = __importDefault(require("got"));
const path_1 = __importDefault(require("path"));
const querystring_1 = __importDefault(require("querystring"));
const fs_1 = require("./fs");
const log = debug_1.default('twilio-labs/serverless-api');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function getClient(config) {
    // @ts-ignore
    const client = got_1.default.extend({
        baseUrl: 'https://serverless.twilio.com/v1',
        json: true,
        auth: `${config.accountSid}:${config.authToken}`,
        headers: {
            'User-Agent': 'twilio-run',
        },
    });
    return client;
}
function createService({ projectName }, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resp = yield client.post('/Services', {
                form: true,
                body: {
                    UniqueName: projectName,
                    FriendlyName: projectName,
                    IncludeCrendentials: true,
                },
            });
            const service = resp.body;
            return service.sid;
        }
        catch (err) {
            throw new Error(`Failed to create service with name ${projectName}`);
        }
    });
}
function getOrCreateEnvironment(envSuffix, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueName = envSuffix + '-environment';
        try {
            const resp = yield client.post(`/Services/${serviceSid}/Environments`, {
                form: true,
                body: {
                    UniqueName: uniqueName,
                    DomainSuffix: envSuffix,
                },
            });
            return resp.body;
        }
        catch (err) {
            const resp = yield client.get(`/Services/${serviceSid}/Environments`);
            const content = resp.body;
            const env = content.environments.find(e => e.unique_name === uniqueName);
            if (!env) {
                throw new Error('Failed to create environment');
            }
            return env;
        }
    });
}
function getListOfFunctionsAndAssets(cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionsDir = path_1.default.join(cwd, 'functions');
        const assetsDir = path_1.default.join(cwd, 'assets');
        const functions = yield fs_1.getDirContent(functionsDir, '.js');
        const assets = yield fs_1.getDirContent(assetsDir);
        return { functions, assets };
    });
}
function createFunctionResource(name, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resp = yield client.post(`/Services/${serviceSid}/Functions`, {
                form: true,
                body: {
                    FriendlyName: name,
                },
            });
            return resp.body;
        }
        catch (err) {
            throw new Error(`Failed to create "${name}" function`);
        }
    });
}
function getFunctionResources(serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield client.get(`/Services/${serviceSid}/Functions`);
        const content = resp.body;
        return content.functions;
    });
}
function getOrCreateFunctionResources(functions, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const output = [];
        const existingFunctions = yield getFunctionResources(serviceSid, client);
        const functionsToCreate = [];
        functions.forEach(fn => {
            const functionPath = `/${path_1.default
                .basename(fn.name, '.js')
                .replace(/\s/g, '-')}`;
            const existingFn = existingFunctions.find(f => fn.name === f.friendly_name);
            if (!existingFn) {
                functionsToCreate.push(Object.assign({}, fn, { functionPath }));
            }
            else {
                output.push(Object.assign({}, fn, { functionPath, sid: existingFn.sid }));
            }
        });
        const createdFunctions = yield Promise.all(functionsToCreate.map((fn) => __awaiter(this, void 0, void 0, function* () {
            const newFunction = yield createFunctionResource(fn.name, serviceSid, client);
            return Object.assign({}, fn, { sid: newFunction.sid });
        })));
        return [...output, ...createdFunctions];
    });
}
function createVersion(fn, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const resp = yield client.post(`/Services/${serviceSid}/Functions/${fn.sid}/Versions`, {
                form: true,
                body: {
                    Path: fn.functionPath,
                    Visibility: 'public',
                },
            });
            return resp.body;
        }
        catch (err) {
            log(err);
            throw new Error('Failed to upload Function');
        }
    });
}
function uploadToAws(url, key, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield got_1.default.put(url, {
            headers: {
                'x-amz-server-side-encryption': 'aws:kms',
                'x-amz-server-side-encryption-aws-kms-key-id': key,
            },
            body: content,
        });
        return resp.body;
    });
}
function uploadFunction(fn, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield fs_1.readFile(fn.path, 'utf8');
        const version = yield createVersion(fn, serviceSid, client);
        const { pre_signed_upload_url: awsData } = version;
        const awsResult = yield uploadToAws(awsData.url, awsData.kmsARN, content);
        return version.sid;
    });
}
function getBuildStatus(buildSid, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield client.get(`/Services/${serviceSid}/Builds/${buildSid}`);
        return resp.body;
    });
}
function getDependencies(pkgJson) {
    const dependencies = pkgJson.dependencies;
    if (!dependencies) {
        return [];
    }
    return Object.keys(dependencies).map(name => {
        const version = dependencies[name];
        if (!dependencies[name]) {
            return {
                name,
                version: '*',
            };
        }
        return {
            name,
            version: dependencies[name],
        };
    });
}
function triggerBuild(functionVersionSids, dependencies, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dependencyString = `"${JSON.stringify(dependencies)}"`;
            const resp = yield client.post(`/Services/${serviceSid}/Builds`, {
                // @ts-ignore
                json: false,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: querystring_1.default.stringify({
                    FunctionVersions: functionVersionSids,
                    Dependencies: dependencyString,
                }),
            });
            return JSON.parse(resp.body);
        }
        catch (err) {
            console.error(err);
        }
    });
}
function waitForSuccessfulBuild(buildSid, serviceSid, client, eventEmitter) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        let isBuilt = false;
        while (!isBuilt) {
            if (Date.now() - startTime > 120000) {
                if (eventEmitter) {
                    eventEmitter.emit('status-update', {
                        status: exports.DeployStatus.TIMED_OUT,
                        message: 'Deployment took too long',
                    });
                }
                reject(new Error('Timeout'));
            }
            const { status } = yield getBuildStatus(buildSid, serviceSid, client);
            isBuilt = status === 'VERIFIED';
            if (isBuilt) {
                break;
            }
            if (eventEmitter) {
                eventEmitter.emit('status-update', {
                    status: exports.DeployStatus.BUILDING,
                    message: `Waiting for deployment. Current status: ${status}`,
                });
            }
            yield sleep(1000);
        }
        resolve();
    }));
}
function activateDeployment(buildSid, environmentSid, serviceSid, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield client.post(`/Services/${serviceSid}/Environments/${environmentSid}/Deployments`, {
            form: true,
            body: {
                BuildSid: buildSid,
            },
        });
        return resp.body;
    });
}
exports.DeployStatus = {
    CREATING_SERVICE: 'creating-service',
    CONFIGURING_ENVIRONMENT: 'configuring-environment',
    READING_FILESYSTEM: 'reading-filesystem',
    CREATING_FUNCTIONS: 'creating-functions',
    UPLOADING_FUNCTIONS: 'uploading-functions',
    BUILDING: 'building',
    TIMED_OUT: 'timed-out',
    ACTIVATING_DEPLOYMENT: 'activating-deployment',
    DONE: 'done',
};
class TwilioServerlessApiClient extends events_1.default.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.deployLocalProject = this.deployLocalProject.bind(this);
    }
    deployLocalProject() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = getClient(this.config);
            let serviceSid = this.config.serviceSid;
            if (!serviceSid) {
                this.emit('status-update', {
                    status: exports.DeployStatus.CREATING_SERVICE,
                    message: 'Creating Service',
                });
                serviceSid = yield createService(this.config, client);
            }
            this.emit('status-update', {
                status: exports.DeployStatus.CONFIGURING_ENVIRONMENT,
                message: `Configuring "${this.config.functionsEnv}" environment`,
            });
            const environment = yield getOrCreateEnvironment(this.config.functionsEnv, serviceSid, client);
            const { sid: environmentSid, domain_name: domain } = environment;
            this.emit('status-update', {
                status: exports.DeployStatus.READING_FILESYSTEM,
                message: 'Gathering Functions and Assets to deploy',
            });
            const { functions, assets } = yield getListOfFunctionsAndAssets(this.config.cwd);
            this.emit('status-update', {
                status: exports.DeployStatus.CREATING_FUNCTIONS,
                message: `Creating ${functions.length} Functions`,
            });
            const functionResources = yield getOrCreateFunctionResources(functions, serviceSid, client);
            this.emit('status-update', {
                status: exports.DeployStatus.UPLOADING_FUNCTIONS,
                message: `Uploading ${functions.length} Functions`,
            });
            const versions = yield Promise.all(functionResources.map(fn => {
                return uploadFunction(fn, serviceSid, client);
            }));
            this.emit('status-update', {
                status: exports.DeployStatus.BUILDING,
                message: 'Waiting for deployment.',
            });
            const dependencies = getDependencies(this.config.pkgJson);
            const build = yield triggerBuild(versions, dependencies, serviceSid, client);
            yield waitForSuccessfulBuild(build.sid, serviceSid, client, this);
            this.emit('status-update', {
                status: exports.DeployStatus.ACTIVATING_DEPLOYMENT,
                message: 'Activating deployment',
            });
            yield activateDeployment(build.sid, environmentSid, serviceSid, client);
            this.emit('status', {
                status: exports.DeployStatus.DONE,
                message: 'Project successfully deployed',
            });
            return {
                serviceSid,
                environmentSid,
                buildSid: build.sid,
                domain,
                functionResources,
            };
        });
    }
}
exports.TwilioServerlessApiClient = TwilioServerlessApiClient;
exports.default = TwilioServerlessApiClient;
