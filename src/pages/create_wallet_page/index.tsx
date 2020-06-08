import React, { useState, MouseEvent, createRef } from "react";
import { Button, Card, InputItem, Toast, List, NoticeBar, TextareaItem, WhiteSpace, Flex } from "antd-mobile";
import { useRouteMatch, withRouter } from "react-router";
import { AlertCircle as AlertCircleIcon } from "react-feather";
import CopyToClipboard from "react-copy-to-clipboard";
import * as wallet from "../../services/wallet";
import Storage from "../../services/storage";
import styles from "./create_wallet_page.module.scss";

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

interface EnterMnemonicProps {
  mnemonic: string;
  onBack: any;
  onNext: any;
}

class EnterMnemonic extends React.Component<EnterMnemonicProps, any> {
  private textareaRef = createRef<any>();

  constructor(props: EnterMnemonicProps) {
    super(props);
    this.state = {
      inputMnemonic: "",
    };
  }

  componentDidMount() {
    this.textareaRef.current.focus();
  }

  handleInputMnemonic = (value: any) => {
    this.setState({ inputMnemonic: value });
  };

  handleNext = () => {
    const { mnemonic, onNext } = this.props;
    const { inputMnemonic } = this.state;
    if (mnemonic === inputMnemonic) {
      onNext();
    } else {
      Toast.fail("please input correct mnemonic", 3);
    }
  };

  render() {
    const { inputMnemonic } = this.state;
    const { onBack } = this.props;
    return (
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader} title="Enter mnemonic" />
        <Card.Body>
          <TextareaItem
            value={inputMnemonic}
            rows={5}
            ref={this.textareaRef}
            onChange={this.handleInputMnemonic}
            className={styles.inputMnemonic}
          />
        </Card.Body>
        <Card.Footer
          content={
            <div>
              <Button onClick={onBack}>Back</Button>
              <WhiteSpace />
              <Button onClick={this.handleNext} type="primary">
                Next
              </Button>
            </div>
          }
        />
      </Card>
    );
  }
}

interface SetNameAndPasswordProps {
  onBack: any;
  onConfirm: any;
}

class SetNameAndPassword extends React.Component<SetNameAndPasswordProps, any> {
  constructor(props: SetNameAndPasswordProps) {
    super(props);
    this.state = {
      walletName: "",
      password: "",
      password2: "",
    };
  }

  handleConfirm = () => {
    const { onConfirm } = this.props;
    const { password, password2, walletName } = this.state;
    if (!walletName) {
      Toast.fail("please specify wallet name");
      return;
    }
    if (!password) {
      Toast.fail("password should not be empty");
      return;
    }
    if (password !== password2) {
      Toast.fail("password is not the same");
      return;
    }
    onConfirm(walletName, password);
  };

  handleInputWalletName = (value: string) => {
    this.setState({
      walletName: value,
    });
  };

  handleInputPassword = (value: string) => {
    this.setState({
      password: value,
    });
  };

  handleInputPassword2 = (value: string) => {
    this.setState({
      password2: value,
    });
  };

  render() {
    const { onBack } = this.props;
    const { walletName, password, password2 } = this.state;

    return (
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader} title="Setup your new wallet" />
        <Card.Body>
          <List>
            <InputItem placeholder="" labelNumber={7} value={walletName} onChange={this.handleInputWalletName}>
              Wallet Name
            </InputItem>
            <InputItem
              placeholder=""
              labelNumber={7}
              type="password"
              value={password}
              onChange={this.handleInputPassword}
            >
              Password
            </InputItem>
            <InputItem
              placeholder=""
              labelNumber={7}
              type="password"
              value={password2}
              onChange={this.handleInputPassword2}
            >
              Confirm Password
            </InputItem>
          </List>
        </Card.Body>
        <Card.Footer
          content={
            <div>
              <Button onClick={onBack}>Back</Button>
              <WhiteSpace />
              <Button onClick={this.handleConfirm} type="primary">
                Confirm
              </Button>
            </div>
          }
        />
      </Card>
    );
  }
}

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

  handleConfirm = (walletName: string, password: string) => {
    const { mnemonic } = this.state;
    const { history } = this.props;
    const privateKey = wallet.mnemonicToEntropy(mnemonic);
    const ks = wallet.generateKey(privateKey, password);
    const storage = Storage.getStorage();
    storage.addWallet(walletName, {
      ks,
    });
    storage.currentWalletName = walletName;
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
      return <EnterMnemonic mnemonic={mnemonic} onBack={this.handleBack} onNext={this.handleNext} />;
    }
    return <SetNameAndPassword onBack={this.handleBack} onConfirm={this.handleConfirm} />;
  }
}

export default withRouter(CreateWalletPage);