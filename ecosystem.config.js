module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
        {
            name: 'Eth 1h',
            script: './build/live/index.js',
            env: {
                NODE_ENV: 'development',
                ETH_HOURS: 1
            },
            env_production: {
                NODE_ENV: 'production',
                ETH_HOURS: 1
            }
        },
        {
            name: 'Eth 4h',
            script: './build/live/index.js',
            env: {
                NODE_ENV: 'development',
                ETH_HOURS: 4
            },
            env_production: {
                NODE_ENV: 'production',
                ETH_HOURS: 4
            }
        },
        {
            name: 'Eth 6h',
            script: './build/live/index.js',
            env: {
                NODE_ENV: 'development',
                ETH_HOURS: 6
            },
            env_production: {
                NODE_ENV: 'production',
                ETH_HOURS: 6
            }
        },
        {
            name: 'Eth 12h',
            script: './build/live/index.js',
            env: {
                NODE_ENV: 'development',
                ETH_HOURS: 12
            },
            env_production: {
                NODE_ENV: 'production',
                ETH_HOURS: 12
            }
        },
        {
            name: 'Eth 24h',
            script: './build/live/index.js',
            env: {
                NODE_ENV: 'development',
                ETH_HOURS: 24
            },
            env_production: {
                NODE_ENV: 'production',
                ETH_HOURS: 24
            }
        },
        {
            name: 'Web server',
            script: './build/live/server.js',
            env: {
                NODE_ENV: 'development'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
}
