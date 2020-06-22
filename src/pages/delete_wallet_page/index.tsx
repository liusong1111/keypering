import React from "react";
import { Button, Icon, InputItem, List, NavBar, Toast } from "antd-mobile";
import { withRouter } from "react-router";
import styles from "./delete_wallet.module.scss";
import { WalletManager } from "../../services/wallet";

class DeleteWalletPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      password: "",
    };
  }

  handleInputPassword = (value: string) => {
    this.setState({
      password: value,
    });
  };

  handleDeleteWallet = async () => {
    const { history } = this.props;
    const { password } = this.state;
    const manager = WalletManager.getInstance();
    const ok = await manager.removeCurrentWallet(password);
    if (!ok) {
      Toast.fail("error occurs when delete wallet, please check your password");
      return;
    }

    history.push("/");
  };

  render() {
    const { history } = this.props;
    const { password } = this.state;
    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => history.goBack()}>
          Delete wallet
        </NavBar>
        <List renderHeader="Enter password to delete wallet">
          <List.Item>
            <InputItem type="password" labelNumber={20} value={password} onChange={this.handleInputPassword}>
              Password
            </InputItem>
          </List.Item>
          <List.Item>
            <Button type="warning" onClick={this.handleDeleteWallet}>
              Delete
            </Button>
          </List.Item>
        </List>
      </div>
    );
  }
}

export default withRouter(DeleteWalletPage);
