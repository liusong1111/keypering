import React from "react";
import { Button, Checkbox, Icon, List, NavBar } from "antd-mobile";
import { withRouter } from "react-router";
import styles from "./authorization_request.module.scss";

interface AuthorizationRequestProps {
  token: number;
  origin: string;
  description: string;
  history: any;
  handleApprove: any;
  handleDecline: any;
  [key: string]: any;
}

class AuthorizationRequest extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { origin, description, history, handleApprove, handleDecline } = this.props;
    let domain = "unknown";
    try {
      domain = new URL(origin).hostname;
    } catch (e) {
      console.log("illegal origin:", origin);
    }

    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => history.goBack()}>
          Authorization Request
        </NavBar>
        <List>
          <List.Item>
            Request from:
            <a className={styles.link} href={origin} target="_blank">
              {origin}
            </a>
          </List.Item>
          <List.Item>
            Description: {description}
          </List.Item>
          <List.Item>
            You are going to share the following information to <span className={styles.domain}>{domain}</span>
          </List.Item>
          <List.Item>
            <Checkbox defaultChecked>Address, balance and related cells on CKB *</Checkbox>
          </List.Item>
          <List.Item className={styles.footer}>
            <Button inline onClick={handleDecline}>
              Decline
            </Button>
            <Button inline type="primary" onClick={handleApprove}>
              Approve
            </Button>
          </List.Item>
        </List>
      </div>
    );
  }
}

export default withRouter(AuthorizationRequest);
