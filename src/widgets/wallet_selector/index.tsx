import React from "react";
import { Menu } from "antd-mobile";
import styles from "./wallet_selector.module.scss";

interface Wallet {
  name: string;
}
interface WalletSelectorProps {
  wallets: Wallet[];
  currentWallet: Wallet;
  onSelect: any;
  onClose: any;
}

const WalletSelector = ({ wallets, currentWallet, onSelect, onClose }: WalletSelectorProps) => {
  const data = wallets.map((w) => ({
    label: w.name,
    value: w.name,
  }));
  return (
    <div className={styles.container}>
      <Menu data={data} level={1} value={[currentWallet.name]} className={styles.menu} onChange={onSelect} />
      <div className={styles.mask} onClick={onClose} />
    </div>
  );
};

export default WalletSelector;
