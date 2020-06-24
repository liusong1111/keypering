export function sendAck(token: any, msg: any) {
  const { tauri } = window as any;
  tauri.invoke({
    cmd: "webSocketResponse",
    token,
    data: JSON.stringify(msg),
  });
}

function promisified(method: string, params: any) {
  const win = window as any;
  const { tauri } = win;
  const id = new Date().getTime().toString();
  return new Promise((resolve, reject) => {
    win[id] = (response: any) => {
      delete win[id];
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    };

    tauri.invoke({
      cmd: "jsonRpcCommand",
      id,
      jsonrpc: "2.0",
      method,
      params,
    });
  });
}

export function encryptKeystore(password: string, privateKey: string) {
  return promisified("encryptKeystore", {
    password,
    privateKey,
  });
}

export function decryptKeystore(password: string, ks: any) {
  return promisified("decryptKeystore", {
    password,
    ks,
  });
}
