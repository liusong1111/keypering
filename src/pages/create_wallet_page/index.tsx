import React, { useState, MouseEvent, createRef } from "react";
import { Button, Card, InputItem, Toast, List, NoticeBar, TextareaItem, WhiteSpace, Flex } from "antd-mobile";
import { useRouteMatch, withRouter } from "react-router";
import { AlertCircle as AlertCircleIcon } from "react-feather";
import CopyToClipboard from "react-copy-to-clipboard";
import { WalletManager } from "../../services/wallet";
import * as wallet from "../../services/wallet";
import Storage from "../../services/storage";
import styles from "./create_wallet_page.module.scss";
import EnterMnemonic from "../../widgets/enter_mnemonic";
import SetWalletNameAndPassword from "../../widgets/set_wallet_name_and_password";

interface GenerateMnemonicProps {
  mnemonic: string;
  onRegenerate: any;
  onCancel: any;
  onNext: any;
}

const GenerateMnemonic = ({ mnemonic, onRegenerate, onCancel, onNext }: GenerateMnemonicProps) => {
  return (
    <Card className={styles.card}>
      <Card.Header className={styles.cardHeader} title="Your wallet seed has been generated" />
      <Card.Body>
        <CopyToClipboard text={mnemonic} onCopy={() => Toast.info("Copied", 1)}>
          <div className={styles.mnemonic}>{mnemonic}</div>
        </CopyToClipboard>
        <Flex>
          <Flex.Item className={styles.info}>
            <AlertCircleIcon size={12} /> &nbsp; Write down your wallet seed and save it in a safe place
          </Flex.Item>
          <Button inline size="small" className={styles.rightButton} onClick={onRegenerate}>
            Regenerate
          </Button>
        </Flex>
        <WhiteSpace />
      </Card.Body>
      <Card.Footer
        content={
          <div>
            <Button onClick={onCancel}>Cancel</Button>
            <WhiteSpace />
            <Button type="primary" onClick={onNext}>
              Next
            </Button>
          </div>
        }
      />
    </Card>
  );
};

class CreateWalletPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    const mnemonic = wallet.generateMnemonic();
    this.state = {
      step: 0,
      mnemonic,
    };
  }

  handleRegenerate = () => {
    // console.log("onRegenerate");
    const mnemonic = wallet.generateMnemonic();
    this.setState({
      mnemonic,
    });
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleBack = () => {
    let { step } = this.state;
    step -= 1;
    this.setState({
      step,
    });
  };

  handleNext = () => {
    // console.log("onNextStep");
    let { step } = this.state;
    step += 1;
    this.setState({
      step,
    });
  };

  handleEnterMnemonic = (inputMnemonic: string) => {
    const { mnemonic } = this.props;
    if (inputMnemonic !== mnemonic) {
      Toast.fail("Please enter mnemonic just generated");
    }
    this.handleNext();
  };

  handleConfirm = (walletName: string, password: string) => {
    const { mnemonic } = this.state;
    const { history } = this.props;
    const privateKey = wallet.mnemonicToEntropy(mnemonic);
    const manager = WalletManager.getInstance();
    manager.createWallet(walletName, privateKey, password);
    manager.currentWalletName = walletName;
    history.push("/");
  };

  render() {
    const { step, mnemonic } = this.state;

    if (step === 0) {
      return (
        <GenerateMnemonic
          mnemonic={mnemonic}
          onRegenerate={this.handleRegenerate}
          onCancel={this.handleCancel}
          onNext={this.handleNext}
        />
      );
    }
    if (step === 1) {
      return <EnterMnemonic onBack={this.handleBack} onNext={this.handleEnterMnemonic} />;
    }
    return <SetWalletNameAndPassword onBack={this.handleBack} onConfirm={this.handleConfirm} />;
  }
}

export default withRouter(CreateWalletPage);
