import {
  IonContent,
  IonPage,
} from "@ionic/react";
import AppHeader from "../../components/AppHeader/AppHeader";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <IonPage>
      <AppHeader title="Inicio" />
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
