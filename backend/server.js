/* const fs = require('fs');
const path = require('path'); */
const http/* s */ = require('http');
const app = require('./app');

const normalizePort = val => {
    const port = parseInt(val, 10);

    if(isNaN(port)){
        return val;
    }
    if(port >= 0){
        return port;
    }
    return false;
};

const port = normalizePort(process.env.PORT || 3000);
app.set('port',port);

const errorHandler = error => {
    if(error.syscall !== 'listen'){
        throw error;
    }

    const address = server.address();
    const bind = typeof address === 'string'? 'pipe' + address : 'port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' access denied');
            process.exit(1);
            break;
        case 'EADDRINUSE' :
            console.error(bind + ' already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
};


/* On récupère notre clé privée et notre certificat (ici ils se trouvent dans le dossier certificate) */
/* const key = fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'));
const cert = fs.readFileSync(path.join(__dirname, 'ssl', 'server.cert'));
 
const options = { key, cert };
  */
const server = http/* s */.createServer(/* options, */app);

server.on('error',errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ?'pipe ' + address : 'port ' + port;
    console.log('listening on ' + bind);
});

server.listen(port);