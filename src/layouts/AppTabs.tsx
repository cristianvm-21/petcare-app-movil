import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { ellipsisHorizontalOutline } from "ionicons/icons";
import React, { useMemo, useState } from "react";
import { Redirect, Route, useHistory, useLocation } from "react-router-dom";
import { getCurrentUserRole } from "../auth/session";
import { getDefaultPrivateRoute, getTabsForRole, privateRoutes } from "../navigation/privateRoutes";
import Home from "../pages/home/Home";
import Pets from "../pages/Pets/Pets";
import Services from "../pages/VetServices/VetServices";
import SectionPlaceholder from "../pages/shared/SectionPlaceholder";
import "./AppTabs.css";

const AppTabs: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const currentRole = getCurrentUserRole();
  const isAllowed = Boolean(currentRole);
  const [moreMenuEvent, setMoreMenuEvent] = useState<Event | undefined>();
  const accessibleRoutes = useMemo(() => {
    if (!currentRole) {
      return [];
    }

    return privateRoutes.filter((route) => route.roles.includes(currentRole));
  }, [currentRole]);

  const visibleTabs = getTabsForRole(currentRole ?? null);
  const defaultPath = getDefaultPrivateRoute(currentRole ?? null);
  const { primaryTabs, overflowTabs } = useMemo(() => {
    if (visibleTabs.length <= 4) {
      return {
        primaryTabs: visibleTabs,
        overflowTabs: [],
      };
    }

    return {
      primaryTabs: visibleTabs.slice(0, 3),
      overflowTabs: visibleTabs.slice(3),
    };
  }, [visibleTabs]);

  const isMoreActive = overflowTabs.some(
    (tab) => location.pathname === tab.path,
  );

  function handleOpenMoreMenu(event: CustomEvent) {
    setMoreMenuEvent(event);
  }

  function handleSelectOverflowTab(path: string) {
    setMoreMenuEvent(undefined);
    history.push(path);
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route
          exact
          path="/app"
          render={() => <Redirect to={defaultPath} />}
        />

        {accessibleRoutes.map((route) => (
          <Route
            exact
            key={route.path}
            path={route.path}
            render={() =>
              isAllowed ? (
                route.key === "home" ? (
                  <Home />
                ) : route.key === "services" ? (
                  <Services />
                ) : route.key === "patients" || route.key === "owner-pets" ? (
                  <Pets />
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
        {primaryTabs.map((tab) => (
          <IonTabButton key={tab.path} tab={tab.key} href={tab.path}>
            <IonIcon icon={tab.icon} />
            <IonLabel>{tab.label}</IonLabel>
          </IonTabButton>
        ))}

        {overflowTabs.length > 0 && (
          <IonTabButton
            className={`app-tabs__more-button${isMoreActive ? " app-tabs__more-button--active" : ""}`}
            tab="more-menu"
            onClick={handleOpenMoreMenu}
          >
            <IonIcon icon={ellipsisHorizontalOutline} />
            <IonLabel>Más</IonLabel>
          </IonTabButton>
        )}
      </IonTabBar>

      <IonPopover
        alignment="end"
        className="app-tabs__more-popover"
        event={moreMenuEvent}
        isOpen={Boolean(moreMenuEvent)}
        onDidDismiss={() => setMoreMenuEvent(undefined)}
        side="top"
      >
        <IonList className="app-tabs__more-list">
          {overflowTabs.map((tab) => (
            <IonItem
              button
              className="app-tabs__more-item"
              detail={false}
              key={tab.path}
              lines="none"
              onClick={() => handleSelectOverflowTab(tab.path)}
            >
              <IonIcon icon={tab.icon} slot="start" />
              <IonLabel>{tab.label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonPopover>
    </IonTabs>
  );
};

export default AppTabs;
