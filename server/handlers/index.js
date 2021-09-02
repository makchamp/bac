const registerRoomHandlers = require("./roomHandler");

module.exports = (io, socket) => {
	console.log("connection established");
	registerRoomHandlers(io, socket);


};