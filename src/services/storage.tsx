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

  set currentWalletName(walletName: string) {
    this.setItem("currentWalletName", walletName);
  }

  get currentWalletName() {
    return this.getItem("currentWalletName") || "";
  }

  getWallets = () => {
    const walletsJSON = this.getItem("wallets");
    if (!walletsJSON) {
      return [];
    }
    const wallets = JSON.parse(walletsJSON);
    return wallets;
  };

  getWalletByName = (walletName: string) => {
    const wallets = this.getWallets();
    return wallets.find((w: any) => w.name === walletName);
  };

  addWallet = (walletName: string, wallet: any) => {
    const wallets = this.getWallets();
    const index = wallets.findIndex((w: any) => w.name === walletName);
    if (index === -1) {
      wallets.push({
        name: walletName,
        ...wallet,
      });
    } else {
      wallets[index] = {
        name: walletName,
        ...wallet,
      };
    }
    this.setItem("wallets", JSON.stringify(wallets));
    return wallets;
  };

  removeWallet = (walletName: string) => {
    let wallets = this.getWallets();
    const index = wallets.findIndex((wallet: any) => wallet.name === walletName);
    if (index === -1) {
      return wallets;
    }
    wallets = wallets.splice(index, 1);
    this.setItem("wallets", JSON.stringify(wallets));
    return wallets;
  };

  static defaultStorage = new Storage();

  static getStorage = () => {
    return Storage.defaultStorage;
  };
}