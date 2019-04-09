export interface ResourceBase {
    sid: string;
}
export interface FunctionApiResource extends ResourceBase {
    friendly_name: string;
}
export interface FunctionList {
    functions: FunctionApiResource[];
}
export interface ServiceResource extends ResourceBase {
}
export interface EnvironmentResource extends ResourceBase {
    unique_name: string;
    domain_name: string;
}
export interface EnvironmentList {
    environments: EnvironmentResource[];
}
export interface VersionResource extends ResourceBase {
    pre_signed_upload_url: {
        url: string;
        kmsARN: string;
    };
}
export declare type BuildStatus = 'QUEUED' | 'BUILDING' | 'DEPLOYING' | 'DEPLOYED' | 'VERIFIED' | 'FAILED';
export interface BuildResource extends ResourceBase {
    status: BuildStatus;
}
