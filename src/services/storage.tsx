import { IDBPDatabase, openDB, deleteDB } from "idb";
// import "indexeddb-getall-shim";
// require("indexeddb-getall-shim");

interface Current {
  id?: number;
  currentWalletName: string;
  currentRequest: any;
}

interface Wallet {
  name: string;
  ks: any;
  publicKeys: any[];
}

async function getAll(db: any, storeName: string) {
  let cursor = await db.transaction(storeName).store.openCursor();
  const result = [];
  while (cursor) {
    result.push(cursor.value);
    cursor = await cursor.continue();
  }
  return result;
}

const initDB = async (storage: any) => {
  storage.db = await openDB("keypering", 1, {
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
      db.createObjectStore("transactions", {
        keyPath: "id",
      });
    },
  });
  storage.readyFn(true);
};

export default class Storage {
  constructor() {
    this.db = null;
    this.ready = new Promise((resolve) => {
      this.readyFn = resolve;
    });
    initDB(this);
  }

  db: IDBPDatabase | null = null;

  ready: any = null;

  readyFn: any = null;

  getCurrent = async (): Promise<Current> => {
    const current = await this.db?.transaction("current").store.get(1);
    if (!current) {
      return {
        currentWalletName: "",
        currentRequest: null,
      };
    }
    return current as Current;
  };

  setCurrent = async (current: Current): Promise<void> => {
    const tx = this.db!.transaction("current", "readwrite");
    const { store } = tx;

    if (!current.id) {
      current.id = 1;
      await store.add(current);
    } else {
      await store.put(current);
    }
    await tx.done;
  };

  getSalt = () => {};

  theSalt: string = "SALTME!";

  get salt() {
    return this.theSalt;
  }

  set salt(_salt: string) {
    this.theSalt = _salt;
  }

  setCurrentWalletName = async (walletName: string): Promise<void> => {
    const current = await this.getCurrent();
    current.currentWalletName = walletName;
    await this.setCurrent(current);
  };

  getCurrentWalletName = async (): Promise<string> => {
    const current = await this.getCurrent();
    return current.currentWalletName;
  };

  getCurrentWallet = async (): Promise<Wallet | null> => {
    const currentWalletName = await this.getCurrentWalletName();
    const wallet = await this.getWalletByName(currentWalletName);
    return wallet;
  };

  getWallets = async (): Promise<Wallet[]> => {
    // console.log("getAll=", this.db!.getAll);
    // const wallets = await this.db!.getAll("wallets");
    const wallets = await getAll(this.db!, "wallets");
    console.log("wallets=", wallets);
    return wallets as Wallet[];
  };

  getWalletByName = async (walletName: string): Promise<Wallet | null> => {
    const wallet = await this.db!.get("wallets", walletName);
    return wallet as Wallet | null;
  };

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

  setCurrentRequest = async (request: any) => {
    const current = await this.getCurrent();
    current.currentRequest = request;
    await this.setCurrent(current);
  };

  getCurrentRequest = async (): Promise<any> => {
    const current = await this.getCurrent();
    return current.currentRequest;
  };

  listAuthorization = async (): Promise<any[]> => {
    // const result = await this.db!.getAll("authorizations");
    const result = await getAll(this.db!, "authorizations");
    return result;
  };

  getAuthorization = async (token: string): Promise<any> => {
    const result = await this.db!.get("authorizations", token);
    return result;
  };

  removeAuthorization = async (token: string): Promise<void> => {
    await this.db!.delete("authorizations", token);
  };

  addAuthorization = async (auth: any): Promise<void> => {
    await this.db!.add("authorizations", auth);
  };

  addTransaction = async (transactionId: string, meta: any, rawTransaction: any): Promise<void> => {
    const transaction = {
      id: transactionId,
      meta,
      rawTransaction,
    };
    const tx = this.db!.transaction("transactions", "readwrite");
    const { store } = tx;
    await store.add(transaction);
    await tx.done;
  };

  removeTransaction = async (transactionId: any): Promise<void> => {
    await this.db!.delete("transactions", transactionId);
  };

  deleteDatabase = async () => {
    await this.db!.close();
    await deleteDB("keypering");
  };

  static defaultStorage = new Storage();

  static getStorage = () => {
    return Storage.defaultStorage;
  };
}
