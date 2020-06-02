import React from "react";
import styles from "./change_wallet_name.module.scss";
import { Button, Icon, InputItem, List, NavBar } from "antd-mobile";

interface ChangeWalletNameProps {
  // initialWalletName: string;
  // onChangeWallet: any;
}

class ChangeWalletNamePage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    // const { initialWalletName } = props;
    const initialWalletName = "";
    this.state = {
      newName: initialWalletName,
    };
  }

  handleConfirm = () => {
    // const { onChangeWallet } = this.props;
    const { newName } = this.state;
    if (!newName) {
      alert("Wallet name should not be empty");
      return;
    }
    // onChangeWallet(newName);
  };

  handleInputChange = (value: string) => {
    this.setState({
      newName: value,
    });
  };

  render() {
    // const { initialWalletName } = this.props;
    const initialWalletName = "";
    return (
      <div>
        <NavBar icon={<Icon type="left" onClick={() => window.history.back()} />}>Change wallet name</NavBar>
        <List renderHeader="">
          <List.Item>
            <InputItem defaultValue={initialWalletName} onChange={this.handleInputChange}>
              New Name
            </InputItem>
          </List.Item>
          <List.Item className={styles.footer}>
            <Button inline size="small" type="primary" onClick={this.handleConfirm}>
              Confirm
            </Button>
          </List.Item>
        </List>
      </div>
    );
  }
}

export default ChangeWalletNamePage;
