import React from "react";
import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
} from "@ionic/react";
import { eye, eyeOff } from "ionicons/icons";
import { Link, useHistory } from "react-router-dom";
import { DEFAULT_PRIVATE_ROUTE } from "../../auth/session";
import { login } from "../../services/authService";
import { getHttpErrorMessage } from "../../utils/httpErrorMessage";
import "./Login.css";

const Login = () => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Completa usuario y contraseña.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await login(username, password);
      console.log("Login correcto:", response);
      history.replace(DEFAULT_PRIVATE_ROUTE);
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(
        getHttpErrorMessage(
          err,
          "No se pudo iniciar sesión.",
          "Credenciales inválidas.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-content">
          <form className="login-form" onSubmit={handleSubmit}>
            <fieldset className="login-fieldset">
              <legend className="login-legend">Inicia Sesión</legend>
              <div className="login-fields">
                <IonItem className="login-item" lines="inset">
                  <IonLabel position="stacked">Usuario</IonLabel>
                  <IonInput
                    type="text"
                    name="username"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck={false}
                    value={username}
                    onIonInput={(e) => setUsername(String(e.detail.value ?? ""))}
                  />
                </IonItem>

                <IonItem className="login-item" lines="inset">
                  <IonLabel position="stacked">Contraseña</IonLabel>
                  <IonInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck={false}
                    value={password}
                    onIonInput={(e) => setPassword(String(e.detail.value ?? ""))}
                  />
                  <IonButton
                    slot="end"
                    fill="clear"
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    <IonIcon icon={showPassword ? eye : eyeOff} />
                  </IonButton>
                </IonItem>
              </div>

              {error && (
                <IonText color="danger">
                  <p className="login-error">{error}</p>
                </IonText>
              )}

              <IonButton expand="block" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
              </IonButton>

              <div className="login-register-link">
                <p>¿No tienes una cuenta?</p>
                <Link to="/register">Registrate</Link>
              </div>
            </fieldset>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
