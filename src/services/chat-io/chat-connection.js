module.exports = function chat(io) {
  users = [];
  connections = [];
  io.on('connection', (socket) => {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);


    socket.on('disconnect', () => {
      users.splice(users.indexOf(socket.username), 1);
      updateUsernames();
      connections.splice(connections.indexOf(socket), 1);

      console.log('Disconnected: %s sockets connected', connections.length);
    });

    socket.on('send message', (data) => {
      console.log(data);
      io.sockets.emit('new message', { msg: data, user: socket.username });
    });

    socket.on('new user', (data, callback) => {
      callback(true);
      socket.username = data;
      users.push(socket.username);
      updateUsernames();
    });

    updateUsernames = () => {
      io.sockets.emit('get users', users);
    }
  });
};
