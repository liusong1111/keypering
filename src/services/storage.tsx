import { IDBPDatabase, openDB } from "idb";

interface Current {
  id?: number;
  currentWalletName: string;
  currentRequest: any;
}

interface Wallet {
  name: string;
  ks: any;
}

export default class Storage {
  constructor() {
    this.db = null;
    this.ready = new Promise((resolve) => {
      this.readyFn = resolve;
    });
    this.init();
  }

  db: IDBPDatabase | null = null;

  ready: any = null;

  readyFn: any = null;

  init = async () => {
    this.db = await openDB("keypering", 1, {
      async upgrade(db, oldVersion, newVersion, tx) {
        db.createObjectStore("wallets", {
          keyPath: "name",
        });
        db.createObjectStore("authorizations", {
          keyPath: "token",
        });
        db.createObjectStore("current", {
          keyPath: "id",
        });
      },
    });
    this.readyFn(true);
  };

  async getCurrent(): Promise<Current> {
    const current = await this.db?.transaction("current").store.get(1);
    if (!current) {
      return {
        currentWalletName: "",
        currentRequest: null,
      };
    }
    return current as Current;
  }

  async setCurrent(current: Current): Promise<void> {
    const tx = this.db!.transaction("current", "readwrite");
    const { store } = tx;

    if (!current.id) {
      current.id = 1;
      await store.add(current);
    } else {
      await store.put(current);
    }
    await tx.done;
  }

  getSalt = () => {};

  theSalt: string = "SALTME!";

  get salt() {
    return this.theSalt;
  }

  set salt(_salt: string) {
    this.theSalt = _salt;
  }

  async setCurrentWalletName(walletName: string): Promise<void> {
    const current = await this.getCurrent();
    current.currentWalletName = walletName;
    await this.setCurrent(current);
  }

  async getCurrentWalletName(): Promise<string> {
    const current = await this.getCurrent();
    return current.currentWalletName;
  }

  async getCurrentWallet(): Promise<Wallet | null> {
    const currentWalletName = await this.getCurrentWalletName();
    const wallet = await this.getWalletByName(currentWalletName);
    return wallet;
  }

  async getWallets(): Promise<Wallet[]> {
    const wallets = await this.db!.getAll("wallets");
    return wallets as Wallet[];
  }

  async getWalletByName(walletName: string): Promise<Wallet | null> {
    const wallet = await this.db!.get("wallets", walletName);
    return wallet as Wallet | null;
  }

  addWallet = async (walletName: string, wallet: any) => {
    const existingWallet = this.getWalletByName(walletName);
    wallet.name = walletName;
    const tx = this.db!.transaction("wallets", "readwrite");
    const { store } = tx;
    if (!existingWallet) {
      await store.add(wallet);
    } else {
      await store.put(wallet);
    }
    await tx.done;
  };

  removeWallet = async (walletName: string) => {
    await this.db!.delete("wallets", walletName);
    const wallets = await this.getWallets();
    if (wallets.length > 0) {
      await this.setCurrentWalletName(wallets[0].name);
    } else {
      await this.setCurrentWalletName("");
    }
  };

  async setCurrentRequest(request: any) {
    const current = await this.getCurrent();
    current.currentRequest = request;
    await this.setCurrent(current);
  }

  async getCurrentRequest(): Promise<any> {
    const current = await this.getCurrent();
    return current.currentRequest;
  }

  async listAuthorization(): Promise<any[]> {
    const result = await this.db!.getAll("authorizations");
    return result;
  }

  async getAuthorization(token: string): Promise<any> {
    const result = await this.db!.get("authorizations", token);
    return result;
  }

  async removeAuthorization(token: string): Promise<void> {
    await this.db!.delete("authorizations", token);
  }

  async addAuthorization(auth: any): Promise<void> {
    await this.db!.add("authorizations", auth);
  }

  static defaultStorage = new Storage();

  static getStorage = () => {
    return Storage.defaultStorage;
  };
}
