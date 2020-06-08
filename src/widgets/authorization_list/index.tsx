import React from "react";
import styles from "./authorization_list.module.scss";
import Authorization from "../authorization";

const AuthorizationList = () => {
  return (
    <div>
      <Authorization url="https://demoapp.com" timestamp="2020-05-20 13:33:34" />
    </div>
  );
};

export default AuthorizationList;
