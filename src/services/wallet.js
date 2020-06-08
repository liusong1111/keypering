import { ec as EC } from "elliptic";

export { mnemonicToEntropy, entropyToMnemonic } from "bip39";

export function generatePrivateKey() {
  const ec = new EC("secp256k1");
  const keyPair = ec.genKeyPair();
  return keyPair.getPrivate().toString("hex");
}

