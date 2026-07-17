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
import { CreateOwnerRequest } from "../../contracts/ownerContract";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserItem,
} from "../../contracts/userContract";
import { createOwner, findAllOwners } from "../../services/ownerService";
import {
  createUser,
  deleteUser,
  findUsersCatalog,
  toggleUserStatus,
  updateUser,
} from "../../services/userService";
import { UserRole } from "../../types/userRole";
import { useHistory, useLocation } from "react-router-dom";
import "./Users.css";

const roleOptions: UserRole[] = [
  "ADMINISTRADOR",
  "VETERINARIO",
  "ASISTENTE",
  "DUENO",
];

const initialFormData: CreateUserRequest = {
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
};

const initialOwnerExtraData = {
  dni: "",
  address: "",
};

function getFullName(user: UserItem) {
  return `${user.firstName} ${user.lastName}`.trim();
}

function getRoleLabel(role: UserRole) {
  return role === "DUENO" ? "DUEÑO" : role;
}

function matchesOwnerUser(owner: { nombre: string; apellido: string; email: string }, user: UserItem) {
  const matchesEmail =
    owner.email.trim().length > 0 &&
    owner.email.toLowerCase() === user.email.toLowerCase();
  const matchesName =
    owner.nombre.toLowerCase() === user.firstName.toLowerCase() &&
    owner.apellido.toLowerCase() === user.lastName.toLowerCase();

  return matchesEmail || matchesName;
}

const Users: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [listSource, setListSource] = useState<"general" | "veterinarians">(
    "general",
  );
  const [supportsFullCrud, setSupportsFullCrud] = useState(true);
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
  const [ownerExtraData, setOwnerExtraData] = useState(initialOwnerExtraData);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setError("");

      const usersCatalog = await findUsersCatalog();
      setUsers(usersCatalog.items);
      setListSource(usersCatalog.source);
      setSupportsFullCrud(usersCatalog.supportsFullCrud);

      if (!usersCatalog.supportsFullCrud) {
        setError(
          "El backend actual no expone el catálogo general de usuarios. Se mostrará solo la lista de veterinarios disponible.",
        );
      }
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldCreateOwner = params.get("crearDueno") === "true";

    if (!shouldCreateOwner) {
      return;
    }

    setFormError("");
    setEditingUserId(null);
    setFormData({
      ...initialFormData,
      role: "DUENO",
    });
    setOwnerExtraData(initialOwnerExtraData);
    setIsFormVisible(true);
    history.replace("/app/usuarios");
  }, [history, location.search]);

  function updateField<K extends keyof CreateUserRequest>(
    field: K,
    value: CreateUserRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateOwnerExtraField<
    K extends keyof typeof initialOwnerExtraData,
  >(field: K, value: (typeof initialOwnerExtraData)[K]) {
    setOwnerExtraData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const isOwnerForm = formData.role === "DUENO";

  function resetForm() {
    setEditingUserId(null);
    setFormError("");
    setFormData(initialFormData);
    setOwnerExtraData(initialOwnerExtraData);
    setIsFormVisible(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
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

    if (
      editingUserId === null &&
      isOwnerForm &&
      (!ownerExtraData.dni.trim() || !ownerExtraData.address.trim())
    ) {
      setFormError("Completa DNI y dirección para registrar al dueño.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      const payload = {
        ...formData,
      };

      if (editingUserId !== null) {
        await updateUser(editingUserId, payload as UpdateUserRequest);
        await loadUsers();
      } else {
        const createdUser = await createUser(payload);

        if (payload.role === "DUENO") {
          const ownerPayload: CreateOwnerRequest = {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            password: payload.password,
            phone: payload.phone,
            dni: ownerExtraData.dni.trim(),
            address: ownerExtraData.address.trim(),
            userId: createdUser.id,
          };

          try {
            await createOwner(ownerPayload);
          } catch (ownerError) {
            console.error("No se pudo registrar el dueño asociado:", ownerError);
            throw new Error(
              "Se creó el usuario, pero falló el registro del dueño asociado.",
            );
          }
        }

        if (!supportsFullCrud && createdUser.role !== "VETERINARIO") {
          setUsers((current) => [createdUser, ...current]);
        } else {
          await loadUsers();
        }
      }

      resetForm();
    } catch (err) {
      console.error("No se pudo guardar el usuario:", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el usuario. Inténtalo nuevamente.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStartEdit(user: UserItem) {
    try {
      setIsSubmittingAction(user.id);
      setFormError("");
      setFormData({
        password: "",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });

      if (user.role === "DUENO") {
        const owners = await findAllOwners();
        const matchedOwner = owners.find((owner) => matchesOwnerUser(owner, user));

        setOwnerExtraData({
          dni: matchedOwner?.dni ?? "",
          address: matchedOwner?.direccion ?? "",
        });
      } else {
        setOwnerExtraData(initialOwnerExtraData);
      }

      setEditingUserId(user.id);
      setIsFormVisible(true);
    } catch (err) {
      console.error("No se pudo cargar la información adicional del dueño:", err);
      setOwnerExtraData(initialOwnerExtraData);
      setEditingUserId(user.id);
      setIsFormVisible(true);
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleToggleStatus(user: UserItem) {
    try {
      setIsSubmittingAction(user.id);
      setError("");
      await toggleUserStatus(user);
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
      `¿Deseas eliminar al usuario "${getFullName(user)}"?`,
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
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el usuario.",
      );
    } finally {
      setIsSubmittingAction(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        loweredQuery.length === 0 ||
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
              {listSource === "veterinarians" && (
                <p>
                  Vista de compatibilidad: el backend actual solo confirmó el
                  catálogo de veterinarios.
                </p>
              )}
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
                  {!supportsFullCrud && editingUserId !== null && (
                    <p>
                      La edición completa depende de una ruta heredada que el
                      backend actual podría no exponer.
                    </p>
                  )}
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
                    label="Teléfono"
                    labelPlacement="stacked"
                    value={formData.phone}
                    onIonInput={(event) =>
                      updateField(
                        "phone",
                        String(event.detail.value ?? "").slice(0, 9),
                      )
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
                        {getRoleLabel(role)}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  {isOwnerForm && (
                    <>
                      <IonInput
                        className="users-field"
                        fill="outline"
                        label="DNI"
                        labelPlacement="stacked"
                        value={ownerExtraData.dni}
                        onIonInput={(event) =>
                          updateOwnerExtraField(
                            "dni",
                            String(event.detail.value ?? "").slice(0, 8),
                          )
                        }
                      />

                      <IonInput
                        className="users-field users-field--full"
                        fill="outline"
                        label="Dirección"
                        labelPlacement="stacked"
                        value={ownerExtraData.address}
                        onIonInput={(event) =>
                          updateOwnerExtraField(
                            "address",
                            String(event.detail.value ?? ""),
                          )
                        }
                      />
                    </>
                  )}
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
                placeholder="Buscar por nombre, correo o teléfono..."
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
                    {getRoleLabel(role)}
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
                          <td>{getFullName(user)}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>{getRoleLabel(user.role)}</td>
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
                                disabled={
                                  isSubmittingAction === user.id ||
                                  !supportsFullCrud
                                }
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
                                disabled={
                                  isSubmittingAction === user.id ||
                                  !supportsFullCrud
                                }
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

                      <h2>{getFullName(user)}</h2>

                      <div className="users-mobile-card__meta">
                        <span>{getRoleLabel(user.role)}</span>
                        <strong>{user.phone}</strong>
                      </div>

                      <div className="users-mobile-card__email">{user.email}</div>

                      <div className="users-actions">
                        <button
                          className="users-action users-action--edit"
                          type="button"
                          onClick={() => handleStartEdit(user)}
                          disabled={
                            isSubmittingAction === user.id || !supportsFullCrud
                          }
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
                          disabled={
                            isSubmittingAction === user.id || !supportsFullCrud
                          }
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
