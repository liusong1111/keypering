import React from "react";
import styles from "./transaction_list.module.scss";
import Transaction from "../transaction";

interface TransactionListProps {
  transactions: any[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className={styles.list}>
      {transactions.map((tx) => {
        const { id, meta, rawTransaction } = tx;
        const { requestFrom, description, state, timestamp } = meta;
        return (
          <div className={styles.item} key={id}>
            <Transaction requestFrom={requestFrom} description={description} state={state} timestamp={timestamp} tx={rawTransaction} />
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
