import React from "react";
import {Button, Card, Flex, Icon, InputItem, List, Modal, NavBar, Toast, WhiteSpace, WingBlank} from "antd-mobile";
import { Bytes, Output, RawTransaction, Script, scriptToAddress } from "@keyper/specs";
import { withRouter } from "react-router";
import styles from "./transaction_request.module.scss";
import commonStyles from "../../widgets/common.module.scss";
import Tag from "../../widgets/tag";
import Address from "../../widgets/address";
import Balance from "../../widgets/balance";
import { sendAck } from "../../services/keypering_server";
import Storage from "../../services/storage";
import { WalletManager } from "../../services/wallet";
import { getLiveCell } from "../../services/rpc";
import { camelCaseKey } from "../../services/misc";
import storage from "../../services/storage";
import { formatDate } from "../../widgets/timestamp";

interface Cell {
  capacity: string;
  lock: Script;
  type?: Script | null;
  data: Bytes;
}

interface TransactionRequestParams {
  id: any;
  token: string;
  tx: RawTransaction;
  requestFrom: string;
  inputCells: Cell[];
  description: string;
  lockHash: string;
  config: any;
}

const InputOutput = ({ capacity, lock, type, data }: Cell) => {
  const address = scriptToAddress(lock, {networkPrefix: "ckt", short: true});
  let algorithm;
  if (lock.codeHash === "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8") {
    algorithm = "secp256k1";
  } else if (lock.codeHash === "0x390e1c7cb59fbd5cf9bfb9370acb0d2bbbbbcf4136c90b2f3ea5277b4c13b540") {
    algorithm = "anypay";
  } else {
    algorithm = "unknown";
  }

  return (
    <div className={styles.inputOutput}>
      <Address className={styles.address} value={address} />

      <Tag type={type && "primary" || "blank"} className={styles.tag}>type</Tag>
      <Tag type={data !== "0x" && "primary" || "blank"} className={styles.tag}>data</Tag>
      <Tag className={styles.tag}>{algorithm}</Tag>

      <Balance value={capacity} className={styles.balance}/>
      <span className={styles.ckb}>CKB</span>
    </div>
  );
};

class TransactionRequestPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      request: undefined,
      auth: undefined,
      inputs: [],
    };
  }

  async componentDidMount() {
    const storage = Storage.getStorage();
    const request = await storage.getCurrentRequest();
    this.setState({
      request,
    });
    console.log("request:", request);
    const token = (request as any).payload?.params?.token;
    if (!token) {
      return;
    }
    const auth = await storage.getAuthorization(token);
    // if (!auth) {
    //   return;
    // }
    this.setState({
      auth,
    });
    const rawInputs = (request as any).payload?.params?.tx?.inputs;
    if (!rawInputs) {
      return;
    }
    try {
      const inputs = await Promise.all(
        rawInputs.map(async (input: any) => {
          const { cell: rawCell } = await getLiveCell(
            { tx_hash: input.previousOutput.txHash, index: input.previousOutput.index },
            true,
          );
          const cell = camelCaseKey(rawCell);
          return cell;
        })
      );
      this.setState({
        inputs,
      });
    } catch(e) {
      console.log("error:", e);
    }
  }

  handleDecline = async () => {
    const { request } = this.state;
    const { history } = this.props;
    const { token: wsToken, payload } = request;
    const { id } = payload;
    sendAck(wsToken, {
      id,
      jsonrpc: "2.0",
      error: {
        code: 1,
        message: "declined",
      },
    });
    const store = Storage.getStorage();
    const transaction = await store.getTransaction(id);
    transaction.meta.state = "declined";
    transaction.meta.timestamp = formatDate(new Date().getTime());
    await store.putTransaction(transaction);
    history.push("/");
  };

  handleApprove = async () => {
    Modal.prompt("Password", "Sign to broadcast the transaction", [{
      text: "Cancel"
    }, {
      text: "Confirm",
      onPress: (password: string) => {
        this.handleConfirm(password);
      },
    }],
      "secure-text");
  };

  handleConfirm = async (password: string) => {
    const { request } = this.state;
    const { history } = this.props;
    const { token: wsToken, payload } = request;
    const { id, params } = payload;
    const { lockHash, tx, config, token, description } = params;
    const manager = WalletManager.getInstance();
    const context = {
      lockHash,
    };
    const store = storage.getStorage();
    const auth = await store.getAuthorization(token);
    if (!auth) {
      console.log("no_auth");
      // return;
    }

    const requestFrom = auth?.url || "direct";
    let txSigned;
    try {
      txSigned = await manager.signAndSend(password, context, tx, config);
    } catch(e) {
      Toast.fail(`Failed to sign and send transaction, error code=${e.code}, error message=${e.message}`);
      return;
    }
    console.log("txSigned:", txSigned);
    const transaction = await store.getTransaction(id);
    transaction.meta.requestFrom = requestFrom;
    transaction.meta.state = "approved";
    transaction.meta.timestamp = formatDate(new Date().getTime());
    transaction.rawTransaction = txSigned;
    await store.putTransaction(transaction);
    sendAck(wsToken, {
      id,
      jsonrpc: "2.0",
      result: {
        tx: txSigned,
      },
    });
    history.push("/");
  };

  render() {
    const { request, inputs, auth } = this.state;
    if (!request) {
      return null;
    }
    const {
      token: wsToken,
      payload: { id, params },
    } = request;
    const { tx, description, config, lockHash } = params as TransactionRequestParams;
    const { outputs, outputsData } = tx;
    const requestFrom = auth?.url || "direct";
    return (
      <div className={styles.page}>
        <NavBar icon={<Icon type="left" />} onLeftClick={this.handleDecline}>
          Transaction Request
        </NavBar>
        <Flex>
          <Flex.Item>
            <div className={styles.line}>
              <span className={styles.label}>Request from:</span>
              <a className={styles.link} href={requestFrom}>
                {requestFrom}
              </a>
            </div>
            <div className={styles.line}>
              <span className={styles.label}>Meta Info: </span>
              <span>{description}</span>
            </div>
            <div className={styles.line}>Transaction to sign:</div>
            <div className={styles.inputsAndOutputs}>
              <div className={styles.inputLabel}>Inputs</div>
              {inputs.map((input: any) => (
                <InputOutput {...input.output} data={input.data.content} />
              ))}
              <div className={styles.outputLabel}>Outputs</div>
              {outputs.map((output, index) => (
                <InputOutput {...output} data={outputsData[index]} />
              ))}
            </div>
          </Flex.Item>
        </Flex>
        <div className={commonStyles.ops}>
          <Button inline size="small" className={commonStyles.cancelButton} onClick={this.handleDecline}>
            Decline
          </Button>
          <Button inline size="small" type="primary" className={commonStyles.primaryButton} onClick={this.handleApprove}>
            Approve
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(TransactionRequestPage);
