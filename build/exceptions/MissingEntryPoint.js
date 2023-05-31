"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@poppinss/utils");
class MissingEntryPointException extends utils_1.Exception {
    constructor() {
        super('You must specify one or more entry points for vite', 500, 'E_MISSING_VITE_ENTRYPOINT');
    }
}
exports.default = MissingEntryPointException;
