import React from "react";
import Authorization from "../authorization";
import styles from "./authorization_list.module.scss";

interface AuthorizationListProps {
  authorizations: any[];
  onRevoke: any;
}

const AuthorizationList = (props: AuthorizationListProps) => {
  const { authorizations, onRevoke } = props;
  const items = authorizations.map(({ origin, timestamp, token }) => (
    <div className={styles.item} key={token}>
      <Authorization origin={origin} timestamp={timestamp} token={token} onRevoke={onRevoke} />
    </div>
  ));
  return <div>{items}</div>;
};

export default AuthorizationList;
