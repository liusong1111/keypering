use serde::{Deserialize, Serialize};
use serde_hex::{SerHex, StrictPfx};
use crate::keystore::{V1Keystore, V1KeystoreError};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonRpcRequest {
    pub id: String,
    #[serde(flatten)]
    pub body: JsonRpcBody,
}

#[derive(Deserialize)]
#[serde(tag = "method", content = "params", rename_all = "camelCase")]
pub enum JsonRpcBody {
    EncryptKeystore {
        password: String,
        #[serde(with = "SerHex::<StrictPfx>", rename = "privateKey")]
        private_key: [u8; 32],
    },
    DecryptKeystore {
        password: String,
        ks: V1Keystore,
    },
    WriteTextFile {
        path: String,
        content: String,
    },
}

#[derive(Serialize, Deserialize)]
pub struct JsonRpcResponseError {
    code: isize,
    message: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JsonRpcResponse<T> where T: Serialize {
    pub id: String,
    pub error: Option<JsonRpcResponseError>,
    pub result: Option<T>,
}

#[derive(Serialize, Deserialize)]
pub struct DecryptKeystoreResponse {
    #[serde(with = "SerHex::<StrictPfx>", rename = "privateKey")]
    pub private_key: [u8; 32],
}

impl JsonRpcResponseError {
    pub fn new(code: isize, message: String) -> Self {
        Self {
            code,
            message,
        }
    }

    pub fn io_err() -> Self {
        return Self::new(5001, "IoError".to_owned());
    }
}

impl From<V1KeystoreError> for JsonRpcResponseError {
    fn from(err: V1KeystoreError) -> Self {
        return match err {
            V1KeystoreError::UnsupportedVersion => JsonRpcResponseError::new(1001, "UnsupportedVersion".to_owned()),
            V1KeystoreError::UnsupportedKdf => JsonRpcResponseError::new(1002, "UnsupportedKdf".to_owned()),
            V1KeystoreError::UnsupportedCipher => JsonRpcResponseError::new(1003, "UnsupportedCipher".to_owned()),
            V1KeystoreError::ScryptInvalidParams => JsonRpcResponseError::new(2001, "ScryptInvalidParams".to_owned()),
            V1KeystoreError::ScryptInvalidOutputLen => JsonRpcResponseError::new(2002, "ScryptInvalidOutputLen".to_owned()),
            V1KeystoreError::InvalidMac => JsonRpcResponseError::new(4001, "InvalidMac".to_owned()),
        };
    }
}

impl<T, E> From<(String, Result<T, E>)> for JsonRpcResponse<T> where T: Serialize, E: Into<JsonRpcResponseError> {
    fn from((id, r): (String, Result<T, E>)) -> Self {
        return match r {
            Err(err) => JsonRpcResponse {
                id,
                result: None,
                error: Some(err.into()),
            },
            Ok(result) => JsonRpcResponse {
                id,
                error: None,
                result: Some(result),
            }
        };
    }
}


#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    // your custom commands
    // multiple arguments are allowed
    // note that rename_all = "camelCase": you need to use "myCustomCommand" on JS
    MyCustomCommand { argument: String },
    WebSocketResponse { token: usize, data: String },
    JsonRpcCommand(JsonRpcRequest),
}
