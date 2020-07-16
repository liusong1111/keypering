import React from "react";
import { Icon } from "antd-mobile";
import styles from "./transaction.module.scss";
import { ArrowRightCircle as ArrowRightCircleIcon } from "react-feather";

interface TransactionProps {
  requestFrom: string;
  description: string;
  state: "approved" | "declined";
  timestamp: string;
  tx: any;
}

const Transaction = ({ requestFrom, description, state, timestamp, tx }: TransactionProps) => {
  return (
    <div>
      <div className={styles.item}>
        <span className={styles.requestFromLabel}>Request from: </span>
        <a className={styles.requestFromLink} href={requestFrom}>
          {requestFrom}
        </a>
      </div>
      <div className={styles.item}>
        <span className={styles.metaInfoLabel}>Meta info: </span>
        {description}
      </div>
      <div className={styles.item}>
        <span className={styles.timestamp}>{timestamp}</span>
        <span className={`${styles.state} ${styles[state]}`}>
        <Icon size="xxs" type={state === "declined" && "cross-circle" || state === "approved" && "check-circle-o" || "ellipsis"} />{state}
        </span>
        {state === "approved" && <a target="_blank" className={styles.link} href={`https://explorer.nervos.org/aggron/transaction/${tx.txHash}`}><ArrowRightCircleIcon /></a>}
      </div>
    </div>
  );
};

export default Transaction;
