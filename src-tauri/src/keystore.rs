use scrypt::ScryptParams;
use rand::Rng;
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use serde_hex::{SerHex, SerHexSeq, StrictPfx};
use blake2::VarBlake2b;
use blake2::digest::{Update, VariableOutput};

use aes_ctr::Aes128Ctr;
use aes_ctr::stream_cipher::generic_array::GenericArray;
use aes_ctr::stream_cipher::{NewStreamCipher, SyncStreamCipher};

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct CipherParams {
    #[serde(with = "SerHex::<StrictPfx>")]
    pub iv: [u8; 16],
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct KdfPrams {
    #[serde(with = "SerHex::<StrictPfx>")]
    pub salt: [u8; 32],
    pub logn: u8,
    pub r: u32,
    pub p: u32,
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Crypto {
    pub cipher: String,
    pub cipherparams: CipherParams,
    #[serde(with = "SerHexSeq::<StrictPfx>")]
    pub ciphertext: Vec<u8>,
    pub kdf: String,
    pub kdfparams: KdfPrams,
    #[serde(with = "SerHex::<StrictPfx>")]
    pub mac: [u8; 32],
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct V1Keystore {
    pub crypto: Crypto,
    pub id: String,
    pub version: u32,
}

#[derive(Debug)]
pub enum V1KeystoreError {
    UnsupportedVersion,
    UnsupportedKdf,
    UnsupportedCipher,
    ScryptInvalidParams,
    ScryptInvalidOutputLen,
    InvalidMac,
}


impl Default for V1Keystore {
    // initialize salt, iv
    fn default() -> Self {
        let id = Uuid::new_v4().to_string();
        let salt = rand::thread_rng().gen::<[u8; 32]>();
        let iv = rand::thread_rng().gen::<[u8; 16]>();
        return V1Keystore {
            id,
            version: 1,
            crypto: Crypto {
                cipher: "aes-128-ctr".to_string(),
                cipherparams: CipherParams { iv },
                ciphertext: Vec::<u8>::with_capacity(32),
                kdf: "scrypt".to_string(),
                kdfparams: KdfPrams {
                    salt,
                    #[cfg(debug_assertions)]
                    logn: 2,
                    #[cfg(not(debug_assertions))]
                    logn: 18,
                    r: 8,
                    p: 1,
                },
                mac: [0u8; 32],
            },
        };
    }
}


fn encrypt_or_decrypt(password: &str, private_key: &[u8], is_encrypt: bool, store: &V1Keystore) -> Result<(Vec<u8>, [u8; 32]), V1KeystoreError> {
    let mut data = Vec::<u8>::with_capacity(32);
    let mut mac = [0u8; 32];

    // validate
    if store.version != 1 {
        return Err(V1KeystoreError::UnsupportedVersion);
    }
    if store.crypto.kdf != "scrypt" {
        return Err(V1KeystoreError::UnsupportedKdf);
    }
    if store.crypto.cipher != "aes-128-ctr" {
        return Err(V1KeystoreError::UnsupportedCipher);
    }

    // scrypt
    let kdfparams = &store.crypto.kdfparams;
    let salt = kdfparams.salt;
    let iv = &store.crypto.cipherparams.iv;

    let scrypt_params = match ScryptParams::new(kdfparams.logn, kdfparams.r, kdfparams.p) {
        Ok(p) => p,
        Err(_) => return Err(V1KeystoreError::ScryptInvalidParams),
    };

    let mut derived_key = [0u8; 32];
    if scrypt::scrypt(password.as_bytes(), &salt, &scrypt_params, &mut derived_key).is_err() {
        return Err(V1KeystoreError::ScryptInvalidOutputLen);
    }
    // println!("derived_key={:?}", derived_key);

    // aes-128-ctr
    let key = &derived_key[..16];
    let mut cipher = Aes128Ctr::new(GenericArray::from_slice(key), GenericArray::from_slice(iv));

    data.resize(private_key.len(), 0u8);
    data.copy_from_slice(private_key);
    cipher.apply_keystream(&mut data);
    // println!("data={:?},len={}", data, data.len());

    // blake2b -> mac
    let mut blake2b = VarBlake2b::new(32).unwrap();
    blake2b.update(&derived_key[16..]);
    if is_encrypt {
        blake2b.update(&data);
    } else {
        blake2b.update(private_key);
    }
    blake2b.finalize_variable(|res| mac.copy_from_slice(res));
    // println!("mac={:?},len={}", mac, mac.len());
    return Ok((data, mac));
}

pub fn encrypt(password: &str, private_key: &[u8]) -> Result<V1Keystore, V1KeystoreError> {
    let mut store = V1Keystore::default();
    let (data, mac) = encrypt_or_decrypt(password, private_key, true, &store)?;
    store.crypto.ciphertext.resize(data.len(), 0u8);
    store.crypto.ciphertext.copy_from_slice(&data);
    store.crypto.mac.copy_from_slice(&mac);
    return Ok(store);
}

pub fn decrypt(password: &str, store: &V1Keystore) -> Result<Vec<u8>, V1KeystoreError> {
    let (data, mac) = encrypt_or_decrypt(password, &store.crypto.ciphertext, false, &store)?;
    if mac != store.crypto.mac {
        return Err(V1KeystoreError::InvalidMac);
    }
    return Ok(data);
}

// fn main() {
//     let password = "hello";
//     let private_key = rand::thread_rng().gen::<[u8; 32]>();
//     println!("before encrypt, private_key={:?}", private_key);
//     println!("===encrypt===");
//     let store = encrypt(password, &private_key).unwrap();
//     let json = serde_json::to_string_pretty(&store).unwrap();
//     println!("store={}", json);
//     println!("===decrypt===");
//     let pk = decrypt(password, &store).unwrap();
//     println!("after decrypt, private_key={:?}", pk);
// }
