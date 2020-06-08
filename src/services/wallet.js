import { ec as EC } from "elliptic";
import * as keystore from "@keyper/specs/lib/keystore";
import { Buffer } from "buffer";

export { mnemonicToEntropy, entropyToMnemonic, generateMnemonic } from "bip39";

// export function generatePrivateKey() {
//   const ec = new EC("secp256k1");
//   const keyPair = ec.genKeyPair();
//   return keyPair.getPrivate().toString("hex");
// }

export function generateKey(_privateKey, password) {
  const ec = new EC("secp256k1");
  const keyPair = ec.keyFromPrivate(_privateKey);
  const privateKey = keyPair.getPrivate();
  let publicKey = keyPair.getPublic().encodeCompressed();
  publicKey = Buffer.from(publicKey).toString("hex");
  // const ks = keystore.encrypt(privateKey.toBuffer(), password);
  const privateKeyBuffer = privateKey.toArrayLike(Buffer);
  const ks = keystore.encrypt(privateKeyBuffer, password);
  ks.publicKey = publicKey;
  return ks;
}
