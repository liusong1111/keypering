import React from "react";
import { Button, Icon, InputItem, List, NavBar, Toast } from "antd-mobile";
import { useHistory, withRouter } from "react-router";
import styles from "./change_password.module.scss";
import commonStyles from "../../widgets/common.module.scss";
import Storage from "../../services/storage";

class ChangePasswordPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      oldPassword: "",
      newPassword: "",
      newPassword1: "",
    }
  }
  handleConfirm = async () => {
    const { history } = this.props;
    const { oldPassword, newPassword, newPassword1 } = this.state;
    if (!oldPassword) {
      Toast.fail("Enter current password please");
      return;
    }

    if(!newPassword || !newPassword1) {
      Toast.fail("Enter new password please");
      return;
    }

    if(newPassword !== newPassword1) {
      Toast.fail("New password does not match each other");
      return;
    }

    const store = Storage.getStorage();
    const currentWalletName = await store.getCurrentWalletName();
    try {
      await store.changeWalletPassword(currentWalletName, oldPassword, newPassword);
      history.push("/");
    } catch(e) {
      Toast.fail("Wrong password");
    }
  };

  handleInputOldPassword = (oldPassword: string) => {
    this.setState({
      oldPassword,
    });
  };

  handleInputNewPassword = (newPassword: string) => {
    this.setState({
      newPassword,
    })
  };

  handleInputNewPassword1 = (newPassword1: string) => {
    this.setState({
      newPassword1,
    })
  };

  render() {
    const { history } = this.props;
    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => history.goBack()}>
          Change password
        </NavBar>
        <List>
          <List.Item>
            <InputItem labelNumber={20} type="password" onChange={this.handleInputOldPassword}>Current Password</InputItem>
            <InputItem labelNumber={20} type="password" onChange={this.handleInputNewPassword}>New Password</InputItem>
            <InputItem labelNumber={20} type="password" onChange={this.handleInputNewPassword1}>Confirm Password</InputItem>
          </List.Item>
          <div className={commonStyles.ops}>
            <Button type="primary" inline size="small" className={commonStyles.primaryButton} onClick={this.handleConfirm}>Confirm</Button>

          </div>
        </List>
      </div>
    );
  }
}

export default withRouter(ChangePasswordPage);
