import React from "react";
import { Button, Icon, InputItem, List, NavBar } from "antd-mobile";
import { useHistory, withRouter } from "react-router";
import styles from "./change_password.module.scss";

class ChangePasswordPage extends React.Component<any, any> {
  render() {
    const { history } = this.props;
    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => history.goBack()}>
          Change password
        </NavBar>
        <List>
          <List.Item>
            <InputItem labelNumber={20}>Current Password</InputItem>
            <InputItem labelNumber={20}>New Password</InputItem>
            <InputItem labelNumber={20}>Confirm Password</InputItem>
          </List.Item>
          <List.Item>
            <Button type="primary">Confirm</Button>
          </List.Item>
        </List>
      </div>
    );
  }
}

export default withRouter(ChangePasswordPage);
