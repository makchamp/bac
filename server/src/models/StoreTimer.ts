import { Server } from 'socket.io';

// A timer class that uses the store (ie: redis)
export class StoreTimer {
  store: any;
  intervalIdKey: string;
  timeoutTimeKey: string;
  intervalTimeoutHandler: (key: string) => void; // function to call after interval times out
  socketServer?: Server;
  emitInterval?: string; // Optionally emit the interval times to this socket event

  constructor(
    store: any,
    intervalIdKey: string,
    timeoutTimeKey: string,
    socketServer?: Server,
    emitInterval?: string
  ) {
    this.store = store;
    this.intervalIdKey = intervalIdKey;
    this.timeoutTimeKey = timeoutTimeKey;
    this.socketServer = socketServer;
    this.emitInterval = emitInterval;
  }

  setIntervalTimer(
    key: string,
    timeoutTime: number,
    timeoutHandler: (key: string) => void
  ) {
    this.intervalTimeoutHandler = timeoutHandler;
    this.store.client.hset(key, this.timeoutTimeKey, timeoutTime);
    const interval = setInterval(this.intervalHandler, 1000, key, this);
    this.setIntervalTimerId(key, interval);
  }

  setIntervalTimerId(key: string, timeout: any) {
    this.clearIntervalTimer(key);
    this.store.client.hset(
      key,
      this.intervalIdKey,
      timeout[Symbol.toPrimitive]()
    );
  }

  clearIntervalTimer = (key: string) => {
    this.store.client.hget(
      key,
      this.intervalIdKey,
      (error: any, intervalId: any) => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    );
  };

  intervalHandler(key: string, timer: StoreTimer) {
    timer.store.client.hget(
      key,
      timer.timeoutTimeKey,
      (error: any, time: string) => {
        let counter = parseInt(time);
        if (timer.emitInterval && timer.socketServer) {
          timer.socketServer.emit(timer.emitInterval, counter);
        }
        timer.store.client.hset(key, timer.timeoutTimeKey, --counter);
        if (counter < 0) {
          timer.clearIntervalTimer(key);
          timer.intervalTimeoutHandler(key);
        }
      }
    );
  }
}
