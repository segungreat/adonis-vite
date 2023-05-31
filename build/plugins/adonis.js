"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function adonisPlugin({ input }) {
    let resolvedConfig;
    let devServerUrl;
    return {
        name: 'adonis-vite',
        configResolved(config) {
            resolvedConfig = config;
        },
        config(userConfig) {
            return {
                publicDir: false,
                ...userConfig,
                build: {
                    manifest: true,
                    emptyOutDir: false,
                    outDir: 'public',
                    rollupOptions: {
                        input: userConfig.build?.rollupOptions?.input ?? input,
                    },
                    ...userConfig.build,
                },
                server: {
                    origin: '__adonis_vite_placeholder__',
                    host: 'localhost',
                    ...userConfig.server,
                },
            };
        },
        transform(code) {
            if (resolvedConfig.command === 'serve') {
                return code.replace(/__adonis_vite_placeholder__/g, devServerUrl);
            }
        },
        configureServer(server) {
            const hotFile = path_1.default.join('public', 'hot');
            server.httpServer?.once('listening', () => {
                const address = server.httpServer?.address();
                const isAddressInfo = (x) => typeof x === 'object';
                if (isAddressInfo(address)) {
                    devServerUrl = resolveDevServerUrl(address, resolvedConfig);
                    fs_1.default.writeFileSync(hotFile, devServerUrl);
                }
            });
            const clean = () => {
                if (fs_1.default.existsSync(hotFile)) {
                    fs_1.default.rmSync(hotFile);
                }
            };
            process.on('exit', clean);
            process.on('SIGINT', process.exit);
            process.on('SIGTERM', process.exit);
            process.on('SIGHUP', process.exit);
        },
    };
}
exports.default = adonisPlugin;
/**
 * Resolve the dev server URL from the server address and configuration.
 */
function resolveDevServerUrl(address, config) {
    const configHmrProtocol = typeof config.server.hmr === 'object' ? config.server.hmr.protocol : null;
    const clientProtocol = configHmrProtocol ? (configHmrProtocol === 'wss' ? 'https' : 'http') : null;
    const serverProtocol = config.server.https ? 'https' : 'http';
    const protocol = clientProtocol ?? serverProtocol;
    const configHmrHost = typeof config.server.hmr === 'object' ? config.server.hmr.host : null;
    const configHost = typeof config.server.host === 'string' ? config.server.host : null;
    const serverAddress = address.family === 'IPv6' ? `[${address.address}]` : address.address;
    const host = configHmrHost ?? configHost ?? serverAddress;
    return `${protocol}://${host}:${address.port}`;
}
