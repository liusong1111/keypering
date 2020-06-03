import React from "react";
import { Icon } from "antd-mobile";
import styles from "./transaction.module.scss";

interface TransactionProps {
  requestUrl: string;
  metaInfo: string;
  state: "approved" | "rejected";
  timestamp: string;
}

const Transaction = ({ requestUrl, metaInfo, state, timestamp }: TransactionProps) => {
  return (
    <div>
      <div className={styles.item}>
        <span className={styles.requestFromLabel}>Request from: </span>
        <a className={styles.requestFromLink} href={requestUrl}>
          {requestUrl}
        </a>
      </div>
      <div className={styles.item}>
        <span className={styles.metaInfoLabel}>Meta info: </span>
        {metaInfo}
      </div>
      <div className={styles.item}>
        <span className={styles.timestamp}>{timestamp}</span> <Icon type="success" />
      </div>
    </div>
  );
};

export default Transaction;
