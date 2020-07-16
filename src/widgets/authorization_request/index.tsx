import React from "react";
import { Button, Checkbox, Icon, List, NavBar } from "antd-mobile";
import { withRouter } from "react-router";
import styles from "./authorization_request.module.scss";
import commonStyles from "../../widgets/common.module.scss";

interface AuthorizationRequestProps {
  token: number;
  url: string;
  description: string;
  history: any;
  handleApprove: any;
  handleDecline: any;
  [key: string]: any;
}

class AuthorizationRequest extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      agree: true,
    }
  }

  handleSetAgree = (e: any) => {
    this.setState({
      agree: e.target.checked,
    })
  };

  render() {
    const { url, description, history, handleApprove, handleDecline } = this.props;
    const { agree } = this.state;
    let domain = "unknown";
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      console.log("illegal url:", url);
    }

    return (
      <div>
        <NavBar icon={<Icon type="left" />} onLeftClick={() => history.goBack()}>
          Authorization Request
        </NavBar>
        <List>
          <List.Item>
            <span className={styles.label}>Request from:</span>
            <a className={styles.link} href={url} target="_blank">
              {url}
            </a>
          </List.Item>
          <List.Item>
            <span className={styles.label}>Description: </span>{description}
          </List.Item>
          <List.Item>
            You are going to share the following information to <span className={styles.domain}>{domain}</span>
          </List.Item>
          <List.Item>
            <Checkbox.AgreeItem checked={agree} onChange={this.handleSetAgree}>Address, balance and related cells on CKB *</Checkbox.AgreeItem>
          </List.Item>

          <div className={commonStyles.ops}>
            <Button inline size="small" className={commonStyles.cancelButton} onClick={handleDecline}>
              Decline
            </Button>
            <Button inline size="small" className={commonStyles.primaryButton} type="primary" onClick={handleApprove} disabled={!agree}>
              Approve
            </Button>
          </div>
        </List>
      </div>
    );
  }
}

export default withRouter(AuthorizationRequest);
