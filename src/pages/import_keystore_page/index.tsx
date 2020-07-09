import React from "react";
import { Button, Icon, InputItem, List, NavBar, Toast } from "antd-mobile";
import { useHistory, withRouter } from "react-router";
import Storage from "../../services/storage";
import {decryptKeystore} from "../../services/messaging";
import {WalletManager} from "../../services/wallet";
import commonStyles from "../../widgets/common.module.scss";

class ImportKeystorePage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      walletName: "",
      password: "",
    }
  }

  handleConfirm = async () => {
    const { history } = this.props;
    const { walletName, password } = this.state;
    if (!password) {
      Toast.fail("Password must be filled");
      return;
    }
    const store = Storage.getStorage();
    const request = await store.getCurrentRequest();
    const ks = JSON.parse(request);
    let k;
    try {
      k = await decryptKeystore(password, ks);
    } catch(e) {
      Toast.fail("Password is wrong, please check it");
      return;
    }
    const privateKey = k.replace("0x", "");
    const manager = WalletManager.getInstance();
    await manager.createWallet(walletName, privateKey, password);
    history.push("/");
  };

  handleInputWalletName = (walletName: string) => {
    this.setState({
      walletName,
    });
  };

  handleInputPassword = (password: string) => {
    this.setState({
      password,
    });
  };

  render() {
    const { history, title } = this.props;
    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => history.goBack()}>
          {title || "Enter password"}
        </NavBar>
        <List>
          <div>
            <InputItem labelNumber={20} type="text" onChange={this.handleInputWalletName}>Wallet Name</InputItem>
          </div>
          <div>
            <InputItem labelNumber={20} type="password" onChange={this.handleInputPassword}>Password</InputItem>
          </div>
          <div className={commonStyles.ops}>
            <Button size="small" type="primary" className={commonStyles.primaryButton} onClick={this.handleConfirm}>Confirm</Button>
          </div>
        </List>
      </div>
    );
  }
}

export default withRouter(ImportKeystorePage);
