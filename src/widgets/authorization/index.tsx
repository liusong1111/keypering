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
        <a className={styles.link} href={url} target="_blank">{url}</a>
      </div>
      <div>
        <Timestamp className={styles.timestamp} value={timestamp} />
        <Button inline size={"small"} className={styles.revokeButton}>Revoke</Button>
      </div>
    </div>
  );
};

export default Authorization;
