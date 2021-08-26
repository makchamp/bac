const hostname = 'localhost';
const port = 3000;

const app = require('express')();
const httpServer = require('http').createServer(app);
const options = { 
	cors: {
		origin: `http://${hostname}:5500`,
		methods: ['GET', 'POST']
	  }
 };
const io = require('socket.io')(httpServer, options);

io.on('connect', socket => { 
	console.log('connection established');
 });

httpServer.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
