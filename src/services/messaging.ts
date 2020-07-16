
function promisified(method: string, params: any) {
  const win = window as any;
  const { __TAURI__ } = win;
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

    __TAURI__.invoke({
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

export async function decryptKeystore(password: string, ks: any): Promise<string> {
  const result = await promisified("decryptKeystore", {
    password,
    ks,
  }) as any;
  return result.privateKey as string;
}

export async function writeTextFile(path: string, content: string) {
  const result = await promisified("writeTextFile", {
    path,
    content,
  }) as any;
  return result;
}

export async function readTextFile(path: string) {
  const result = await promisified("readTextFile", {
    path,
  }) as any;
  return result;
}
