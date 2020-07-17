import React from "react";
import { withRouter } from "react-router";
import sha256 from "crypto-js/sha256";
import AuthorizationRequest from "../../widgets/authorization_request";
import Storage from "../../services/storage";
import { sendAck } from "../../services/keypering_server";
import {WalletManager} from "../../services/wallet";

class AuthorizationRequestPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const storage = Storage.getStorage();
    const request = await storage.getCurrentRequest();
    this.setState({
      request,
    });
  }

  handleApprove = async () => {
    const { history } = this.props;
    const { request } = this.state;
    const { token: wsToken, payload } = request;
    const { id, method, params } = payload;
    const { url, description } = params;
    const timestamp = new Date().getTime();
    const manager = WalletManager.getInstance();
    const walletName = await manager.getCurrentWalletName();
    const authToken = sha256(new Date().getTime() + "").toString();
    await Storage.getStorage().addAuthorization({
      walletName,
      token: authToken,
      url,
      description,
      timestamp,
    });
    sendAck(wsToken, {
      id,
      jsonrpc: "2.0",
      result: {
        token: authToken,
      },
    });
    history.push("/");
  };

  handleDecline = () => {
    console.log("handleDecline");
    const { history } = this.props;
    const { request } = this.state;
    const { token: wsToken, payload } = request;
    const { id, method, params } = payload;
    sendAck(0, {
      id,
      jsonrpc: "2.0",
      error: {
        code: 1,
        message: "declined",
      },
    });
    history.push("/");
  };

  render() {
    const { history } = this.props;
    const { request } = this.state;
    if (!request) {
      console.log("request is null");
      return null;
    }
    const { token: wsToken, payload } = request;
    const { id, method, params } = payload;
    const { url, description } = params;
    return (
      <AuthorizationRequest
        token={wsToken}
        url={url}
        description={description}
        history={history}
        handleApprove={this.handleApprove}
        handleDecline={this.handleDecline}
      />
    );
  }
}

export default withRouter(AuthorizationRequestPage);
