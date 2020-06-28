// #![cfg_attr(
// all(not(debug_assertions), target_os = "windows"),
// windows_subsystem = "windows"
// )]

use ws::{Message, Sender};
use tauri::Handle;
use serde::{Serialize, Deserialize};

mod cmd;
mod keystore;

use crate::cmd::{JsonRpcBody, JsonRpcResponse, DecryptKeystoreResponse};

#[derive(Clone)]
struct WebviewHandle {
    handle: Handle<()>,
}

impl WebviewHandle {
    fn new(handle: Handle<()>) -> Self {
        Self {
            handle,
        }
    }

    fn resolve_promise(&self, request_id: &str, data: &str) {
        let request_id = request_id.to_string();
        let data = data.to_string();
        let result = self.handle.dispatch(move |webview| {
            webview.eval(&format!(r#"
                        (function(){{
                        let fn = window["{}"];
                        if(!fn) {{
                          console.log("promise callback is undefined");
                          return;
                        }}
                        fn({});
                        }})();
                            "#, request_id, data))
        });
        println!("dispatchEvent result={:?}", result);
    }

    fn dispatch_ws_event(&self, detail: String) {
        // let mut detail = serde_json::to_string(&detail).unwrap();
        let result = self.handle.dispatch(move |webview| {
            webview.eval(&format!(r#"
                        (function(){{
                            let event = new CustomEvent("ws-event", {{
                              detail: {},
                            }});
                            document.dispatchEvent(event);
                        }})();
                            "#, detail))
        });
        println!("dispatchEvent result={:?}", result);
    }
}

enum UIMessage {
    SetWebviewHandle(WebviewHandle),
    TokenAndData(TokenAndData),
}


#[derive(Serialize, Deserialize)]
struct TokenAndData {
    token: usize,
    data: String,
}

fn main() {
    println!("starting...");
    let (tx_ui, rx_ui) = std::sync::mpsc::channel();
    let (tx_ws, rx_ws) = std::sync::mpsc::channel::<TokenAndData>();
    let tx_ui1 = tx_ui.clone();
    let ws_server = ws::WebSocket::new(move |out: Sender| {
        let tx_ui = tx_ui.clone();
        move |msg: Message| {
            println!("recv ws msg:{}", msg);
            tx_ui.send(UIMessage::TokenAndData(TokenAndData { token: out.token().0, data: msg.to_string() })).unwrap();
            Ok(())
        }
    }).unwrap();
    // todo: using broadcaster might be unsafe, should use map<token, conn>?, but raw_token is reused, which is vulnerable
    let broadcaster = ws_server.broadcaster().clone();
    std::thread::spawn(move || {
        //todo: what if port is occupied?
        println!("starting ws server on 127.0.0.1:13012...");
        ws_server.listen("127.0.0.1:13012").unwrap();
    });
    std::thread::spawn(move || {
        for msg in rx_ws {
            broadcaster.send(msg.data).unwrap();
        }
    });
    std::thread::spawn(move || {
        let mut webview_handle = None;
        while let Ok(msg) = rx_ui.recv() {
            match msg {
                UIMessage::SetWebviewHandle(_webview_handle) => {
                    webview_handle = Some(_webview_handle);
                }
                UIMessage::TokenAndData(token_and_data) => {
                    if let Some(webview_handle) = &webview_handle {
                        let data = serde_json::to_string(&token_and_data).unwrap();
                        webview_handle.dispatch_ws_event(data);
                    } else {
                        eprintln!("no webview_handle is set while receiving message,token={}, data={}", token_and_data.token, token_and_data.data);
                    }
                }
            }
        }
    });
    println!("starting tauri server...");
    tauri::AppBuilder::new()
        .setup(move |_webview, _win| {
            let webview_handle = WebviewHandle::new(_webview.handle());
            println!("setting up tauri webview...");
            tx_ui1.send(UIMessage::SetWebviewHandle(webview_handle)).unwrap();
        })
        .invoke_handler(move |_webview, arg| {
            use cmd::Cmd::*;
            match serde_json::from_str(arg) {
                Err(e) => {
                    Err(e.to_string())
                }
                Ok(command) => {
                    match command {
                        // definitions for your custom commands from Cmd here
                        MyCustomCommand { argument } => {
                            //  your command code
                            println!("MyCustomCommand, argument={}", argument);
                        }
                        WebSocketResponse { token, data } => {
                            println!("recv webSocketResponse, token={}, data={}", token, data);
                            tx_ws.send(TokenAndData { token, data }).unwrap();
                        }
                        JsonRpcCommand(rpc) => {
                            let id = &rpc.id;
                            let webview_handle = WebviewHandle::new(_webview.handle());
                            match rpc.body {
                                JsonRpcBody::EncryptKeystore { password, private_key } => {
                                    let ks = keystore::encrypt(&password, &private_key);
                                    let response = JsonRpcResponse::from((id.to_string(), ks));
                                    let json = serde_json::to_string_pretty(&response).unwrap();
                                    webview_handle.resolve_promise(id, &json);
                                }
                                JsonRpcBody::DecryptKeystore { password, ks } => {
                                    let private_key = keystore::decrypt(&password, &ks);
                                    let private_key = private_key.map(|private_key| DecryptKeystoreResponse { private_key });
                                    let response = JsonRpcResponse::from((id.to_string(), private_key));
                                    let json = serde_json::to_string_pretty(&response).unwrap();
                                    webview_handle.resolve_promise(id, &json);
                                }
                            }
                        }
                    }
                    Ok(())
                }
            }
        })
        .build()
        .run();
}
