import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { DEFAULT_PRIVATE_ROUTE, isAuthenticated } from './auth/session';
import AppTabs from './layouts/AppTabs';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/login/Login';
import Register from './pages/register/Register';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route
          exact
          path="/"
          render={() => (
            <Redirect to={isAuthenticated() ? DEFAULT_PRIVATE_ROUTE : "/login"} />
          )}
        />
        <Route
          exact
          path="/login"
          render={() =>
            isAuthenticated() ? <Redirect to={DEFAULT_PRIVATE_ROUTE} /> : <Login />
          }
        />
        <Route
          exact
          path="/register"
          render={() =>
            isAuthenticated() ? (
              <Redirect to={DEFAULT_PRIVATE_ROUTE} />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/app"
          render={() =>
            isAuthenticated() ? <AppTabs /> : <Redirect to="/login" />
          }
        />
        <Route
          render={() => (
            <Redirect to={isAuthenticated() ? DEFAULT_PRIVATE_ROUTE : "/login"} />
          )}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
