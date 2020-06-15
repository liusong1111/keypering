export function sendAck(msg: any) {
  const { tauri } = window as any;
  tauri.invoke({
    cmd: "wsMessage",
    msg,
  });
}
