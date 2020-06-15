export function sendAck(token: any, msg: any) {
  const { tauri } = window as any;
  tauri.invoke({
    cmd: "webSocketResponse",
    token,
    data: JSON.stringify(msg),
  });
}
