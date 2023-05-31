/// <reference types="@adonisjs/application/build/adonis-typings" />
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
export default class ViteProvider {
    protected app: ApplicationContract;
    static needsApplication: boolean;
    constructor(app: ApplicationContract);
    register(): void;
    boot(): Promise<void>;
}
