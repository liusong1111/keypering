Keypering是个新的尝试，定位是一个架设在Keyper之上的桌面型轻量钱包，用于和dApp交互，可以理解成Keyper Scatter的翻版。

关于Keyper Scatter，以及Keyper Scatter与dApp的交互方式，请阅读[这篇文章](https://talk.nervos.org/t/keyper-scatter-dapp/4430)。当前Keypering还在初期开发中，[UI初版地址](https://github.com/liusong1111/keypering-ui)。

本文重点描述Keypering和dApp的交互协议，欢迎大家提意见。



## Rich node RPC

ckb-rich-node RPC基于 [ckb-rpc](https://github.com/nervosnetwork/ckb/blob/master/rpc/README.md) and [ckb-indexer-rpc](https://github.com/quake/ckb-indexer/blob/master/README.md)，它们都是JSON-RPC协议，更多信息请参考[ckb-rich-node](https://github.com/ququzone/ckb-rich-node)。



术语：

id: 数字或string，符合JSON-RPC的语义。由dApp生成，用来标记和跟踪一组request/response，不能为空。

token:  64 byte string。当Auth请求授权成功后，Keypering返回token，dApp就可用于后续的请求中。 

### Auth

- Request

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "method": "auth",
    "params": {
        "origin": "http://demo.ckb.dapp",
        "description": "a dApp demo"
    }
}
```

- Response

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "result": {
        "token": "xxxxxxxxxxxxxxxxxxxx"
    }
}
```

* Errors

  * 当用户拒绝本次请求后，Keypering发回:

    ```json
    {
        "id": 2,
        "jsonrpc": "2.0",
        "error": {
            "code": 1,
            "message": "declined"
      }
    }
    ```
  
  * 当用户关闭Keypering，或不理Keypering UI的提示，这时Keypering不会回应任何内容。dApp应能正常处理这种情况，比如引入超时机制

### Query Locks

- Request

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "method": "query_locks",
    "params": {
        "token": "xxxxxxxxxxxxxxxxxxxx"
    }
}
```

- Response

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "result": {
        "locks": [
            {
                "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                "hash_type": "type",
                "args": "0x8211f1b938a107cd53b6302cc752a6fc3965638d"
            }
        ]
    }
}
```

* Errors

  * 如果token无效，Keypering返回：

    ```json
    {
        "id": 2,
        "jsonrpc": "2.0",
        "error": {
            "code": 2,
            "message": "invalid_token"
        }
    }
    ```

### Sign

签名交易。

当dApp组装好交易，通过本接口请求签名，Keypering会在UI上展示交易信息，用户签名后，Keypering会返回包含签名的交易信息。

- Request

config是可选的，默认值 `{"index": 0, "length": -1}` 代表全签。

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "method": "sign",
    "params": {
        "token": "xxxxxxxxxxxxxxxxxxxx",
        "target": "LOCK_HASH",
        "tx": TX_JSON,
        "config": {
            "index": 0,
            "length": -1
        },
        "meta": "transaction meta info"
    }
}
```

- Response

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "result": {
        "tx": TX_JSON_WITH_SIGNATURE
    }
}
```

* Errors
  * 参考前面，code=1表示declined，code=2表示invalid_token

### Sign and Send

签名并发送交易。

- Request

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "method": "sign_and_send",
    "params": {
        "token": "xxxxxxxxxxxxxxxxxxxx",
        "target": "LOCK_HASH",
        "tx": TX_JSON,
        "config": {
            "index": 0,
            "length": -1
        },
        "meta": "transaction meta info"
    }
}
```

- Response

```json
{
    "id": 2,
    "jsonrpc": "2.0",
    "result": {
        "tx": TX_JSON_WITH_SIGNATURE,
        "hash": TX_HASH
    }
}
```

* Errors
  * 参考前面，code=1表示declined，code=2表示invalid_token
