module.exports = (io, socket, store) => {
  const { sessionID, session } = socket.request;
  const socketID = socket.id;

  const startGame = (payload) => {
    const {
      userName,
      roomName,
      gameSettings,
      categories } = payload;
    const numOfRounds = gameSettings.numOfRounds;
    const numOfCategories = gameSettings.numOfCategories;    
    store.client.hset(roomName, 'inGame', true);
    store.client.hset(roomName, 'gameSettings', JSON.stringify(gameSettings));
    store.client.hset(
      roomName,
      'categories',
      JSON.stringify(selectCategories(categories, numOfCategories, numOfRounds)));
  }

  const selectCategories = (
    categories,
    numOfCategories,
    numOfRounds
  ) => {
    const active = categories.defaultCategories.flatMap(
      category => category.isActive ? [category.label] : []);
    
    //TODO: randomize & add custom categories
    return active.slice(0, numOfCategories);
  }

  socket.on('game:start', startGame);
};