// import CKB from "@nervosnetwork/ckb-sdk-rpc";

// import snakecaseKeys from "snakecase-keys";
import { snakeCaseKeyValue } from "./misc";

async function callRpc(method, params) {
  const id = new Date().getTime();
  const requestBody = JSON.stringify(
    {
      id,
      jsonrpc: "2.0",
      method,
      params,
    },
    "  ",
    2
  );
  console.log("requestBody:", requestBody);
  const response = await fetch("https://prototype.ckbapp.dev/testnet/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestBody,
  });
  const json = await response.json();
  return json;
}
export async function sendTransaction(theSignedTx) {
  // const ckb = new CKB("https://prototype.ckbapp.dev/testnet/rpc");
  // await ckb.sendTransaction(signedTx);
  // return signedTx;
  const signedTx = snakeCaseKeyValue(theSignedTx);
  const response = await callRpc("send_transaction", [signedTx]);
  return response;
  // if(response.error) {
  // }
}

export async function getLiveCell(params) {
  const json = await callRpc("get_live_cell", params);
  return json;
}
