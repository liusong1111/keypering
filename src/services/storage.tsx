import { IDBPDatabase, openDB, deleteDB } from "idb";
import {decryptKeystore, encryptKeystore} from "./messaging";
import {ec as EC} from "elliptic";
import {Buffer} from "buffer";
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

function createObjectStore(db:any, storeName:string, keyPath:string) {
  try {
    db.createObjectStore(storeName, {
      keyPath,
    });
  } catch(e) {
    console.log(`objectStore:${storeName} already exists`);
  }
}


export default class Storage {
  constructor() {
    this.db = null;
  }

  db: IDBPDatabase | null = null;

  static initDB = async (storage: any) => {
    // await deleteDB("keypering");
    // return;
    storage.db = await openDB("keypering", 2, {
      async upgrade(db, oldVersion, newVersion, tx) {
        createObjectStore(db, "wallets", "name");
        createObjectStore(db, "authorizations", "token");
        createObjectStore(db, "transactions", "id");
        createObjectStore(db, "settings", "id");
        createObjectStore(db, "current", "id");
      },
    });
  };

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

  getSetting = async () => {
    const setting = await this.db!.transaction("settings").store.get(1);
    if (!setting) {
      return {
        plugins: {
          "secp256k1":true,
          "anypay": true,
        },
        net: "testnet"
      };
    }

    return setting;
  };

  setSetting = async (setting: any) => {
    const tx = this.db!.transaction("settings", "readwrite");
    const { store } = tx;
    if(!setting.id) {
      setting.id = 1;
      await store.add(setting);
    } else {
      await store.put(setting);
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

  changeWalletName = async (oldWalletName: string, newWalletName: string) => {
    const wallet = await this.getWalletByName(oldWalletName);
    if (!wallet) {
      return;
    }
    await this.addWallet(newWalletName, wallet);
    await this.removeWallet(oldWalletName);
    await this.setCurrentWalletName(newWalletName);
  };

  changeWalletPassword = async (walletName: string, oldPassword: string, newPassword: string) => {
    const wallet = await this.getWalletByName(walletName);
    if (!wallet) {
      return;
    }
    const { ks, publicKeys } = wallet;

    let privateKey;
    try {
      privateKey = await decryptKeystore(oldPassword, wallet.ks);
    } catch(e) {
      throw e;
    }

    const newKs = await encryptKeystore(newPassword, privateKey);
    const tx = this.db!.transaction("wallets", "readwrite");
    const { store } = tx;
    store.put({
      name: walletName,
      ks: newKs,
      publicKeys,
    });
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

  listAuthorizationByWalletName = async (walletName: string): Promise<any[]> => {
    const auths = await this.listAuthorization();
    return auths.filter((auth) => auth.walletName === walletName);
  };

  getAuthorization = async (token: string): Promise<any> => {
    const result = await this.db!.get("authorizations", token);
    return result;
  };

  getAuthorizationByWalletNameAndUrl = async (walletName: string, url: string): Promise<any> => {
    const auths = await this.listAuthorization();
    return auths.find((auth) => auth.walletName === walletName && auth.url === url);
  };

  removeAuthorization = async (token: string): Promise<void> => {
    await this.db!.delete("authorizations", token);
  };

  addAuthorization = async (auth: any): Promise<void> => {
    // console.log("addAuthorization:", JSON.stringify(auth, null, 2));
    const existingAuth = await this.getAuthorizationByWalletNameAndUrl(auth.walletName, auth.url);
    if (existingAuth) {
      await this.removeAuthorization(existingAuth.token);
    }
    await this.db!.put("authorizations", auth);
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

  putTransaction = async (transaction: any) => {
    const tx = this.db!.transaction("transactions", "readwrite");
    const { store } = tx;
    await store.put(transaction);
    await tx.done;
  };

  removeTransaction = async (transactionId: any): Promise<void> => {
    await this.db!.delete("transactions", transactionId);
  };

  listTransaction = async (): Promise<any[]> => {
    let transactions = await getAll(this.db!, "transactions");
    transactions.sort((a: any, b: any) => {
      return (a.meta.timestamp > b.meta.timestamp) && -1 || 1;
    })
    return transactions;
  };

  getTransaction = async (transactionId: string) => {
    const transaction = await this.db!.get("transactions", transactionId);
    return transaction;
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
