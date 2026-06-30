import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { logOutOutline, settingsOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
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
    <IonPage>
      <IonHeader>
        <IonToolbar className="home-toolbar">
          <IonTitle className="home-toolbar__title">Inicio</IonTitle>
          <div className="home-toolbar__content">
            <div className="home-toolbar__profile">
              <IonAvatar className="home-toolbar__avatar">
                <img src="/favicon.png" alt="Perfil del usuario" />
              </IonAvatar>
              <div className="home-toolbar__text">
                <span>Bienvenido</span>
                <strong>{username}</strong>
              </div>
            </div>

            <div className="home-toolbar__actions">
              <IonButton
                aria-label="Cerrar sesión"
                className="home-toolbar__action"
                fill="clear"
                onClick={handleLogout}
              >
                <IonIcon icon={logOutOutline} slot="icon-only" />
              </IonButton>

              <IonButton
                aria-label="Configuración"
                className="home-toolbar__action"
                fill="clear"
              >
                <IonIcon icon={settingsOutline} slot="icon-only" />
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="home-screen">
          <section className="home-panels">
            <article className="home-panel home-panel--hero" />

            <div className="home-panel-grid">
              <article className="home-panel home-panel--small" />
              <article className="home-panel home-panel--small" />
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
