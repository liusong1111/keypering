// import CKB from "@nervosnetwork/ckb-sdk-rpc";

// import snakecaseKeys from "snakecase-keys";
function snakeCase(key) {
  return key.replace("-", "_").replace(/[A-Z]/g, (e) => `_${e.toLowerCase()}`);
}
function snakeCaseKeyValue(obj) {
  if (typeof obj === "string") {
    return snakeCase(obj);
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    const result = [];
    for (let i = 0; i < obj.length; i++) {
      result.push(snakeCaseKeyValue(obj[i]));
    }
    return result;
  }
  const result = {};
  Object.keys(obj).forEach((k) => {
    result[snakeCase(k)] = snakeCaseKeyValue(obj[k]);
  });
  return result;
}
export async function sendTransaction(theSignedTx) {
  // const ckb = new CKB("https://prototype.ckbapp.dev/testnet/rpc");
  // await ckb.sendTransaction(signedTx);
  // return signedTx;
  const signedTx = snakeCaseKeyValue(theSignedTx);
  const requestBody = JSON.stringify(
    {
      id: 2,
      jsonrpc: "2.0",
      method: "send_transaction",
      params: [signedTx],
    },
    "  "
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
  console.log("response:", response);
  console.log("response json:", json);
  // if(response.error) {
  // }
}
