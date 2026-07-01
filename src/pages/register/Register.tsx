import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
} from "@ionic/react";
import { Link, useHistory } from "react-router-dom";
import { RegisterRequest } from "../../contracts/authContract";
import { signUp } from "../../services/authService";
import "./Register.css";

const initialFormData: RegisterRequest = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
};

const Register = () => {
  const history = useHistory();
  const [formData, setFormData] = useState<RegisterRequest>(initialFormData);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof RegisterRequest>(
    field: K,
    value: RegisterRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await signUp(formData);
      history.replace("/login");
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      setError("No se pudo registrar el usuario. Inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="register-content">
          <form className="register-form" onSubmit={handleSubmit}>
            <fieldset className="register-fieldset">
              <div className="register-brand">
                <div className="register-brand__logo">
                  <img src="/favicon.png" alt="Logo de la aplicación" />
                </div>
              </div>

              <div className="register-divider" />

              <header className="register-header">
                <h1>¡Hola!</h1>
                <p>Regístrate para empezar</p>
              </header>

              <div className="register-fields">
                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Nombre de Usuario</IonLabel>
                  <IonInput
                    type="text"
                    required
                    value={formData.username}
                    onIonInput={(e) =>
                      updateField("username", String(e.detail.value ?? ""))
                    }
                  />
                </IonItem>

                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Correo</IonLabel>
                  <IonInput
                    type="email"
                    required
                    value={formData.email}
                    onIonInput={(e) =>
                      updateField("email", String(e.detail.value ?? ""))
                    }
                  />
                </IonItem>

                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Contraseña</IonLabel>
                  <IonInput
                    type="password"
                    required
                    value={formData.password}
                    onIonInput={(e) =>
                      updateField("password", String(e.detail.value ?? ""))
                    }
                  />
                </IonItem>

                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Confirmar Contraseña</IonLabel>
                  <IonInput
                    type="password"
                    required
                    value={confirmPassword}
                    onIonInput={(e) =>
                      setConfirmPassword(String(e.detail.value ?? ""))
                    }
                  />
                </IonItem>

                <div className="register-divider register-divider--inside" />

                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Nombres</IonLabel>
                  <IonInput
                    type="text"
                    required
                    value={formData.firstName}
                    onIonInput={(e) =>
                      updateField("firstName", String(e.detail.value ?? ""))
                    }
                  />
                </IonItem>

                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Apellidos</IonLabel>
                  <IonInput
                    type="text"
                    required
                    value={formData.lastName}
                    onIonInput={(e) =>
                      updateField("lastName", String(e.detail.value ?? ""))
                    }
                  />
                </IonItem>
                
                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Teléfono</IonLabel>
                  <IonInput
                    type="tel"
                    required
                    value={formData.phone}
                    onIonInput={(e) =>
                      updateField("phone", String(e.detail.value ?? ""))
                    }
                  />
                </IonItem>

                <IonItem className="register-item" lines="inset">
                  <IonLabel position="stacked">Rol</IonLabel>
                  <IonSelect
                    interface="popover"
                    required
                    value={formData.role}
                    placeholder="Selecciona un rol"
                    onIonChange={(e) =>
                      updateField(
                        "role",
                        String(e.detail.value ?? "") as RegisterRequest["role"],
                      )
                    }
                  >
                    <IonSelectOption value="ADMINISTRADOR">
                      ADMINISTRADOR
                    </IonSelectOption>
                    <IonSelectOption value="VETERINARIO">
                      VETERINARIO
                    </IonSelectOption>
                    <IonSelectOption value="ASISTENTE">
                      ASISTENTE
                    </IonSelectOption>
                    <IonSelectOption value="DUENO">DUEÑO</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>
                
              {error && (
                <IonText color="danger">
                  <p className="register-error">{error}</p>
                </IonText>
              )}

              <IonButton expand="block" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Usuario"}
              </IonButton>

              <div className="register-login-link">
                <p>¿Ya tienes una cuenta?</p>
                <Link to="/login">Inicia Sesión</Link>
              </div>
            </fieldset>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
