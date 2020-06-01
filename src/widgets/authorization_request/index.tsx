import React from "react";
import styles from "./authorization_request.module.scss";
import { Button, Checkbox, Icon, List, NavBar } from "antd-mobile";

interface AuthorizationRequestProps {
  url: string;
}

class AuthorizationRequest extends React.Component<AuthorizationRequestProps, any> {
  constructor(props: AuthorizationRequestProps) {
    super(props);
  }

  handleDecline = () => {};

  handleApprove = () => {};

  render() {
    const { url } = this.props;
    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => window.history.back()}>
          Authorization Request
        </NavBar>
        <List>
          <List.Item>
            Request from:
            <a className={styles.link} href={url} target="_blank">
              {url}
            </a>
          </List.Item>
          <List.Item>
            You are going to share the following information to <span className={styles.domain}>demo-app.com</span>
          </List.Item>
          <List.Item>
            <Checkbox defaultChecked>Address, balance and related cells on CKB *</Checkbox>
          </List.Item>
          <List.Item className={styles.footer}>
            <Button inline onClick={this.handleDecline}>
              Decline
            </Button>
            <Button inline type="primary" onClick={this.handleApprove}>
              Approve
            </Button>
          </List.Item>
        </List>
      </div>
    );
  }
}

export default AuthorizationRequest;
