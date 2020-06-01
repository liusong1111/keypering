import React from "react";
import styles from "./transaction_list.module.scss";
import Transaction from "../transaction";

const TransactionList = () => {
  return (
    <div>
      <Transaction requestUrl={"https://demoapp.com/app1"} metaInfo={"Send 1000 USDT to cbk1xx"} state={"approved"} timestamp={"2020-05-20 12:33:22"} />
    </div>
  );
};

export default TransactionList;
