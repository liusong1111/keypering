import React from "react";
import { Icon, List, NavBar } from "antd-mobile";
import { Link } from "react-router-dom";
import styles from "./sidebar.module.scss";

interface SidebarProps {
  onClose: any;
  onImportFromKeystore: any;
}

const Sidebar = ({ onClose, onImportFromKeystore }: SidebarProps) => {
  return (
    <div className={styles.sidebar}>
      <NavBar leftContent={<span>Keypering</span>} rightContent={<Icon type="cross" onClick={onClose} />} />
      <div className={styles.group}>
        Wallet
      </div>
      <div className={styles.listItem}>
        <Link to="/create_wallet" className={styles.linkPrimary}>
          Create new wallet
        </Link>
      </div>
      <div className={styles.listItem}>
        <Link to="/import_wallet" className={styles.link}>
          Import from mnemonic
        </Link>
      </div>
      <div className={styles.listItem}>
        <Link to="/import_keystore" className={styles.link} onClick={onImportFromKeystore}>
          Import from keystore
        </Link>
      </div>
      <div className={styles.group}>
        Setting
      </div>
      <div className={styles.listItem}>
        <Link to="/setting" className={styles.link}>
          Setting
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
