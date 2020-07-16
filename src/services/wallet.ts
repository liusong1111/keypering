import {ec as EC} from "elliptic";
import {Buffer} from "buffer";
import {addressToScript, Config, RawTransaction, scriptToAddress, SignatureAlgorithm, SignContext} from "@keyper/specs";
import {hexToBytes, scriptToHash} from "@nervosnetwork/ckb-sdk-utils";
import Storage from "./storage";
import * as rpc from "./rpc";
import {decryptKeystore, encryptKeystore} from "./messaging";
import {getCellsSummary, getLiveCellsByLockHash, indexLockHash} from "./rpc";
import BN from "bn.js";

// const CKB = require("@nervosnetwork/ckb-sdk-rpc");
// import CKB from "@nervosnetwork/ckb-sdk-rpc";

const {Secp256k1LockScript} = require("@keyper/container/lib/locks/secp256k1");
const {AnyPayLockScript} = require("@keyper/container/lib/locks/anyone-can-pay");

// const keystore = require("@keyper/specs/lib/keystore");
const {Container} = require("@keyper/container/lib");

export {mnemonicToEntropy, entropyToMnemonic, generateMnemonic} from "bip39";

// export function generatePrivateKey() {
//   const ec = new EC("secp256k1");
//   const keyPair = ec.genKeyPair();
//   return keyPair.getPrivate().toString("hex");
// }

// function generateKey(_privateKey: string, password: string) {
//   const ec = new EC("secp256k1");
//   const keyPair = ec.keyFromPrivate(_privateKey);
//   const privateKey = keyPair.getPrivate();
//   let publicKey = keyPair.getPublic().encodeCompressed();
//   publicKey = Buffer.from(publicKey).toString("hex");
//   // const ks = keystore.encrypt(privateKey.toBuffer(), password);
//   const privateKeyBuffer = privateKey.toArrayLike(Buffer);
//   const ks = keystore.encrypt(privateKeyBuffer, password);
//   ks.publicKey = publicKey;
//   return ks;
// }

function initializeContainer() {
  const container = new Container([
    {
      algorithm: SignatureAlgorithm.secp256k1,
      provider: {
        padToEven(value: any) {
          if (typeof value !== "string") {
            throw new Error(`value must be string, is currently ${typeof value}, while padToEven.`);
          }
          if (value.length % 2) {
            return `0${value}`;
          }
          return value;
        },
        async sign(context: any, message: any) {
          const {ks} = context;
          if (!ks) {
            throw new Error(`no ks for address: ${context.address}`);
          }
          let privateKey: any = await decryptKeystore(context.password, ks);
          privateKey = privateKey.replace("0x", "");
          // const privateKey = keystore.decrypt(ks, context.password);
          const ec = new EC("secp256k1");
          const keypair = ec.keyFromPrivate(privateKey);
          const msg = typeof message === "string" ? hexToBytes(message) : message;
          const {r, s, recoveryParam} = keypair.sign(msg, {
            canonical: true,
          });
          if (recoveryParam === null) {
            throw new Error(`Fail to sign the message`);
          }
          const fmtR = r.toString(16).padStart(64, "0");
          const fmtS = s.toString(16).padStart(64, "0");
          const fmtRecoveryParma = this.padToEven(recoveryParam.toString(16));
          const signature = `0x${fmtR}${fmtS}${fmtRecoveryParma}`;
          return signature;
        },
      },
    },
  ]);
  container.addLockScript(
    new Secp256k1LockScript("0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8", "type", [
      {
        outPoint: {
          txHash: "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
          index: "0x0",
        },
        depType: "depGroup",
      },
    ])
  );
  container.addLockScript(
    new AnyPayLockScript("0x6a3982f9d018be7e7228f9e0b765f28ceff6d36e634490856d2b186acf78e79b", "type", [
      {
        outPoint: {
          txHash: "0x9af66408df4703763acb10871365e4a21f2c3d3bdc06b0ae634a3ad9f18a6525",
          index: "0x0",
        },
        depType: "depGroup",
      },
    ])
  );
  return container;
}

// const container = initializeContainer();

export class WalletManager {
  private container: typeof Container;

  constructor() {
    this.container = initializeContainer();
  }

  static manager: WalletManager = new WalletManager();

  static getInstance = () => {
    return WalletManager.manager;
  };

  createWallet = async (walletName: string, _privateKey: string, password: string) => {
    const ec = new EC("secp256k1");
    const keyPair = ec.keyFromPrivate(_privateKey);
    const privateKey = keyPair.getPrivate();
    const publicKeyPayload = Buffer.from(keyPair.getPublic().encodeCompressed()).toString("hex");
    // const privateKeyBuffer = privateKey.toArrayLike(Buffer);
    // const ks = keystore.encrypt(privateKeyBuffer, password);
    const ks: any = await encryptKeystore(password, `0x${privateKey.toString("hex")}`);
    const publicKeys = [{payload: `0x${publicKeyPayload}`, algorithm: "secp256k1"}];

    const storage = Storage.getStorage();
    await storage.addWallet(walletName, {
      ks,
      publicKeys,
    });
    await storage.setCurrentWalletName(walletName);

    publicKeys.forEach((pubKey: any) => {
      this.container.addPublicKey({
        payload: pubKey.payload,
        algorithm: pubKey.algorithm,
      });
    });

    // index all lockHash, assume RPC service will ignore duplicated ones.
    const locks = await this.container.getAllLockHashesAndMeta();
    const hashes = locks.map((lock: any) => lock.hash);
    hashes.map((hash: string) => indexLockHash(hash, "0x0"));
  };

  getCurrentWalletPrivateKey = async (password: string) => {
    const storage = Storage.getStorage();
    const currentWallet = await storage.getCurrentWallet();
    if (!currentWallet) {
      return null;
    }
    let privateKey: string;
    try {
      // privateKey = keystore.decrypt(currentWallet.ks, password);
      privateKey = await decryptKeystore(password, currentWallet.ks);
    } catch (e) {
      console.log(e);
      return null;
    }
    return privateKey;
  };

  removeCurrentWallet = async (password: string) => {
    const storage = Storage.getStorage();
    const currentWallet = await storage.getCurrentWallet();
    if (!currentWallet) {
      return false;
    }
    const thePrivateKey = await this.getCurrentWalletPrivateKey(password);
    if (!thePrivateKey) {
      return false;
    }
    await storage.removeWallet(currentWallet.name);

    currentWallet.publicKeys.forEach((pubKey: any) => {
      this.container.removePublicKey({
        payload: pubKey.payload,
        algorithm: pubKey.algorithm,
      });
    });
    return true;
  };

  loadWallets = async () => {
    const storage = Storage.getStorage();
    const wallets = await storage.getWallets();
    wallets.forEach((wallet: any) => {
      wallet.publicKeys.forEach((pubKey: any) => {
        this.container.addPublicKey({
          payload: pubKey.payload,
          algorithm: pubKey.algorithm,
        });
      });
    });
  };

  getWallets = async () => {
    const storage = Storage.getStorage();
    const wallets = await storage.getWallets();
    return wallets;
  };

  loadCurrentWalletAddressList = async (): Promise<any[]> => {
    const storage = Storage.getStorage();
    const wallet = await storage.getCurrentWallet();
    if (!wallet) {
      return [];
    }

    const scriptMetaPromises = wallet.publicKeys.map(async (pubKey: any) =>
      this.container.getLockHashesAndMetaByPublicKey({
        payload: pubKey.payload,
        algorithm: pubKey.algorithm,
      })
    );
    const scriptMetaList = await Promise.all(scriptMetaPromises);
    console.log("scriptMetaPromises.length=", scriptMetaPromises.length);
    console.log("scriptMetaList.length=", scriptMetaList.length);
    const addresses: any[] = [];
    scriptMetaList.forEach((scriptMetas: any) => {
      scriptMetas.forEach((o: any) => {
        const script = {
          lockHash: o.hash,
          lockScript: o.meta.script,
          lockScriptMeta: {
            name: o.meta.name,
            cellDeps: o.meta.deps,
            headerDeps: o.meta.headers,
          },
        };
        const addr = Object.assign({}, script, {
          address: scriptToAddress(script.lockScript, {networkPrefix: "ckt", short: true}),
          freeAmount: "0x0",
          inUseAmount: "0x0",
        });
        addresses.push(addr);
      });
    });
    console.log("addresses=", addresses);
    return addresses;
  };

  getCurrentWalletName = async (): Promise<string> => {
    return Storage.getStorage().getCurrentWalletName();
  };

  setCurrentWalletName = async (walletName: string) => {
    await Storage.getStorage().setCurrentWalletName(walletName);
  };

  getCurrentWallet = async (): Promise<any> => {
    return Storage.getStorage().getCurrentWallet();
  };

  sign = async (context: SignContext, tx: RawTransaction, config: Config) => {
    const result = await this.container.sign(context, tx, config);
    return result;
  };

  signAndSend = async (password: string, context: SignContext, tx: RawTransaction, config: Config) => {
    // const privateKey = this.getCurrentWalletPrivateKey(password);
    try {
      // todo: need correct addr
      context.address = "...";
      const storage = Storage.getStorage();
      const currentWallet = (await storage.getCurrentWallet())!;
      context.ks = currentWallet.ks;
      context.password = password;
      const signedTx = await this.container.sign(context, tx, config);
      // todo
      const txHash = await rpc.sendTransaction(signedTx);
      // const ckb = new CKB("https://prototype.ckbapp.dev/testnet/rpc");
      // await ckb.sendTransaction(signedTx);
      signedTx.txHash = txHash;
      return signedTx;
    } catch (e) {
      console.log("error", e);
      throw e;
    }
  };

  loadCurrentWalletAddressListWithCells = async () => {
    const addresses = await this.loadCurrentWalletAddressList();
    const cellsPromises = addresses.map((address: any) => getLiveCellsByLockHash(address.lockHash, "0x0", "0x32"));
    const addressCells = await Promise.all(cellsPromises);
    const addressSummary = addressCells.map((cells: any) => getCellsSummary(cells));
    const balance = new BN(0);
    addressCells.forEach((address: any, i) => {
      addresses[i].freeAmount = `0x${addressSummary[i].free.toString(16)}`;
      addresses[i].inUseAmount = `0x${addressSummary[i].inuse.toString(16)}`;
      addresses[i].liveCells = addressCells[i];
      balance.iadd(addressSummary[i].free);
    });
    return addresses;
  };

  getRawTxTemplate = () => {
    return {
      version: "0x0",
      cellDeps: [{
        outPoint: {
          // a fixed value for testnet
          txHash: "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
          index: "0x0"
        },
        depType: "depGroup",
      }],
      headerDeps: [],
      inputs: [],
      outputs: [],
      witnesses: [],
      outputsData: []
    }
  };

  buildTransferTransaction = (fromAddr: string, toAddr: string, amount: number, liveCells: any[]) => {
    const tx = this.getRawTxTemplate();
    const inputs = tx.inputs as any[];
    const outputs = tx.outputs as any[];
    const witnesses = tx.witnesses as any[];
    const outputsData = tx.outputsData as any[];
    const total = new BN(0);

    const toLock = addressToScript(toAddr);
    outputs.push({
      capacity: `0x${amount.toString(16)}`,
      lock: toLock,
    });
    outputsData.push("0x");
    let enough = false;
    for (const liveCell of liveCells) {
      if (liveCell.output_data_len !== "0x0") {
        continue;
      }
      const capacity = new BN(liveCell.cell_output.capacity.replace("0x", ""), 16);
      total.iadd(capacity);
      inputs.push({
        previousOutput: {
          txHash: liveCell.created_by.tx_hash,
          index: liveCell.created_by.index,
        },
        since: "0x0",
      });
      witnesses.push("0x");
      let fee = new BN(amount).add(new BN((inputs.length * 61) + (2 * 16) + 1000));
      if (fee.lt(new BN("10000000"))) {
        fee = new BN("10000000");
      }
      if (total.gt(fee.add(new BN(amount)))) {
        if (total.gt(fee.add(new BN(amount)).add(new BN("6100000000")))) {
          const change = total.sub(new BN(amount)).sub(fee);
          outputs.push({
            capacity: `0x${change.toString(16)}`,
            lock: addressToScript(fromAddr)
          });
          outputsData.push("0x");
        }
        enough = true;
        break;
      }
    }

    if (!enough) {
      return null;
      // throw new Error("not_enough_capacity");
    }
    witnesses[0] = {
      lock: "",
      inputType: "",
      outputType: "",
    }
    return tx;
  };
}
