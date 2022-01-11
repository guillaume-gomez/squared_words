var path = require('path');
var merge = require('webpack-merge').merge;
var commonConfiguration = require('./webpack.common.js');
var portFinderSync = require('portfinder-sync');
var infoColor = function (_message) {
    return "\u001B[1m\u001B[34m" + _message + "\u001B[39m\u001B[22m";
};
module.exports = merge(commonConfiguration, {
    stats: 'errors-warnings',
    mode: 'development',
    devServer: {
        host: 'local-ip',
        port: portFinderSync.getPort(8080),
        open: true,
        https: false,
        allowedHosts: 'all',
        hot: false,
        watchFiles: ['src/**', 'static/**'],
        static: {
            watch: true,
            directory: path.join(__dirname, '../static')
        },
        client: {
            logging: 'none',
            overlay: true,
            progress: false
        },
        onAfterSetupMiddleware: function (devServer) {
            var port = devServer.options.port;
            var https = devServer.options.https ? 's' : '';
            var localIp = "192.168.1.126";
            var domain1 = "http" + https + "://" + localIp + ":" + port;
            var domain2 = "http" + https + "://localhost:" + port;
            console.log("Project running at:\n  - " + infoColor(domain1) + "\n  - " + infoColor(domain2));
        }
    }
});
//# sourceMappingURL=webpack.dev.js.map