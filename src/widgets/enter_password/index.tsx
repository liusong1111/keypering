import React from "react";
import { Button, Icon, InputItem, List, NavBar, Toast } from "antd-mobile";
import { useHistory, withRouter } from "react-router";
import styles from "./change_password.module.scss";
import Storage from "../../services/storage";

interface EnterPasswordProps {
  title?: string;
  onConfirmPassword: any;
  history: any;
}

class EnterPassword extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      password: "",
    }
  }

  handleConfirm = async () => {
    const { history, onConfirmPassword } = this.props;
    const { password } = this.state;
    if (!password) {
      Toast.fail("Password must be filled");
      return;
    }
    onConfirmPassword(password);
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
          <List.Item>
            <InputItem labelNumber={20} type="password" onChange={this.handleInputPassword}>Password</InputItem>
          </List.Item>
          <List.Item>
            <Button type="primary" onClick={this.handleConfirm}>Confirm</Button>
          </List.Item>
        </List>
      </div>
    );
  }
}

export default withRouter(EnterPassword);
