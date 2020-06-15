import { ec as EC } from "elliptic";
import { Buffer } from "buffer";
import { scriptToAddress, SignatureAlgorithm } from "@keyper/specs";
import { hexToBytes } from "@nervosnetwork/ckb-sdk-utils";
import Storage from "./storage";

const { Secp256k1LockScript } = require("@keyper/container/lib/locks/secp256k1");
const { AnyPayLockScript } = require("@keyper/container/lib/locks/anyone-can-pay");

const keystore = require("@keyper/specs/lib/keystore");
const { Container } = require("@keyper/container/lib");

export { mnemonicToEntropy, entropyToMnemonic, generateMnemonic } from "bip39";

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
          const { ks } = context;
          if (!ks) {
            throw new Error(`no ks for address: ${context.address}`);
          }
          const privateKey = keystore.decrypt(ks, context.password);
          const ec = new EC("secp256k1");
          const keypair = ec.keyFromPrivate(privateKey);
          const msg = typeof message === "string" ? hexToBytes(message) : message;
          const { r, s, recoveryParam } = keypair.sign(msg, {
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
          txHash: "0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e",
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

  createWallet = (walletName: string, _privateKey: string, password: string) => {
    const ec = new EC("secp256k1");
    const keyPair = ec.keyFromPrivate(_privateKey);
    const privateKey = keyPair.getPrivate();
    const publicKey = Buffer.from(keyPair.getPublic().encodeCompressed()).toString("hex");
    // publicKey = Buffer.from(publicKey).toString("hex");
    // const ks = keystore.encrypt(privateKey.toBuffer(), password);
    const privateKeyBuffer = privateKey.toArrayLike(Buffer);
    const ks = keystore.encrypt(privateKeyBuffer, password);
    ks.publicKey = publicKey;

    const storage = Storage.getStorage();
    storage.addWallet(walletName, {
      ks,
    });
    storage.currentWalletName = walletName;

    this.container.addPublicKey({
      payload: `0x${ks.publicKey}`,
      algorithm: SignatureAlgorithm.secp256k1,
    });
  };

  loadWallets = () => {
    const storage = Storage.getStorage();
    const wallets = storage.getWallets();
    wallets.forEach((wallet: any) => {
      this.container.addPublicKey({
        payload: `0x${wallet.ks.publicKey}`,
        algorithm: SignatureAlgorithm.secp256k1,
      });
    });

    let { currentWalletName } = storage;
    if (!currentWalletName && wallets.length > 0) {
      currentWalletName = wallets[0].name;
      storage.currentWalletName = currentWalletName;
    }
  };

  getWallets = () => {
    const storage = Storage.getStorage();
    const wallets = storage.getWallets();
    return wallets;
  };

  loadCurrentWalletAddressList = async () => {
    const wallet = this.currentWallet;
    const publicKeyPayload = wallet.ks.publicKey;
    const all = await this.container.getAllLockHashesAndMeta();
    console.log(all);
    const lockScripts = all.filter((item: any) => item.meta.publicKey.payload === `0x${publicKeyPayload}`);
    const addresses = lockScripts.map((script: any) => {
      const address = Object.assign({}, script, {
        address: scriptToAddress(script.meta.script, { networkPrefix: "ckt", short: true }),
        type: script.meta.name,
        lock: script.hash,
        freeAmount: "0x0",
        inUseAmount: "0x0",
      });
      return address;
    });

    return addresses;
  };

  get currentWalletName() {
    return Storage.getStorage().currentWalletName;
  }

  set currentWalletName(walletName: string) {
    Storage.getStorage().currentWalletName = walletName;
  }

  get currentWallet() {
    return Storage.getStorage().getWalletByName(this.currentWalletName);
  }
}
