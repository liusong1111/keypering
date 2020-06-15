import React from "react";
import { withRouter } from "react-router";
import AuthorizationRequest from "../../widgets/authorization_request";
import Storage from "../../services/storage";
import { sendAck } from "../../services/messaging";

class AuthorizationRequestPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    const storage = Storage.getStorage();
    const { request } = storage;

    this.state = {
      request,
    };
  }

  handleApprove = () => {
    // sendAck({
    //   type: "auth",
    // })
  };

  handleDecline = () => {
    console.log("handleDecline");
    sendAck(0, {
      type: "auth",
      success: false,
      message: "declined",
    });
  };

  render() {
    const { history } = this.props;
    const { request } = this.state;
    const { origin, description } = request;
    return (
      <AuthorizationRequest
        origin={origin}
        description={description}
        history={history}
        handleApprove={this.handleApprove}
        handleDecline={this.handleDecline}
      />
    );
  }
}

export default withRouter(AuthorizationRequestPage);
