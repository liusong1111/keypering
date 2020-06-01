import React from "react";
import styles from "./authorization.module.scss";
import Timestamp from "../timestamp";
import {Button} from "antd-mobile";

interface AuthorizationProps {
  url: string;
  timestamp: string;
  [key: string]: any;
}

const Authorization = ({ url, timestamp }: AuthorizationProps) => {
  return (
    <div>
      <div className={styles.applicationContainer}>
        <span className={styles.applicationLabel}>Application: </span>
        <a href={url}>{url}</a>
      </div>
      <div>
        <Timestamp value={timestamp} />
        <Button inline size={"small"} className={styles.revokeButton}>Revoke</Button>
      </div>
    </div>
  );
};

export default Authorization;
