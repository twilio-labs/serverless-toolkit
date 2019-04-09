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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
exports.access = util_1.promisify(fs_1.default.access);
exports.readFile = util_1.promisify(fs_1.default.readFile);
exports.writeFile = util_1.promisify(fs_1.default.writeFile);
exports.readdir = util_1.promisify(fs_1.default.readdir);
exports.stat = util_1.promisify(fs_1.default.stat);
function fileExists(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.access(filePath, fs_1.default.constants.R_OK | fs_1.default.constants.W_OK);
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
exports.fileExists = fileExists;
function getDirContent(dir, ext) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawFiles = yield exports.readdir(dir);
        const unfilteredFiles = yield Promise.all(rawFiles.map((file) => __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.default.join(dir, file);
            const entry = yield exports.stat(filePath);
            if (!entry.isFile()) {
                return undefined;
            }
            if (ext && path_1.default.extname(file) !== ext) {
                return undefined;
            }
            return {
                name: file,
                path: filePath,
            };
        })));
        return unfilteredFiles.filter(entry => typeof entry !== 'undefined');
    });
}
exports.getDirContent = getDirContent;
module.exports = {
    fileExists,
    readFile: exports.readFile,
    writeFile: exports.writeFile,
    readdir: exports.readdir,
    getDirContent,
};
