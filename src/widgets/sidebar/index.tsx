import React from "react";
import styles from "./sidebar.module.scss";
import { Icon, List, NavBar } from "antd-mobile";
import { Link } from "react-router-dom";

interface SidebarProps {
  onClose: any;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  return (
    <div className={styles.sidebar}>
      <NavBar leftContent={<span>Keypering</span>} rightContent={<Icon type={"cross"} onClick={onClose} />}></NavBar>
      <List renderHeader={<span>Wallet</span>} className={styles.list}>
        <List.Item arrow="horizontal">
          <Link to="/create_wallet" className={styles.link}>
            Create new wallet
          </Link>
        </List.Item>
        <List.Item arrow="horizontal">Import from mnemonic</List.Item>
        <List.Item arrow="horizontal">Import from keystore</List.Item>
      </List>
      <List renderHeader={<span>Setting</span>} className={styles.list}>
        <List.Item arrow="horizontal">
          <Link to="/setting" className={styles.link}>
            Setting
          </Link>
        </List.Item>
      </List>
    </div>
  );
};

export default Sidebar;
