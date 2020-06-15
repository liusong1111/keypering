import React from "react";
import { withRouter } from "react-router";
import AuthorizationRequest from "../../widgets/authorization_request";
import Storage from "../../services/storage";
import { sendAck } from "../../services/messaging";

class AuthorizationRequestPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { request } = Storage.getStorage();
    this.setState({
      request,
    });
  }

  handleApprove = () => {
    // sendAck({
    //   type: "auth",
    // })
  };

  handleDecline = () => {
    console.log("handleDecline");
    const { history } = this.props;
    sendAck(0, {
      type: "auth",
      success: false,
      message: "declined",
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
    const { token, data } = request;
    const { origin, description } = data;
    return (
      <AuthorizationRequest
        token={token}
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
