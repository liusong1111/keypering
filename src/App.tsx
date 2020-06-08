import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./App.css";
import "antd-mobile/dist/antd-mobile.css";
import WelcomePage from "./pages/welcome_page";
import SettingPage from "./pages/setting_page";
import HomePage from "./pages/home_page";
import CreateWalletPage from "./pages/create_wallet_page";
import ChangeWalletNamePage from "./pages/change_wallet_name_page";
import ChangePasswordPage from "./pages/change_password_page";
import DeleteWalletPage from "./pages/delete_wallet_page";
import AuthorizationRequest from "./widgets/authorization_request";

require("typeface-source-code-pro");
require("typeface-lato");

function App() {
  return (
    <Router>
      <div className="root">
        <Switch>
          <Route path="/welcome">
            <WelcomePage />
          </Route>
          <Route path="/setting">
            <SettingPage />
          </Route>
          <Route path="/create_wallet">
            <CreateWalletPage />
          </Route>
          <Route path="/change_wallet_name">
            <ChangeWalletNamePage />
          </Route>
          <Route path="/change_password">
            <ChangePasswordPage />
          </Route>
          <Route path="/delete_wallet">
            <DeleteWalletPage />
          </Route>
          <Route path="/authorization_request">
            <AuthorizationRequest url="https://demoapp.com/abc.html" />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
