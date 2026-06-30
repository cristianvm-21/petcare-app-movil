import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { isAuthenticated } from "../auth/session";

interface ProtectedRouteProps extends RouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  ...routeProps
}) => (
  <Route
    {...routeProps}
    render={({ location }) =>
      isAuthenticated() ? (
        children
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: location.pathname },
          }}
        />
      )
    }
  />
);

export default ProtectedRoute;
