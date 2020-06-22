import React from "react";
import { withRouter } from "react-router";
import utils from "@nervosnetwork/ckb-sdk-utils";
import EnterMnemonic from "../../widgets/enter_mnemonic";
import SetWalletNameAndPassword from "../../widgets/set_wallet_name_and_password";
import * as wallet from "../../services/wallet";
import { WalletManager } from "../../services/wallet";

class ImportWalletPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      step: 1,
      walletName: "",
      password: "",
    };
  }

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
    this.setState({
      mnemonic: inputMnemonic,
    });
    this.handleNext();
  };

  handleConfirm = async (walletName: string, password: string) => {
    const { mnemonic } = this.state;
    const { history } = this.props;
    let privateKey = null;
    try {
      utils.hexToBytes(`0x${mnemonic}`);
      privateKey = mnemonic;
    } catch (e) {
      privateKey = wallet.mnemonicToEntropy(mnemonic);
    }
    const manager = WalletManager.getInstance();
    await manager.createWallet(walletName, privateKey, password);
    history.push("/");
  };

  render() {
    const { step } = this.state;
    if (step === 1) {
      return <EnterMnemonic onBack={this.handleCancel} onNext={this.handleEnterMnemonic} />;
    }
    if (step === 2) {
      return <SetWalletNameAndPassword onBack={this.handleBack} onConfirm={this.handleConfirm} />;
    }
    return null;
  }
}

export default withRouter(ImportWalletPage);
