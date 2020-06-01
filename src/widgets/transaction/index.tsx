import React from "react";
import styles from "./transaction.module.scss";
import { Icon } from "antd-mobile";

interface TransactionProps {
  requestUrl: string;
  metaInfo: string;
  state: "approved" | "rejected";
  timestamp: string;
}

const Transaction = ({ requestUrl, metaInfo, state, timestamp }: TransactionProps) => {
  return (
    <div>
      <div className={styles.requestFromContainer}>
        <span className={styles.requestFromLabel}>Request from: </span>
        <a className={styles.requestFromLink} href={requestUrl}>{requestUrl}</a>
      </div>
      <div>Meta info: {metaInfo}</div>
      <div>
        <span className={styles.timestamp}>{timestamp}</span> <Icon type={"success"} />
      </div>
    </div>
  );
};

export default Transaction;
