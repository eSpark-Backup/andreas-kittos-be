module.exports = {
    apps: [
      {
        name: 'andreaskittos',
        script: 'node',
        args: 'dist/src/main',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production'
        }
      }
    ]
  };