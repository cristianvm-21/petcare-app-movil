import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { getCurrentUserRole } from "../auth/session";
import { getDefaultPrivateRoute, getTabsForRole, privateRoutes } from "../navigation/privateRoutes";
import Home from "../pages/home/Home";
import SectionPlaceholder from "../pages/shared/SectionPlaceholder";

const AppTabs: React.FC = () => {
  const currentRole = getCurrentUserRole();
  const isAllowed = Boolean(currentRole);

  const visibleTabs = getTabsForRole(currentRole ?? null);
  const defaultPath = getDefaultPrivateRoute(currentRole ?? null);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route
          exact
          path="/app"
          render={() => <Redirect to={defaultPath} />}
        />

        {privateRoutes.map((route) => (
          <Route
            exact
            key={route.path}
            path={route.path}
            render={() =>
              isAllowed && currentRole && route.roles.includes(currentRole) ? (
                route.key === "home" ? (
                  <Home />
                ) : (
                  <SectionPlaceholder
                    title={route.title}
                    description={route.description}
                  />
                )
              ) : (
                <Redirect to="/login" />
              )
            }
          />
        ))}
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        {visibleTabs.map((tab) => (
          <IonTabButton key={tab.path} tab={tab.key} href={tab.path}>
            <IonIcon icon={tab.icon} />
            <IonLabel>{tab.label}</IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </IonTabs>
  );
};

export default AppTabs;
