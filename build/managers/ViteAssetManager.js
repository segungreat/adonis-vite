"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const vite_1 = require("vite");
async function fileExists(path) {
    try {
        await (0, promises_1.access)(path);
        return true;
    }
    catch (_e) {
        return false;
    }
}
class ViteAssetManager {
    constructor(app) {
        this.app = app;
    }
    /**
     * Generates HTML to include appropriate JS, CSS.
     * It uses the built files from manifest in production, links to vite dev server otherwise.
     * All built files which aren't entry points are preloaded using <link rel="prefetch">
     *
     * @param entrypoints Vite entry points, for ex. app.ts
     * @returns Raw HTML
     */
    async getMarkup(entrypoints) {
        await this.setup();
        const entrypointsList = [].concat(entrypoints);
        if (this.devServerUrl) {
            return ['@vite/client', ...entrypointsList]
                .map((entrypoint) => this.entryTag(`${this.devServerUrl}/${entrypoint}`))
                .join('\n');
        }
        let markup = entrypointsList
            .map((entrypoint) => this.prodEntrypointMarkup(entrypoint))
            .join('\n');
        markup += this.prefetchMarkup();
        return markup;
    }
    async setup() {
        if (!this.config) {
            await this.readViteConfig();
        }
        if (!this.manifest) {
            await this.readManifest();
        }
        if (!this.devServerUrl && (await this.isDevServerRunning())) {
            this.devServerUrl = await (0, promises_1.readFile)(this.app.publicPath('hot'), 'utf-8');
        }
    }
    isDevServerRunning() {
        return fileExists(this.app.publicPath('hot'));
    }
    async readViteConfig() {
        const command = this.app.env.get('NODE_ENV', 'development') === 'production' ? 'build' : 'serve';
        this.config = await (0, vite_1.resolveConfig)({}, command);
    }
    async getFastRefreshMarkup() {
        await this.setup();
        if (!this.devServerUrl) {
            return '';
        }
        return `<script type="module">
		import RefreshRuntime from '${this.devServerUrl}/@react-refresh'
		window.RefreshRuntime = RefreshRuntime
		RefreshRuntime.injectIntoGlobalHook(window)
		window.$RefreshReg$ = () => {}
		window.$RefreshSig$ = () => (type) => type
		window.__vite_plugin_react_preamble_installed__ = true
	</script>`;
    }
    prodEntrypointMarkup(entrypoint) {
        const fileName = '/' + this.manifest[entrypoint].file;
        if (fileName.endsWith('.css')) {
            return this.entryTag(fileName);
        }
        let markup = this.entryTag(fileName);
        this.manifest[entrypoint].css?.forEach((cssFileName) => {
            markup += this.entryTag('/' + cssFileName);
        });
        return markup;
    }
    prefetchMarkup() {
        const nonEntryKeys = Object.keys(this.manifest).filter((fileName) => !this.manifest[fileName].isEntry);
        return nonEntryKeys
            .map((fileKey) => this.prefetchTag('/' + this.manifest[fileKey].file))
            .join('\n');
    }
    async readManifest() {
        const manifestFileName = typeof this.config.build.manifest === 'string' ? this.config.build.manifest : 'manifest.json';
        if (!(await fileExists(this.app.publicPath(manifestFileName))))
            return;
        const manifestText = await (0, promises_1.readFile)(this.app.publicPath(manifestFileName), 'utf-8');
        this.manifest = JSON.parse(manifestText);
    }
    entryTag(path) {
        if (path.endsWith('.css')) {
            return `<link rel="stylesheet" href="${path}">`;
        }
        return `<script type="module" src="${path}"></script>`;
    }
    prefetchTag(path) {
        let as = 'image';
        if (path.endsWith('.js')) {
            as = 'script';
        }
        if (path.endsWith('.css')) {
            as = 'style';
        }
        return `<link rel="prefetch" href="${path}" as="${as}">`;
    }
}
exports.default = ViteAssetManager;
