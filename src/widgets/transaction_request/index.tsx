import React from "react";
import { Button, Card, Flex, Icon, List, Modal, NavBar, WhiteSpace, WingBlank } from "antd-mobile";
import styles from "./transaction_request.module.scss";
import Address from "../address";
import Balance from "../balance";

interface InputOutputDef {
  address: string;
  capacity: string | number;
  type: string | null;
  data: string | null;
  algorithm: string;
}

interface InputOutputProps {
  inner: InputOutputDef;
}

interface TransactionRequestDef {
  requestFrom: string;
  metaInfo: string;
  inputs: InputOutputDef[];
  outputs: InputOutputDef[];
}

interface TransactionRequestProps {
  inner: TransactionRequestDef;
  visible: boolean;
  onDecline: any;
  onApprove: any;
}

const InputOutput = ({ inner }: InputOutputProps) => {
  const { address, capacity, type, data, algorithm } = inner;
  return (
    <div>
      <List.Item
        multipleLine
        extra={
          <div>
            <Balance value={capacity} />
            CKB
          </div>
        }
      >
        <Address className={styles.address} value={address} />
        <WhiteSpace />
        <Button size="small" type={(type && "primary") || undefined} inline>
          type
        </Button>
        <Button size="small" type={(data && "primary") || undefined} inline>
          data
        </Button>
        <Button size="small" disabled inline>
          {algorithm}
        </Button>
      </List.Item>
    </div>
  );
};

class TransactionRequest extends React.Component<TransactionRequestProps, any> {
  constructor(props: TransactionRequestProps) {
    super(props);
    this.state = {};
  }

  handleDecline = () => {
    const { onDecline } = this.props;
    onDecline();
  };

  handleApprove = () => {
    const { onApprove } = this.props;
    onApprove();
  };

  render() {
    const { inner, visible } = this.props;
    const { requestFrom, metaInfo, inputs, outputs } = inner;
    if (!visible) {
      return null;
    }
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
              <span>{metaInfo}</span>
            </div>
            <div className={styles.line}>Transaction to sign:</div>
            <List renderHeader={<div className={styles.inputLabel}>Inputs</div>}>
              {inputs.map((input) => (
                <InputOutput inner={input} />
              ))}
            </List>
            <List renderHeader={<div className={styles.outputLabel}>Outputs</div>}>
              {outputs.map((output) => (
                <InputOutput inner={output} />
              ))}
            </List>
          </Flex.Item>
        </Flex>
        <div className={styles.footer}>
          <Button inline className={styles.declineButton} onClick={this.handleDecline}>
            Decline
          </Button>
          <Button inline type="primary" className={styles.approveButton} onClick={this.handleApprove}>
            Approve
          </Button>
        </div>
      </div>
    );
  }
}

export default TransactionRequest;
