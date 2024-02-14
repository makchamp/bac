export class User {
  constructor(user) {
    this.userID = user.userID ? user.userID : '';
    this.socketID = user.socketID;
    this.roomName = user.roomName ? user.roomName : '';
    this.userName = user.userName ? user.userName : '';
    this.isHost = user.isHost;
  }
}
