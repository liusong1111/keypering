import React from "react";
import { Button, Flex, Icon, WhiteSpace, WingBlank } from "antd-mobile";
import { useHistory } from "react-router";
import styles from "./welcome.module.scss";
import Page from "../../widgets/page";

const WelcomePage = () => {
  const history = useHistory();
  return (
    <Page>
      <div className={styles.info}>
        <img src="logo.png" alt="logo" className={styles.logo} />
        <div className={styles.words}>Welcome to Keypering</div>
      </div>

      <WingBlank size="lg" className={styles.ops}>
        <Button type="primary" onClick={() => history.push("/create_wallet")}>
          Create a Wallet
        </Button>
        <WhiteSpace size="xl" />
        <Button onClick={() => history.push("/import_wallet")}>Import Wallet Seed</Button>
        <WhiteSpace size="xl" />
        <Button>Import from Keystore</Button>
      </WingBlank>
      <div className={styles.statusContainer}>
        <Icon type="check-circle" size="xxs" color="#3cc68a" />
        &nbsp;
        <span className={styles.status}>Connected (mainnet)</span>
      </div>
    </Page>
  );
};

export default WelcomePage;
