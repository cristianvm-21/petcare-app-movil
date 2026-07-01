import {
  IonAvatar,
  IonButton,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { logOutOutline, settingsOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./AppHeader.css";

interface AppHeaderProps {
  title: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  const history = useHistory();
  const username = localStorage.getItem("username") ?? "Usuario";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    history.replace("/login");
  }

  return (
    <IonHeader>
      <IonToolbar className="app-header">
        <IonTitle className="app-header__title">{title}</IonTitle>
        <div className="app-header__content">
          <div className="app-header__profile">
            <IonAvatar className="app-header__avatar">
              <img src="/favicon.png" alt="Perfil del usuario" />
            </IonAvatar>
            <div className="app-header__text">
              <span>Bienvenido</span>
              <strong>{username}</strong>
            </div>
          </div>

          <div className="app-header__actions">
            <IonButton
              aria-label="Cerrar sesión"
              className="app-header__action"
              fill="clear"
              onClick={handleLogout}
            >
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>

            <IonButton
              aria-label="Configuración"
              className="app-header__action"
              fill="clear"
            >
              <IonIcon icon={settingsOutline} slot="icon-only" />
            </IonButton>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
