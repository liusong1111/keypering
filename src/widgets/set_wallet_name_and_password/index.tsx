import React from "react";
import { Button, Card, InputItem, List, Toast, WhiteSpace } from "antd-mobile";
import styles from "./set_wallet_name_and_password.module.scss";
import commonStyles from "../common.module.scss";

interface SetWalletNameAndPasswordProps {
  onBack: any;
  onConfirm: any;
}

class SetWalletNameAndPassword extends React.Component<SetWalletNameAndPasswordProps, any> {
  constructor(props: SetWalletNameAndPasswordProps) {
    super(props);
    this.state = {
      walletName: "",
      password: "",
      password2: "",
    };
  }

  handleConfirm = () => {
    const { onConfirm } = this.props;
    const { password, password2, walletName } = this.state;
    if (!walletName) {
      Toast.fail("please specify wallet name");
      return;
    }
    if (!password) {
      Toast.fail("password should not be empty");
      return;
    }
    if (password !== password2) {
      Toast.fail("password is not the same");
      return;
    }
    onConfirm(walletName, password);
  };

  handleInputWalletName = (value: string) => {
    this.setState({
      walletName: value,
    });
  };

  handleInputPassword = (value: string) => {
    this.setState({
      password: value,
    });
  };

  handleInputPassword2 = (value: string) => {
    this.setState({
      password2: value,
    });
  };

  render() {
    const { onBack } = this.props;
    const { walletName, password, password2 } = this.state;

    return (
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader} title="Setup your new wallet" />
        <Card.Body>
            <InputItem placeholder="" labelNumber={10} value={walletName} onChange={this.handleInputWalletName}>
              Wallet Name
            </InputItem>
            <InputItem
              placeholder=""
              labelNumber={10}
              type="password"
              value={password}
              onChange={this.handleInputPassword}
            >
              Password
            </InputItem>
            <InputItem
              placeholder=""
              labelNumber={10}
              type="password"
              value={password2}
              onChange={this.handleInputPassword2}
            >
              Confirm Password
            </InputItem>
        </Card.Body>
        <Card.Footer
          content={
            <div className={commonStyles.ops}>
              <Button size="small" inline className={commonStyles.cancelButton} onClick={onBack}>Back</Button>
              <Button size="small" inline className={commonStyles.primaryButton} onClick={this.handleConfirm} type="primary">
                Confirm
              </Button>
            </div>
          }
        />
      </Card>
    );
  }
}

export default SetWalletNameAndPassword;
