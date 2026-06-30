import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./SectionPlaceholder.css";

interface SectionPlaceholderProps {
  title: string;
  description: string;
}

const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
  title,
  description,
}) => {
  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="section-placeholder">
          <div className="section-placeholder__card">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SectionPlaceholder;
