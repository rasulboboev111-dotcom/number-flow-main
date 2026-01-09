module.exports = {
    apps: [
        {
            name: 'number-flow',
            script: 'server/index.ts',
            interpreter: 'node',
            interpreter_args: '--import tsx',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        },
    ],
};
