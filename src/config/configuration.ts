export default () => ({
    odin: {
        email: String(process.env.ODIN_EMAIL) || '',
        password: String(process.env.ODIN_PASSWORD) || ''
    },
    port: process.env.PORT || 5000,
    logLevel: String(process.env.LOG_LEVEL) || 'debug',
    nodeEnv: String(process.env.NODE_ENV) || 'development',
    apiProxyKey: String(process.env.API_PROXY_KEY)
});
