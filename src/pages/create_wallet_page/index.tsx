import React, { useState, MouseEvent } from "react";
import styles from "./create_wallet_page.module.scss";
import { Button, Card, InputItem, List, NoticeBar, TextareaItem, WhiteSpace } from "antd-mobile";
import { useRouteMatch } from "react-router";

interface GenerateMnemonicProps {
  mnemonic: string;
  onRegenerate: any;
  onCancel: any;
  onNext: any;
}

const GenerateMnemonic = ({ mnemonic, onRegenerate, onCancel, onNext }: GenerateMnemonicProps) => {
  return (
    <Card className={styles.card}>
      <Card.Header className={styles.cardHeader} title={"Your wallet seed has been generated"} />
      <Card.Body>
        <TextareaItem value={mnemonic} disabled />
        <NoticeBar action={<Button>Regenerate</Button>}>
          Write down your wallet seed and save it in a safe place
        </NoticeBar>
        <Button inline size={"small"} className={styles.rightButton} onClick={onRegenerate}>
          Regenerate
        </Button>
        <WhiteSpace />
      </Card.Body>
      <Card.Footer
        content={
          <div>
            <Button onClick={onCancel}>Cancel</Button>
            <WhiteSpace />
            <Button type={"primary"} onClick={onNext}>
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
  constructor(props: EnterMnemonicProps) {
    super(props);
    this.state = {
      inputMnemonic: "",
    };
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
      alert("please input correct mnemonic");
    }
  };

  render() {
    const { inputMnemonic } = this.state;
    const { onBack } = this.props;
    return (
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader} title="Enter mnemonic" />
        <Card.Body>
          <TextareaItem value={inputMnemonic} onChange={this.handleInputMnemonic} />
        </Card.Body>
        <Card.Footer
          content={
            <div>
              <Button onClick={onBack}>Back</Button>
              <WhiteSpace />
              <Button onClick={this.handleNext} type={"primary"}>
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
      alert("please specify wallet name");
      return;
    }
    if (!password) {
      alert("password should not be empty");
      return;
    }
    if (password !== password2) {
      alert("password is not the same");
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
        <Card.Header className={styles.cardHeader} title={"Setup your new wallet"} />
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
              Confirm Pwd
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
    this.state = {
      step: 0,
      mnemonic: "abc",
    };
  }

  handleRegenerate = () => {
    console.log("onRegenerate");
  };

  handleCancel = () => {
    window.history.back();
  };

  handleBack = () => {
    this.setState({
      step: this.state.step - 1,
    });
  };

  handleNext = () => {
    console.log("onNextStep");
    this.setState({
      step: this.state.step + 1,
    });
  };

  handleConfirm = (walletName: string, password: string) => {
    const { mnemonic } = this.state;
    // todo: leak password and mnemonic
    console.log(`onConfirm, walletName=${walletName}, password=${password}, mnemonic=${mnemonic}`);
  };

  render() {
    const { step, mnemonic } = this.state;

    if (step === 0) {
      return <GenerateMnemonic mnemonic={mnemonic} onRegenerate={this.handleRegenerate} onCancel={this.handleCancel} onNext={this.handleNext} />;
    }
    if (step === 1) {
      return <EnterMnemonic mnemonic={mnemonic} onBack={this.handleBack} onNext={this.handleNext} />;
    }
    return <SetNameAndPassword onBack={this.handleBack} onConfirm={this.handleConfirm} />;
  }
}

export default CreateWalletPage;
