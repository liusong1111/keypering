import React from "react";
import {Button, Icon, InputItem, List, NavBar, Toast} from "antd-mobile";
import styles from "./change_wallet_name.module.scss";
import commonStyles from "../../widgets/common.module.scss";
import Storage from "../../services/storage";
import {withRouter} from "react-router";

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

  handleConfirm = async () => {
    const { history } = this.props;
    const { newName } = this.state;
    if (!newName) {
      Toast.fail("Wallet name should not be empty");
      return;
    }

    const store = Storage.getStorage();
    const wallet = await store.getWalletByName(newName);
    if (wallet) {
      Toast.fail(`name: ${newName} is in use`);
      return;
    }
    const currentWalletName = await store.getCurrentWalletName();
    await store.changeWalletName(currentWalletName, newName);
    history.push("/");
  };

  handleInputChange = (value: string) => {
    this.setState({
      newName: value,
    });
  };

  render() {
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
          <div className={commonStyles.ops}>
            <Button inline size="small" className={commonStyles.primaryButton} type="primary" onClick={this.handleConfirm}>
              Confirm
            </Button>
          </div>
        </List>
      </div>
    );
  }
}

export default withRouter(ChangeWalletNamePage);
