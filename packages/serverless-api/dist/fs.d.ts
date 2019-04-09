/// <reference types="node" />
import fs from 'fs';
export declare const access: typeof fs.access.__promisify__;
export declare const readFile: typeof fs.readFile.__promisify__;
export declare const writeFile: typeof fs.writeFile.__promisify__;
export declare const readdir: typeof fs.readdir.__promisify__;
export declare const stat: typeof fs.stat.__promisify__;
export declare function fileExists(filePath: string): Promise<boolean>;
export interface FileInfo {
    name: string;
    path: string;
}
export declare function getDirContent(dir: string, ext?: string): Promise<FileInfo[]>;
