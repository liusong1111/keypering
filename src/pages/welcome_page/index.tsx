import React, {useEffect, useState} from "react";
import { Button, Flex, Icon, WhiteSpace, WingBlank } from "antd-mobile";
import { useHistory } from "react-router";
import { open } from "tauri/api/dialog";
import { readTextFile } from "../../services/messaging";
import styles from "./welcome.module.scss";
import Page from "../../widgets/page";
import Storage from "../../services/storage";


const WelcomePage = () => {
  const history = useHistory();
  let [net, setNet] = useState("testnet");
  useEffect(() => {
    const store = Storage.getStorage();
    (async () => {
      const setting = await store.getSetting();
      setNet(setting.net);
    })();
  }, []);
  const handleImportFromKeystore = async () => {
    const path = await open({});
    const content = await readTextFile(path as string);
    console.log(content);
    const store = Storage.getStorage();
    await store.setCurrentRequest(content);
    history.push("/import_keystore");
  };
  return (
    <Page>
      <div className={styles.info}>
        <img src="logo.png" alt="logo" className={styles.logo} />
        <div className={styles.words}>Welcome to<br /> Keypering</div>
      </div>

      <WingBlank size="lg" className={styles.ops}>
        <Button type="primary" onClick={() => history.push("/create_wallet")}>
          Create a Wallet
        </Button>
        <WhiteSpace size="xl" />
        <Button className={styles.importButton} onClick={() => history.push("/import_wallet")}>Import Wallet Seed</Button>
        <WhiteSpace size="xl" />
        <Button className={styles.importButton} onClick={handleImportFromKeystore}>Import from Keystore</Button>
      </WingBlank>
      <div className={styles.statusContainer}>
        <Icon type="check-circle" size="xxs" color="#3cc68a" />
        &nbsp;
        <span className={styles.status}>Connected ({net})</span>
      </div>
    </Page>
  );
};

export default WelcomePage;
