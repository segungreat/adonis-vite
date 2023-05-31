"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MissingEntryPoint_1 = __importDefault(require("../exceptions/MissingEntryPoint"));
const ViteAssetManager_1 = __importDefault(require("../managers/ViteAssetManager"));
class ViteProvider {
    constructor(app) {
        this.app = app;
    }
    register() {
        // Register your own bindings
        this.app.container.singleton('AdonisJS/Vite', () => new ViteAssetManager_1.default(this.app));
    }
    async boot() {
        // IoC container is ready
        const View = this.app.container.resolveBinding('Adonis/Core/View');
        const assetManager = this.app.container.resolveBinding('AdonisJS/Vite');
        View.global('viteAssetsManager', assetManager);
        View.registerTag({
            tagName: 'vite',
            seekable: true,
            block: false,
            compile(parser, buffer, token) {
                if (!token.properties.jsArg.trim()) {
                    throw new MissingEntryPoint_1.default();
                }
                const parsed = parser.utils.transformAst(parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename), token.filename, parser);
                const entrypointName = parser.utils.stringify(parsed);
                buffer.outputExpression(`await state.viteAssetsManager.getMarkup(${entrypointName})`, token.filename, token.loc.start.line, false);
            },
        });
        View.registerTag({
            tagName: 'viteReactRefresh',
            seekable: true,
            block: false,
            compile(_parser, buffer, token) {
                buffer.outputExpression(`await state.viteAssetsManager.getFastRefreshMarkup()`, token.filename, token.loc.start.line, false);
            },
        });
    }
}
exports.default = ViteProvider;
ViteProvider.needsApplication = true;
