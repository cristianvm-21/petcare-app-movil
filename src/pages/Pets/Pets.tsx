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
  trashOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import {
  createPet,
  deletePet,
  findAllPets,
  findPetById,
  findPetOwnerPrincipal,
  findPetsByOwnerId,
  togglePetStatus,
  updatePet,
} from "../../services/petService";
import {
  CreatePetRequest,
  PetItem,
  UpdatePetRequest,
} from "../../contracts/petContract";
import { OwnerItem } from "../../contracts/ownerContract";
import { findAllOwners } from "../../services/ownerService";
import "./Pets.css";

const initialFormData: CreatePetRequest = {
  name: "",
  species: "",
  breed: "",
  gender: "",
  birthDate: "",
  microchip: "",
  reproductiveCondition: "",
  allergies: "",
  chronicDiseases: "",
  medicalAlerts: "",
  ownerId: 0,
  ownerRelation: "",
};

const ownerRelationOptions = ["Propietario", "Encargado"] as const;

const Pets: React.FC = () => {
  const [pets, setPets] = useState<PetItem[]>([]);
  const [owners, setOwners] = useState<OwnerItem[]>([]);
  const [query, setQuery] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("0");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnersLoading, setIsOwnersLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<CreatePetRequest>(initialFormData);

  function getOwnerFullName(owner: OwnerItem) {
    return `${owner.nombre} ${owner.apellido}`.trim();
  }

  async function loadPets(selectedOwnerId?: number) {
    try {
      setIsLoading(true);
      setError("");

      const petsData = selectedOwnerId && selectedOwnerId > 0
        ? await findPetsByOwnerId(selectedOwnerId)
        : await findAllPets();
      setPets(petsData);
    } catch (err) {
      console.error("No se pudieron cargar las mascotas:", err);
      setError("No se pudieron cargar las mascotas del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadOwners() {
    try {
      setIsOwnersLoading(true);

      const ownersData = await findAllOwners();
      setOwners(ownersData.filter((owner) => owner.activo));
    } catch (err) {
      console.error("No se pudieron cargar los dueños:", err);
      setError("No se pudieron cargar los dueños para el filtro.");
    } finally {
      setIsOwnersLoading(false);
    }
  }

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    const selectedOwnerId = Number(ownerFilter);
    loadPets(selectedOwnerId > 0 ? selectedOwnerId : undefined);
  }, [ownerFilter]);

  function updateField<K extends keyof CreatePetRequest>(
    field: K,
    value: CreatePetRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.species.trim() ||
      !formData.breed.trim() ||
      !formData.gender.trim() ||
      !formData.birthDate.trim() ||
      !formData.reproductiveCondition.trim() ||
      !formData.ownerRelation.trim()
    ) {
      setFormError("Completa los campos principales de la mascota.");
      return;
    }

    if (formData.ownerId <= 0) {
      setFormError("El ID del dueño debe ser mayor que cero.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingPetId !== null) {
        await updatePet(editingPetId, formData as UpdatePetRequest);
      } else {
        await createPet(formData);
      }

      setFormData(initialFormData);
      setEditingPetId(null);
      setIsFormVisible(false);
      await loadPets();
    } catch (err) {
      console.error("No se pudo guardar la mascota:", err);
      setFormError("No se pudo guardar la mascota. Inténtalo nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStartEdit(pet: PetItem) {
    try {
      setIsSubmittingAction(pet.id);
      setFormError("");

      const petDetail = await findPetById(pet.id);
      const ownerPrincipal = await findPetOwnerPrincipal(pet.id);

      setEditingPetId(pet.id);
      setFormData({
        name: petDetail.nombre,
        species: petDetail.especie,
        breed: petDetail.raza,
        gender: petDetail.sexo,
        birthDate: petDetail.fechaNacimiento,
        microchip: petDetail.microchip,
        reproductiveCondition: petDetail.condicionReproductiva,
        allergies: petDetail.alergias,
        chronicDiseases: petDetail.enfermedadesCronicas,
        medicalAlerts: petDetail.alertasMedicas,
        ownerId: ownerPrincipal.id,
        ownerRelation: "",
      });
      setIsFormVisible(true);
    } catch (err) {
      console.error("No se pudo cargar el detalle de la mascota:", err);
      setError("No se pudo cargar el detalle de la mascota para editar.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleToggleStatus(pet: PetItem) {
    try {
      setIsSubmittingAction(pet.id);
      await togglePetStatus(pet.id);
      await loadPets();
    } catch (err) {
      console.error("No se pudo cambiar el estado de la mascota:", err);
      setError("No se pudo cambiar el estado de la mascota.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleDeletePet(pet: PetItem) {
    const confirmed = window.confirm(
      `¿Deseas eliminar la mascota "${pet.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmittingAction(pet.id);
      await deletePet(pet.id);
      await loadPets();
    } catch (err) {
      console.error("No se pudo eliminar la mascota:", err);
      setError("No se pudo eliminar la mascota.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  const filteredPets = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return pets.filter((pet) => {
      const matchesQuery =
        loweredQuery.length === 0 ||
        pet.nombre.toLowerCase().includes(loweredQuery) ||
        pet.especie.toLowerCase().includes(loweredQuery) ||
        pet.raza.toLowerCase().includes(loweredQuery) ||
        pet.microchip.toLowerCase().includes(loweredQuery);

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && pet.activo) ||
        (statusFilter === "inactivos" && !pet.activo);

      return matchesQuery && matchesStatus;
    });
  }, [pets, query, statusFilter]);

  return (
    <IonPage>
      <AppHeader title="Mascotas" />
      <IonContent>
        <div className="pets-screen">
          <section className="pets-hero">
            <div>
              <div className="pets-hero__title-row">
                <IonIcon icon={listOutline} />
                <h1>Mascotas</h1>
              </div>
              <p>Gestiona el registro, estado y datos principales de las mascotas.</p>
            </div>

            <IonButton
              className="pets-hero__cta"
              onClick={() => {
                setFormError("");
                setEditingPetId(null);
                setFormData(initialFormData);
                setIsFormVisible((current) => !current);
              }}
            >
              <IonIcon icon={addOutline} slot="start" />
              Nueva Mascota
            </IonButton>
          </section>

          {isFormVisible && (
            <section className="pets-form-card">
              <div className="pets-form-card__header">
                <div>
                  <h2>
                    {editingPetId !== null
                      ? "Editar mascota"
                      : "Registrar nueva mascota"}
                  </h2>
                  <p>
                    {editingPetId !== null
                      ? "Actualiza la información principal de la mascota."
                      : "Completa los campos para registrar una mascota."}
                  </p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="pets-form-card__close"
                  fill="clear"
                  onClick={() => {
                    setFormError("");
                    setEditingPetId(null);
                    setFormData(initialFormData);
                    setIsFormVisible(false);
                  }}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="pets-form" onSubmit={handleSubmit}>
                <div className="pets-form__grid">
                  <IonInput
                    className="pets-field"
                    fill="outline"
                    label="Nombre"
                    labelPlacement="stacked"
                    value={formData.name}
                    onIonInput={(event) =>
                      updateField("name", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="pets-field"
                    fill="outline"
                    label="Especie"
                    labelPlacement="stacked"
                    value={formData.species}
                    onIonInput={(event) =>
                      updateField("species", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="pets-field"
                    fill="outline"
                    label="Raza"
                    labelPlacement="stacked"
                    value={formData.breed}
                    onIonInput={(event) =>
                      updateField("breed", String(event.detail.value ?? ""))
                    }
                  />

                  <IonSelect
                    className="pets-field pets-field--select"
                    interface="popover"
                    value={formData.gender}
                    placeholder="Sexo"
                    onIonChange={(event) =>
                      updateField("gender", String(event.detail.value ?? ""))
                    }
                  >
                    <IonSelectOption value="MACHO">MACHO</IonSelectOption>
                    <IonSelectOption value="HEMBRA">HEMBRA</IonSelectOption>
                  </IonSelect>

                  <IonInput
                    className="pets-field"
                    fill="outline"
                    label="Fecha de nacimiento"
                    labelPlacement="stacked"
                    type="date"
                    value={formData.birthDate}
                    onIonInput={(event) =>
                      updateField("birthDate", String(event.detail.value ?? ""))
                    }
                  />

                  <IonInput
                    className="pets-field"
                    fill="outline"
                    label="Microchip"
                    labelPlacement="stacked"
                    value={formData.microchip}
                    onIonInput={(event) =>
                      updateField("microchip", String(event.detail.value ?? ""))
                    }
                  />

                  <div className="pets-form__triple-row">
                    <IonSelect
                      className="pets-field pets-field--select pets-field--select-wide"
                      interface="popover"
                      value={formData.ownerId || undefined}
                      placeholder={
                        isOwnersLoading
                          ? "Cargando dueños..."
                          : "Selecciona un dueño"
                      }
                      onIonChange={(event) =>
                        updateField("ownerId", Number(event.detail.value ?? 0))
                      }
                    >
                      {owners.map((owner) => (
                        <IonSelectOption key={owner.id} value={owner.id}>
                          {getOwnerFullName(owner)}
                        </IonSelectOption>
                      ))}
                    </IonSelect>

                    <IonSelect
                      className="pets-field pets-field--select pets-field--select-wide"
                      interface="popover"
                      value={formData.ownerRelation}
                      placeholder="Relación con el dueño"
                      onIonChange={(event) =>
                        updateField(
                          "ownerRelation",
                          String(event.detail.value ?? ""),
                        )
                      }
                    >
                      {ownerRelationOptions.map((relation) => (
                        <IonSelectOption key={relation} value={relation}>
                          {relation}
                        </IonSelectOption>
                      ))}
                    </IonSelect>

                    <IonSelect
                      className="pets-field pets-field--select pets-field--select-wide"
                      interface="popover"
                      value={formData.reproductiveCondition}
                      placeholder="Condición reproductiva"
                      onIonChange={(event) =>
                        updateField(
                          "reproductiveCondition",
                          String(event.detail.value ?? ""),
                        )
                      }
                    >
                      <IonSelectOption value="ENTERO">ENTERO</IonSelectOption>
                      <IonSelectOption value="ESTERILIZADO">
                        ESTERILIZADO
                      </IonSelectOption>
                      <IonSelectOption value="CASTRADO">CASTRADO</IonSelectOption>
                    </IonSelect>
                  </div>
                </div>

                <IonTextarea
                  className="pets-field"
                  fill="outline"
                  label="Alergias"
                  labelPlacement="stacked"
                  value={formData.allergies}
                  autoGrow
                  onIonInput={(event) =>
                    updateField("allergies", String(event.detail.value ?? ""))
                  }
                />

                <IonTextarea
                  className="pets-field"
                  fill="outline"
                  label="Enfermedades crónicas"
                  labelPlacement="stacked"
                  value={formData.chronicDiseases}
                  autoGrow
                  onIonInput={(event) =>
                    updateField(
                      "chronicDiseases",
                      String(event.detail.value ?? ""),
                    )
                  }
                />

                <IonTextarea
                  className="pets-field"
                  fill="outline"
                  label="Alertas médicas"
                  labelPlacement="stacked"
                  value={formData.medicalAlerts}
                  autoGrow
                  onIonInput={(event) =>
                    updateField(
                      "medicalAlerts",
                      String(event.detail.value ?? ""),
                    )
                  }
                />

                {formError && (
                  <IonText color="danger">
                    <p className="pets-feedback">{formError}</p>
                  </IonText>
                )}

                <div className="pets-form__actions">
                  <IonButton
                    fill="outline"
                    type="button"
                    onClick={() => {
                      setEditingPetId(null);
                      setFormData(initialFormData);
                      setFormError("");
                      setIsFormVisible(false);
                    }}
                  >
                    Cancelar
                  </IonButton>

                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving
                      ? "Guardando..."
                      : editingPetId !== null
                        ? "Actualizar mascota"
                        : "Guardar mascota"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="pets-table-card">
            <div className="pets-filters">
              <IonInput
                className="pets-field"
                fill="outline"
                placeholder="Buscar por nombre, especie o microchip..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="pets-field pets-field--select"
                interface="popover"
                value={ownerFilter}
                onIonChange={(event) =>
                  setOwnerFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">Todos los dueños</IonSelectOption>
                {owners.map((owner) => (
                  <IonSelectOption key={owner.id} value={String(owner.id)}>
                    {getOwnerFullName(owner)}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <IonSelect
                className="pets-field pets-field--select"
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
                <p className="pets-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="pets-loading">
                <IonSpinner name="crescent" />
                <span>Cargando mascotas...</span>
              </div>
            ) : (
              <>
                <div className="pets-table-wrapper">
                  <table className="pets-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Especie</th>
                        <th>Raza</th>
                        <th>Sexo</th>
                        <th>Condición Reproductiva</th>
                        <th>Microchip</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPets.map((pet, index) => (
                        <tr key={pet.id}>
                          <td>{index + 1}</td>
                          <td>{pet.nombre}</td>
                          <td>{pet.especie}</td>
                          <td>{pet.raza}</td>
                          <td>{pet.sexo}</td>
                          <td>{pet.condicionReproductiva}</td>
                          <td>{pet.microchip || "Sin registro"}</td>
                          <td>
                            <span
                              className={`pets-status ${pet.activo ? "pets-status--active" : "pets-status--paused"}`}
                            >
                              {pet.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            <div className="pets-actions">
                              <button
                                className="pets-action pets-action--edit"
                                type="button"
                                onClick={() => handleStartEdit(pet)}
                                disabled={isSubmittingAction === pet.id}
                              >
                                <IonIcon icon={pencilOutline} />
                              </button>
                              <button
                                className="pets-action pets-action--pause"
                                type="button"
                                onClick={() => handleToggleStatus(pet)}
                                disabled={isSubmittingAction === pet.id}
                              >
                                <IonIcon
                                  icon={pet.activo ? pauseOutline : playOutline}
                                />
                              </button>
                              <button
                                className="pets-action pets-action--delete"
                                type="button"
                                onClick={() => handleDeletePet(pet)}
                                disabled={isSubmittingAction === pet.id}
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

                <div className="pets-mobile-list">
                  {filteredPets.map((pet, index) => (
                    <article className="pets-mobile-card" key={pet.id}>
                      <div className="pets-mobile-card__top">
                        <span className="pets-mobile-card__index">#{index + 1}</span>
                        <span
                          className={`pets-status ${pet.activo ? "pets-status--active" : "pets-status--paused"}`}
                        >
                          {pet.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <h2>{pet.nombre}</h2>
                      <p>
                        {pet.especie} · {pet.raza}
                      </p>

                      <div className="pets-mobile-card__meta">
                        <span>{`${pet.sexo} · ${pet.condicionReproductiva}`}</span>
                        <strong>{pet.microchip || "Sin microchip"}</strong>
                      </div>

                      <div className="pets-actions">
                        <button
                          className="pets-action pets-action--edit"
                          type="button"
                          onClick={() => handleStartEdit(pet)}
                          disabled={isSubmittingAction === pet.id}
                        >
                          <IonIcon icon={pencilOutline} />
                        </button>
                        <button
                          className="pets-action pets-action--pause"
                          type="button"
                          onClick={() => handleToggleStatus(pet)}
                          disabled={isSubmittingAction === pet.id}
                        >
                          <IonIcon
                            icon={pet.activo ? pauseOutline : playOutline}
                          />
                        </button>
                        <button
                          className="pets-action pets-action--delete"
                          type="button"
                          onClick={() => handleDeletePet(pet)}
                          disabled={isSubmittingAction === pet.id}
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <footer className="pets-footer">
                  Total de mascotas: {filteredPets.length}
                </footer>
              </>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Pets;
