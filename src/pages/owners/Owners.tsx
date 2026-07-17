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
  IonTextarea,
} from "@ionic/react";
import {
  addOutline,
  closeOutline,
  listOutline,
  pauseOutline,
  pencilOutline,
  playOutline,
  searchOutline,
  peopleOutline,
  trashOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import {
  CreateOwnerContactRequest,
  CreateOwnerRequest,
  OwnerContactItem,
  OwnerItem,
  UpdateOwnerRequest,
} from "../../contracts/ownerContract";
import { UserItem } from "../../contracts/userContract";
import {
  createOwner,
  createOwnerContact,
  deleteOwner,
  deleteOwnerContact,
  findAllOwners,
  findOwnerById,
  findOwnerContacts,
  toggleOwnerStatus,
  updateOwner,
} from "../../services/ownerService";
import { findUsersByFilters } from "../../services/userService";
import "./Owners.css";

const initialOwnerFormData: CreateOwnerRequest = {
  firstName: "",
  lastName: "",
  dni: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  userId: 0,
};

const initialContactFormData: CreateOwnerContactRequest = {
  name: "",
  phone: "",
  relation: "",
};

function getOwnerFullName(owner: OwnerItem) {
  return `${owner.nombre} ${owner.apellido}`.trim() || `Dueño #${owner.id}`;
}

function resolveOwnerUserId(owner: OwnerItem, ownerUsers: UserItem[]) {
  if (owner.usuario?.id) {
    return owner.usuario.id;
  }

  const matchedUser = ownerUsers.find((user) => {
    const matchesEmail =
      owner.email.trim().length > 0 &&
      user.email.toLowerCase() === owner.email.toLowerCase();
    const matchesName =
      user.firstName.toLowerCase() === owner.nombre.toLowerCase() &&
      user.lastName.toLowerCase() === owner.apellido.toLowerCase();

    return matchesEmail || matchesName;
  });

  return matchedUser?.id ?? 0;
}

const Owners: React.FC = () => {
  const history = useHistory();
  const [owners, setOwners] = useState<OwnerItem[]>([]);
  const [query, setQuery] = useState("");
  const [ownerIdSearch, setOwnerIdSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingOwnerId, setEditingOwnerId] = useState<number | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [ownerFormData, setOwnerFormData] =
    useState<CreateOwnerRequest>(initialOwnerFormData);
  const [ownerUsers, setOwnerUsers] = useState<UserItem[]>([]);
  const [isOwnerUsersLoading, setIsOwnerUsersLoading] = useState(false);
  const [ownerUsersWarning, setOwnerUsersWarning] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<OwnerItem | null>(null);
  const [contacts, setContacts] = useState<OwnerContactItem[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [contactFormData, setContactFormData] =
    useState<CreateOwnerContactRequest>(initialContactFormData);
  const [contactFormError, setContactFormError] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<number | null>(null);

  async function loadOwners() {
    try {
      setIsLoading(true);
      setError("");

      const ownersData = await findAllOwners();
      setOwners(ownersData);
    } catch (err) {
      console.error("No se pudieron cargar los dueños:", err);
      setError("No se pudieron cargar los dueños del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadOwnerContacts(ownerId: number) {
    try {
      setIsContactsLoading(true);
      setContactsError("");

      const contactsData = await findOwnerContacts(ownerId);
      setContacts(contactsData);
    } catch (err) {
      console.error("No se pudieron cargar los contactos del dueño:", err);
      setContactsError("No se pudieron cargar los contactos del dueño.");
    } finally {
      setIsContactsLoading(false);
    }
  }

  async function loadOwnerUsers() {
    try {
      setIsOwnerUsersLoading(true);
      setOwnerUsersWarning("");

      const availableUsers = await findUsersByFilters({
        soloActivos: true,
        rol: "DUENO",
      });

      setOwnerUsers(availableUsers);
    } catch (err) {
      console.error("No se pudieron cargar los usuarios dueños:", err);
      setOwnerUsers([]);
      setOwnerUsersWarning(
        "No se pudo cargar la lista de usuarios dueños. Puedes ingresar el ID manualmente.",
      );
    } finally {
      setIsOwnerUsersLoading(false);
    }
  }

  useEffect(() => {
    loadOwners();
    loadOwnerUsers();
  }, []);

  function updateOwnerField<K extends keyof CreateOwnerRequest>(
    field: K,
    value: CreateOwnerRequest[K],
  ) {
    setOwnerFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateContactField<K extends keyof CreateOwnerContactRequest>(
    field: K,
    value: CreateOwnerContactRequest[K],
  ) {
    setContactFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleOwnerUserSelect(userId: number) {
    const selectedUser = ownerUsers.find((user) => user.id === userId);

    setOwnerFormData((current) => ({
      ...current,
      userId,
      firstName: selectedUser?.firstName ?? current.firstName,
      lastName: selectedUser?.lastName ?? current.lastName,
      email: selectedUser?.email ?? current.email,
      phone: selectedUser?.phone ?? current.phone,
    }));
  }

  function resetOwnerForm() {
    setEditingOwnerId(null);
    setFormError("");
    setOwnerFormData(initialOwnerFormData);
    setIsFormVisible(false);
  }

  function resetContactForm() {
    setContactFormError("");
    setContactFormData(initialContactFormData);
  }

  async function handleSubmitOwner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !ownerFormData.firstName.trim() ||
      !ownerFormData.lastName.trim() ||
      !ownerFormData.dni.trim() ||
      !ownerFormData.email.trim() ||
      !ownerFormData.phone.trim() ||
      !ownerFormData.address.trim()
    ) {
      setFormError("Completa todos los campos del dueño.");
      return;
    }

    if (!ownerFormData.password.trim()) {
      setFormError(
        editingOwnerId !== null
          ? "Ingresa la contraseña del usuario para actualizar el dueño."
          : "Completa todos los campos del dueño.",
      );
      return;
    }

    if (ownerFormData.userId <= 0) {
      setFormError("El usuario asociado debe tener un ID válido.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      const targetOwnerId = editingOwnerId;

      if (targetOwnerId !== null) {
        await updateOwner(targetOwnerId, ownerFormData as UpdateOwnerRequest);
      } else {
        await createOwner(ownerFormData);
      }

      resetOwnerForm();
      await loadOwners();

      if (targetOwnerId !== null && selectedOwner?.id === targetOwnerId) {
        const refreshedOwner = await findOwnerById(targetOwnerId);
        setSelectedOwner(refreshedOwner);
      }
    } catch (err) {
      console.error("No se pudo guardar el dueño:", err);
      setFormError("No se pudo guardar el dueño. Inténtalo nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSearchById() {
    if (!ownerIdSearch.trim()) {
      setSelectedOwner(null);
      setContacts([]);
      await loadOwners();
      return;
    }

    const ownerId = Number(ownerIdSearch);

    if (!Number.isInteger(ownerId) || ownerId <= 0) {
      setError("Ingresa un ID válido para buscar un dueño.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const owner = await findOwnerById(ownerId);
      setOwners([owner]);
      setSelectedOwner(owner);
      await loadOwnerContacts(owner.id);
    } catch (err) {
      console.error("No se pudo encontrar el dueño:", err);
      setOwners([]);
      setSelectedOwner(null);
      setContacts([]);
      setError("No se encontró un dueño con ese ID.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOpenContacts(owner: OwnerItem) {
    setSelectedOwner(owner);
    resetContactForm();
    await loadOwnerContacts(owner.id);
  }

  async function handleStartEdit(owner: OwnerItem) {
    try {
      setIsSubmittingAction(owner.id);
      setFormError("");

      const ownerDetail = await findOwnerById(owner.id);
      const resolvedUserId = resolveOwnerUserId(ownerDetail, ownerUsers);

      setEditingOwnerId(owner.id);
      setOwnerFormData({
        firstName: ownerDetail.nombre,
        lastName: ownerDetail.apellido,
        dni: ownerDetail.dni,
        email: ownerDetail.email,
        password: "",
        phone: ownerDetail.telefono,
        address: ownerDetail.direccion,
        userId: resolvedUserId,
      });
      setIsFormVisible(true);

      if (resolvedUserId <= 0) {
        setFormError(
          "No se pudo identificar el usuario asociado. Selecciónalo manualmente antes de guardar.",
        );
      }
    } catch (err) {
      console.error("No se pudo cargar el dueño para editar:", err);
      setError("No se pudo cargar el dueño para editar.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleToggleStatus(owner: OwnerItem) {
    try {
      setIsSubmittingAction(owner.id);
      setError("");
      await toggleOwnerStatus(owner.id);
      await loadOwners();

      if (selectedOwner?.id === owner.id) {
        const refreshedOwner = await findOwnerById(owner.id);
        setSelectedOwner(refreshedOwner);
      }
    } catch (err) {
      console.error("No se pudo cambiar el estado del dueño:", err);
      setError("No se pudo cambiar el estado del dueño.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleDeleteOwner(owner: OwnerItem) {
    const confirmed = window.confirm(
      `¿Deseas eliminar al dueño "${getOwnerFullName(owner)}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmittingAction(owner.id);
      setError("");
      await deleteOwner(owner.id);

      if (selectedOwner?.id === owner.id) {
        setSelectedOwner(null);
        setContacts([]);
      }

      await loadOwners();
    } catch (err) {
      console.error("No se pudo eliminar el dueño:", err);
      setError("No se pudo eliminar el dueño.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleSubmitContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedOwner) {
      setContactFormError("Selecciona un dueño antes de registrar contactos.");
      return;
    }

    if (
      !contactFormData.name.trim() ||
      !contactFormData.phone.trim() ||
      !contactFormData.relation.trim()
    ) {
      setContactFormError("Completa todos los campos del contacto.");
      return;
    }

    try {
      setIsSavingContact(true);
      setContactFormError("");
      await createOwnerContact(selectedOwner.id, contactFormData);
      resetContactForm();
      await loadOwnerContacts(selectedOwner.id);
    } catch (err) {
      console.error("No se pudo registrar el contacto:", err);
      setContactFormError("No se pudo registrar el contacto.");
    } finally {
      setIsSavingContact(false);
    }
  }

  async function handleDeleteContact(contact: OwnerContactItem) {
    if (!selectedOwner || !contact.id) {
      return;
    }

    const confirmed = window.confirm(
      `¿Deseas eliminar el contacto "${contact.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingContactId(contact.id);
      setContactsError("");
      await deleteOwnerContact(contact.id);
      await loadOwnerContacts(selectedOwner.id);
    } catch (err) {
      console.error("No se pudo eliminar el contacto:", err);
      setContactsError("No se pudo eliminar el contacto seleccionado.");
    } finally {
      setDeletingContactId(null);
    }
  }

  const filteredOwners = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return owners.filter((owner) => {
      const fullName = getOwnerFullName(owner).toLowerCase();
      const matchesQuery =
        loweredQuery.length === 0 ||
        fullName.includes(loweredQuery) ||
        owner.dni.toLowerCase().includes(loweredQuery) ||
        owner.email.toLowerCase().includes(loweredQuery) ||
        owner.telefono.toLowerCase().includes(loweredQuery);

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && owner.activo) ||
        (statusFilter === "inactivos" && !owner.activo);

      return matchesQuery && matchesStatus;
    });
  }, [owners, query, statusFilter]);

  return (
    <IonPage>
      <AppHeader title="Dueños" />
      <IonContent>
        <div className="owners-screen">
          <section className="owners-hero">
            <div>
              <div className="owners-hero__title-row">
                <IonIcon icon={listOutline} />
                <h1>Dueños</h1>
              </div>
              <p>
                Gestiona la información de los dueños y sus contactos asociados.
              </p>
            </div>

            <IonButton
              className="owners-hero__cta"
              onClick={() => history.push("/app/usuarios?crearDueno=true")}
            >
              <IonIcon icon={addOutline} slot="start" />
              Registrar Dueño
            </IonButton>
          </section>

          {isFormVisible && (
            <section className="owners-form-card">
              <div className="owners-form-card__header">
                <div>
                  <h2>
                    {editingOwnerId !== null
                      ? "Editar dueño"
                      : "Registrar nuevo dueño"}
                  </h2>
                  <p>
                    {editingOwnerId !== null
                      ? "Actualiza la información principal del dueño."
                      : "Completa los campos para registrar un dueño."}
                  </p>
                  {ownerUsersWarning && <p>{ownerUsersWarning}</p>}
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="owners-form-card__close"
                  fill="clear"
                  onClick={resetOwnerForm}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="owners-form" onSubmit={handleSubmitOwner}>
                <div className="owners-form__grid">
                  {ownerUsers.length > 0 ? (
                    <IonSelect
                      className="owners-field owners-field--select owners-field--full"
                      interface="popover"
                      value={ownerFormData.userId || undefined}
                      placeholder={
                        isOwnerUsersLoading
                          ? "Cargando usuarios..."
                          : "Selecciona un usuario dueño"
                      }
                      onIonChange={(event) =>
                        handleOwnerUserSelect(Number(event.detail.value ?? 0))
                      }
                    >
                      {ownerUsers
                        .filter((user) => user.role === "DUENO")
                        .map((user) => (
                          <IonSelectOption key={user.id} value={user.id}>
                            {`${user.firstName} ${user.lastName}`}
                          </IonSelectOption>
                        ))}
                    </IonSelect>
                  ) : (
                    <IonInput
                      className="owners-field owners-field--full"
                      fill="outline"
                      label="ID de usuario"
                      labelPlacement="stacked"
                      type="number"
                      min="1"
                      value={ownerFormData.userId || ""}
                      onIonInput={(event) =>
                        updateOwnerField(
                          "userId",
                          Number(event.detail.value ?? 0),
                        )
                      }
                    />
                  )}

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="Nombre"
                    labelPlacement="stacked"
                    value={ownerFormData.firstName}
                    disabled={ownerUsers.length > 0 && editingOwnerId === null}
                    onIonInput={(event) =>
                      updateOwnerField(
                        "firstName",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="Apellido"
                    labelPlacement="stacked"
                    value={ownerFormData.lastName}
                    disabled={ownerUsers.length > 0 && editingOwnerId === null}
                    onIonInput={(event) =>
                      updateOwnerField(
                        "lastName",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="DNI"
                    labelPlacement="stacked"
                    value={ownerFormData.dni}
                    onIonInput={(event) =>
                      updateOwnerField(
                        "dni",
                        String(event.detail.value ?? "").slice(0, 8),
                      )
                    }
                  />

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="Correo"
                    labelPlacement="stacked"
                    type="email"
                    value={ownerFormData.email}
                    disabled={ownerUsers.length > 0 && editingOwnerId === null}
                    onIonInput={(event) =>
                      updateOwnerField("email", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label={
                      editingOwnerId !== null
                        ? "Contraseña del usuario"
                        : "Contraseña"
                    }
                    labelPlacement="stacked"
                    type="password"
                    value={ownerFormData.password}
                    onIonInput={(event) =>
                      updateOwnerField("password", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="Teléfono"
                    labelPlacement="stacked"
                    value={ownerFormData.phone}
                    disabled={ownerUsers.length > 0 && editingOwnerId === null}
                    onIonInput={(event) =>
                      updateOwnerField("phone", String(event.detail.value ?? ""))
                    }
                  />
                </div>

                <IonTextarea
                  className="owners-field"
                  fill="outline"
                  label="Dirección"
                  labelPlacement="stacked"
                  value={ownerFormData.address}
                  autoGrow
                  onIonInput={(event) =>
                    updateOwnerField("address", String(event.detail.value ?? ""))
                  }
                />

                {formError && (
                  <IonText color="danger">
                    <p className="owners-feedback">{formError}</p>
                  </IonText>
                )}

                <div className="owners-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetOwnerForm}>
                    Cancelar
                  </IonButton>

                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving
                      ? "Guardando..."
                      : editingOwnerId !== null
                        ? "Actualizar dueño"
                        : "Guardar dueño"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="owners-table-card">
            <div className="owners-search-row">
              <IonInput
                className="owners-field"
                fill="outline"
                label="Buscar dueño por ID"
                labelPlacement="stacked"
                type="number"
                min="1"
                value={ownerIdSearch}
                onIonInput={(event) =>
                  setOwnerIdSearch(String(event.detail.value ?? ""))
                }
              />

              <div className="owners-search-row__actions">
                <IonButton onClick={handleSearchById}>
                  <IonIcon icon={searchOutline} slot="start" />
                  Buscar
                </IonButton>
                <IonButton
                  fill="outline"
                  onClick={async () => {
                    setOwnerIdSearch("");
                    setSelectedOwner(null);
                    setContacts([]);
                    await loadOwners();
                  }}
                >
                  Limpiar
                </IonButton>
              </div>
            </div>

            <div className="owners-filters">
              <IonInput
                className="owners-field"
                fill="outline"
                placeholder="Buscar por nombre, DNI, correo o teléfono..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="owners-field owners-field--select"
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
            </div>

            {error && (
              <IonText color="warning">
                <p className="owners-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="owners-loading">
                <IonSpinner name="crescent" />
                <span>Cargando dueños...</span>
              </div>
            ) : (
              <>
                <div className="owners-table-wrapper">
                  <table className="owners-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre Completo</th>
                        <th>DNI</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOwners.map((owner, index) => (
                        <tr key={owner.id}>
                          <td>{index + 1}</td>
                          <td>{getOwnerFullName(owner)}</td>
                          <td>{owner.dni}</td>
                          <td>{owner.email || "Sin correo"}</td>
                          <td>{owner.telefono}</td>
                          <td>{owner.direccion}</td>
                          <td>
                            <span
                              className={`owners-status ${owner.activo ? "owners-status--active" : "owners-status--paused"}`}
                            >
                              {owner.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            <div className="owners-actions">
                              <button
                                className="owners-action owners-action--contacts"
                                type="button"
                                onClick={() => handleOpenContacts(owner)}
                                disabled={isSubmittingAction === owner.id}
                              >
                                <IonIcon icon={peopleOutline} />
                              </button>
                              <button
                                className="owners-action owners-action--edit"
                                type="button"
                                onClick={() => handleStartEdit(owner)}
                                disabled={isSubmittingAction === owner.id}
                              >
                                <IonIcon icon={pencilOutline} />
                              </button>
                              <button
                                className="owners-action owners-action--pause"
                                type="button"
                                onClick={() => handleToggleStatus(owner)}
                                disabled={isSubmittingAction === owner.id}
                              >
                                <IonIcon
                                  icon={owner.activo ? pauseOutline : playOutline}
                                />
                              </button>
                              <button
                                className="owners-action owners-action--delete"
                                type="button"
                                onClick={() => handleDeleteOwner(owner)}
                                disabled={isSubmittingAction === owner.id}
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

                <div className="owners-mobile-list">
                  {filteredOwners.map((owner, index) => (
                    <article className="owners-mobile-card" key={owner.id}>
                      <div className="owners-mobile-card__top">
                        <span className="owners-mobile-card__index">
                          #{index + 1}
                        </span>
                        <span
                          className={`owners-status ${owner.activo ? "owners-status--active" : "owners-status--paused"}`}
                        >
                          {owner.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <h2>{getOwnerFullName(owner)}</h2>
                      <p>{owner.direccion}</p>

                      <div className="owners-mobile-card__meta">
                        <span>{owner.dni}</span>
                        <strong>{owner.telefono}</strong>
                      </div>

                      <div className="owners-mobile-card__email">
                        {owner.email || "Sin correo"}
                      </div>

                      <div className="owners-actions">
                        <button
                          className="owners-action owners-action--contacts"
                          type="button"
                          onClick={() => handleOpenContacts(owner)}
                          disabled={isSubmittingAction === owner.id}
                        >
                          <IonIcon icon={peopleOutline} />
                        </button>
                        <button
                          className="owners-action owners-action--edit"
                          type="button"
                          onClick={() => handleStartEdit(owner)}
                          disabled={isSubmittingAction === owner.id}
                        >
                          <IonIcon icon={pencilOutline} />
                        </button>
                        <button
                          className="owners-action owners-action--pause"
                          type="button"
                          onClick={() => handleToggleStatus(owner)}
                          disabled={isSubmittingAction === owner.id}
                        >
                          <IonIcon
                            icon={owner.activo ? pauseOutline : playOutline}
                          />
                        </button>
                        <button
                          className="owners-action owners-action--delete"
                          type="button"
                          onClick={() => handleDeleteOwner(owner)}
                          disabled={isSubmittingAction === owner.id}
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <footer className="owners-footer">
                  Total de dueños: {filteredOwners.length}
                </footer>
              </>
            )}
          </section>

          {selectedOwner && (
            <section className="owners-contacts-card">
              <div className="owners-contacts-card__header">
                <div>
                  <h2>Contactos de {getOwnerFullName(selectedOwner)}</h2>
                  <p>
                    Agrega o elimina los contactos asociados a este dueño.
                  </p>
                </div>
              </div>

              <form className="owners-contact-form" onSubmit={handleSubmitContact}>
                <div className="owners-contact-form__grid">
                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="Nombre del contacto"
                    labelPlacement="stacked"
                    value={contactFormData.name}
                    onIonInput={(event) =>
                      updateContactField(
                        "name",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="Teléfono"
                    labelPlacement="stacked"
                    value={contactFormData.phone}
                    onIonInput={(event) =>
                      updateContactField(
                        "phone",
                        String(event.detail.value ?? "").slice(0, 9),
                      )
                    }
                  />

                  <IonInput
                    className="owners-field"
                    fill="outline"
                    label="Relación"
                    labelPlacement="stacked"
                    value={contactFormData.relation}
                    onIonInput={(event) =>
                      updateContactField(
                        "relation",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />
                </div>

                {contactFormError && (
                  <IonText color="danger">
                    <p className="owners-feedback">{contactFormError}</p>
                  </IonText>
                )}

                <div className="owners-contact-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetContactForm}>
                    Limpiar
                  </IonButton>
                  <IonButton type="submit" disabled={isSavingContact}>
                    {isSavingContact ? "Guardando..." : "Agregar contacto"}
                  </IonButton>
                </div>
              </form>

              {contactsError && (
                <IonText color="warning">
                  <p className="owners-feedback">{contactsError}</p>
                </IonText>
              )}

              {isContactsLoading ? (
                <div className="owners-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando contactos...</span>
                </div>
              ) : contacts.length > 0 ? (
                <div className="owners-contact-list">
                  {contacts.map((contact, index) => (
                    <article
                      className="owners-contact-card"
                      key={contact.id ?? `${contact.nombre}-${index}`}
                    >
                      <h3>{contact.nombre || "Contacto sin nombre"}</h3>
                      <p>{contact.relacion || "Relación no indicada"}</p>
                      <strong>{contact.telefono || "Sin teléfono"}</strong>
                      {contact.id && (
                        <IonButton
                          color="danger"
                          fill="clear"
                          onClick={() => handleDeleteContact(contact)}
                          disabled={deletingContactId === contact.id}
                        >
                          Eliminar
                        </IonButton>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="owners-empty-contacts">
                  Este dueño todavía no tiene contactos registrados.
                </div>
              )}
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Owners;
