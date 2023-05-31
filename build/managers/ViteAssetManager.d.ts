/// <reference types="@adonisjs/application/build/adonis-typings" />
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
export default class ViteAssetManager {
    private app;
    private manifest;
    private config;
    private devServerUrl;
    constructor(app: ApplicationContract);
    /**
     * Generates HTML to include appropriate JS, CSS.
     * It uses the built files from manifest in production, links to vite dev server otherwise.
     * All built files which aren't entry points are preloaded using <link rel="prefetch">
     *
     * @param entrypoints Vite entry points, for ex. app.ts
     * @returns Raw HTML
     */
    getMarkup(entrypoints: string | string[]): Promise<string>;
    private setup;
    private isDevServerRunning;
    private readViteConfig;
    getFastRefreshMarkup(): Promise<string>;
    private prodEntrypointMarkup;
    private prefetchMarkup;
    private readManifest;
    private entryTag;
    private prefetchTag;
}
