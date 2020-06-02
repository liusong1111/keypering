import React from "react";
import styles from "./delete_wallet.module.scss";
import { Button, Icon, InputItem, List, NavBar } from "antd-mobile";
import {withRouter} from "react-router";

class DeleteWalletPage extends React.Component<any, any> {
  render() {
    const { history } = this.props;
    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => history.goBack()}>
          Delete wallet
        </NavBar>
        <List renderHeader="Enter password to delete wallet">
          <List.Item>
            <InputItem type="password" labelNumber={20}>Password</InputItem>
          </List.Item>
          <List.Item>
            <Button type="warning">Delete</Button>
          </List.Item>
        </List>
      </div>
    );
  }
}

export default withRouter(DeleteWalletPage);
