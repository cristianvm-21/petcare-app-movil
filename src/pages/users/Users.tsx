import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from "@ionic/react";
import {
  addOutline,
  closeOutline,
  listOutline,
  pauseOutline,
  pencilOutline,
  playOutline,
  trashOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import { CreateUserRequest, UpdateUserRequest, UserItem } from "../../contracts/userContract";
import { createUser, deleteUser, findAllUsers, toggleUserStatus, updateUser } from "../../services/userService";
import { UserRole } from "../../types/userRole";
import "./Users.css";

const roleOptions: UserRole[] = [
  "ADMINISTRADOR",
  "VETERINARIO",
  "ASISTENTE",
  "DUENO",
];

const initialFormData: CreateUserRequest = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
};

function getFullName(user: UserItem) {
  return `${user.firstName} ${user.lastName}`.trim();
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<CreateUserRequest>(initialFormData);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setError("");

      const usersData = await findAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("No se pudieron cargar los usuarios:", err);
      setError("No se pudieron cargar los usuarios del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function updateField<K extends keyof CreateUserRequest>(
    field: K,
    value: CreateUserRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingUserId(null);
    setFormError("");
    setFormData(initialFormData);
    setIsFormVisible(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.role
    ) {
      setFormError("Completa todos los campos del usuario.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingUserId !== null) {
        await updateUser(editingUserId, formData as UpdateUserRequest);
      } else {
        await createUser(formData);
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      console.error("No se pudo guardar el usuario:", err);
      setFormError("No se pudo guardar el usuario. Inténtalo nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartEdit(user: UserItem) {
    setEditingUserId(user.id);
    setFormError("");
    setFormData({
      username: user.username,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setIsFormVisible(true);
  }

  async function handleToggleStatus(user: UserItem) {
    try {
      setIsSubmittingAction(user.id);
      setError("");
      await toggleUserStatus(user.id);
      await loadUsers();
    } catch (err) {
      console.error("No se pudo cambiar el estado del usuario:", err);
      setError("No se pudo cambiar el estado del usuario.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleDeleteUser(user: UserItem) {
    const confirmed = window.confirm(
      `¿Deseas eliminar al usuario "${user.username}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmittingAction(user.id);
      setError("");
      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      console.error("No se pudo eliminar el usuario:", err);
      setError("No se pudo eliminar el usuario.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        loweredQuery.length === 0 ||
        user.username.toLowerCase().includes(loweredQuery) ||
        getFullName(user).toLowerCase().includes(loweredQuery) ||
        user.email.toLowerCase().includes(loweredQuery) ||
        user.phone.toLowerCase().includes(loweredQuery);

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && user.active) ||
        (statusFilter === "inactivos" && !user.active);

      const matchesRole =
        roleFilter === "todos" || user.role === roleFilter;

      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [users, query, statusFilter, roleFilter]);

  return (
    <IonPage>
      <AppHeader title="Usuarios" />
      <IonContent>
        <div className="users-screen">
          <section className="users-hero">
            <div>
              <div className="users-hero__title-row">
                <IonIcon icon={listOutline} />
                <h1>Usuarios</h1>
              </div>
              <p>Gestiona el acceso, rol y estado de los usuarios del sistema.</p>
            </div>

            <IonButton
              className="users-hero__cta"
              onClick={() => {
                setFormError("");
                setEditingUserId(null);
                setFormData(initialFormData);
                setIsFormVisible((current) => !current);
              }}
            >
              <IonIcon icon={addOutline} slot="start" />
              Nuevo Usuario
            </IonButton>
          </section>

          {isFormVisible && (
            <section className="users-form-card">
              <div className="users-form-card__header">
                <div>
                  <h2>
                    {editingUserId !== null
                      ? "Editar usuario"
                      : "Registrar nuevo usuario"}
                  </h2>
                  <p>
                    {editingUserId !== null
                      ? "Actualiza la información principal del usuario."
                      : "Completa los campos para registrar un usuario."}
                  </p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="users-form-card__close"
                  fill="clear"
                  onClick={resetForm}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="users-form" onSubmit={handleSubmit}>
                <div className="users-form__grid">
                  <IonInput
                    className="users-field"
                    fill="outline"
                    label="Username"
                    labelPlacement="stacked"
                    value={formData.username}
                    onIonInput={(event) =>
                      updateField("username", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="users-field"
                    fill="outline"
                    label={editingUserId !== null ? "Nueva contraseña" : "Contraseña"}
                    labelPlacement="stacked"
                    type="password"
                    value={formData.password}
                    onIonInput={(event) =>
                      updateField("password", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="users-field"
                    fill="outline"
                    label="Nombre"
                    labelPlacement="stacked"
                    value={formData.firstName}
                    onIonInput={(event) =>
                      updateField("firstName", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="users-field"
                    fill="outline"
                    label="Apellido"
                    labelPlacement="stacked"
                    value={formData.lastName}
                    onIonInput={(event) =>
                      updateField("lastName", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="users-field"
                    fill="outline"
                    label="Correo"
                    labelPlacement="stacked"
                    type="email"
                    value={formData.email}
                    onIonInput={(event) =>
                      updateField("email", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="users-field"
                    fill="outline"
                    label="Teléfono"
                    labelPlacement="stacked"
                    value={formData.phone}
                    onIonInput={(event) =>
                      updateField("phone", String(event.detail.value ?? ""))
                    }
                  />

                  <IonSelect
                    className="users-field users-field--select"
                    interface="popover"
                    value={formData.role}
                    placeholder="Rol"
                    onIonChange={(event) =>
                      updateField("role", event.detail.value as UserRole | "")
                    }
                  >
                    {roleOptions.map((role) => (
                      <IonSelectOption key={role} value={role}>
                        {role}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>

                {formError && (
                  <IonText color="danger">
                    <p className="users-feedback">{formError}</p>
                  </IonText>
                )}

                <div className="users-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetForm}>
                    Cancelar
                  </IonButton>

                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving
                      ? "Guardando..."
                      : editingUserId !== null
                        ? "Actualizar usuario"
                        : "Guardar usuario"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="users-table-card">
            <div className="users-filters">
              <IonInput
                className="users-field"
                fill="outline"
                placeholder="Buscar por username, nombre, correo o teléfono..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="users-field users-field--select"
                interface="popover"
                value={statusFilter}
                onIonChange={(event) =>
                  setStatusFilter(String(event.detail.value ?? "todos"))
                }
              >
                <IonSelectOption value="todos">Todos</IonSelectOption>
                <IonSelectOption value="activos">Activos</IonSelectOption>
                <IonSelectOption value="inactivos">Inactivos</IonSelectOption>
              </IonSelect>

              <IonSelect
                className="users-field users-field--select"
                interface="popover"
                value={roleFilter}
                onIonChange={(event) =>
                  setRoleFilter(String(event.detail.value ?? "todos"))
                }
              >
                <IonSelectOption value="todos">Todos los roles</IonSelectOption>
                {roleOptions.map((role) => (
                  <IonSelectOption key={role} value={role}>
                    {role}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            {error && (
              <IonText color="warning">
                <p className="users-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="users-loading">
                <IonSpinner name="crescent" />
                <span>Cargando usuarios...</span>
              </div>
            ) : (
              <>
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Nombre Completo</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr key={user.id}>
                          <td>{index + 1}</td>
                          <td>{user.username}</td>
                          <td>{getFullName(user)}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>{user.role}</td>
                          <td>
                            <span
                              className={`users-status ${user.active ? "users-status--active" : "users-status--paused"}`}
                            >
                              {user.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            <div className="users-actions">
                              <button
                                className="users-action users-action--edit"
                                type="button"
                                onClick={() => handleStartEdit(user)}
                                disabled={isSubmittingAction === user.id}
                              >
                                <IonIcon icon={pencilOutline} />
                              </button>
                              <button
                                className="users-action users-action--pause"
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                disabled={isSubmittingAction === user.id}
                              >
                                <IonIcon
                                  icon={user.active ? pauseOutline : playOutline}
                                />
                              </button>
                              <button
                                className="users-action users-action--delete"
                                type="button"
                                onClick={() => handleDeleteUser(user)}
                                disabled={isSubmittingAction === user.id}
                              >
                                <IonIcon icon={trashOutline} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="users-mobile-list">
                  {filteredUsers.map((user, index) => (
                    <article className="users-mobile-card" key={user.id}>
                      <div className="users-mobile-card__top">
                        <span className="users-mobile-card__index">#{index + 1}</span>
                        <span
                          className={`users-status ${user.active ? "users-status--active" : "users-status--paused"}`}
                        >
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <h2>{user.username}</h2>
                      <p>{getFullName(user)}</p>

                      <div className="users-mobile-card__meta">
                        <span>{user.role}</span>
                        <strong>{user.phone}</strong>
                      </div>

                      <div className="users-mobile-card__email">{user.email}</div>

                      <div className="users-actions">
                        <button
                          className="users-action users-action--edit"
                          type="button"
                          onClick={() => handleStartEdit(user)}
                          disabled={isSubmittingAction === user.id}
                        >
                          <IonIcon icon={pencilOutline} />
                        </button>
                        <button
                          className="users-action users-action--pause"
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isSubmittingAction === user.id}
                        >
                          <IonIcon
                            icon={user.active ? pauseOutline : playOutline}
                          />
                        </button>
                        <button
                          className="users-action users-action--delete"
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isSubmittingAction === user.id}
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <footer className="users-footer">
                  Total de usuarios: {filteredUsers.length}
                </footer>
              </>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Users;
