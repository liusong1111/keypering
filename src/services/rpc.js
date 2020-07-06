// import CKB from "@nervosnetwork/ckb-sdk-rpc";

// import snakecaseKeys from "snakecase-keys";
import { snakeCaseKeyValue } from "./misc";
import BN from "bn.js";
import Storage from "./storage";

async function callRpc(method, params) {
  const store = Storage.getStorage();
  const setting = await store.getSetting();
  const net = setting.net;
  let endpoint;
  if (net === "testnet") {
    endpoint = "https://prototype.ckbapp.dev/testnet/rpc";
  } else if(net === "mainnet") {
    // todo
    endpoint = "https://prototype.ckbapp.dev/testnet/rpc";
  } else {
    // todo
    endpoint = "https://prototype.ckbapp.dev/testnet/rpc";
  }
  const id = new Date().getTime();
  const requestBody = JSON.stringify(
    {
      id,
      jsonrpc: "2.0",
      method,
      params,
    },
    null,
    2
  );
  console.log("requestBody:", requestBody);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: requestBody,
  });
  const json = await response.json();
  if (json.error) {
    throw json.error;
  }
  return json.result;
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

export async function getLiveCell(out_point, with_data) {
  const params = [out_point, with_data];
  const json = await callRpc("get_live_cell", params);
  return json;
}

export async function indexLockHash(lockHash, indexFrom) {
  const params = [lockHash, indexFrom];
  const json = await callRpc("index_lock_hash", params);
  return json;
}

export async function getLockHashIndexStates() {
  const params = [];
  const json = await callRpc("get_lock_hash_index_states", params);
  return json;
}

export async function getLiveCellsByLockHash(lockHash, page, per) {
  const params = [lockHash, page, per];
  const json = await callRpc("get_live_cells_by_lock_hash", params);
  return json;
}

export async function getTransactionsByLockHash(lockHash, page, per) {
  const params = [lockHash, page, per];
  const json = await callRpc("get_transactions_by_lock_hash", params);
  return json;
}

export async function getCapacityByLockHash(lockHash, page, per) {
  const params = [lockHash, page, per];
  const json = await callRpc("get_capacity_by_lock_hash", params);
  return json;
}

export function getCellsSummary(cells) {
  const result = {
    capacity: new BN(0),
    inuse: new BN(0),
    free: new BN(0),
  };
  for(const cell of cells) {
    const capacity = new BN(cell.cell_output.capacity.slice(2), 16);
    result.capacity.iadd(capacity);
    if(cell.output_data_len === "0x0") {
      result.free.iadd(capacity);
    } else {
      result.inuse.iadd(capacity);
    }
  }
  return result;
}
