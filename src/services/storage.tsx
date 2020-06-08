export default class Storage {
  getSalt = () => {};

  setItem = (key: string, value: any) => {
    window.localStorage.setItem(key, value);
  };

  getItem = (key: string) => {
    return window.localStorage.getItem(key);
  };

  theSalt: string = "SALTME!";

  get salt() {
    return this.theSalt;
  }

  set salt(_salt: string) {
    this.theSalt = _salt;
  }

  static defaultStorage = new Storage();

  static getStorage = () => {
    return Storage.defaultStorage;
  };
}
