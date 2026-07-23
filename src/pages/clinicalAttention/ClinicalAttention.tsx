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
import { AxiosError } from "axios";
import {
  addOutline,
  closeOutline,
  eyeOutline,
  fitnessOutline,
  pencilOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUserRole } from "../../auth/session";
import AppHeader from "../../components/AppHeader/AppHeader";
import { AppointmentItem } from "../../contracts/appointmentContract";
import {
  ClinicalAttentionItem,
  CreateClinicalAttentionRequest,
  UpdateClinicalAttentionRequest,
} from "../../contracts/clinicalAttentionContract";
import { OwnerItem } from "../../contracts/ownerContract";
import { PetItem } from "../../contracts/petContract";
import {
  CreatePrescriptionDetailRequest,
  CreatePrescriptionRequest,
  PrescriptionItem,
} from "../../contracts/prescriptionContract";
import {
  CreateTreatmentPlanActivityRequest,
  CreateTreatmentPlanRequest,
  TreatmentPlanItem,
} from "../../contracts/treatmentPlanContract";
import {
  CreateFollowUpRequest,
  FollowUpItem,
} from "../../contracts/followUpContract";
import { TriageItem } from "../../contracts/triageContract";
import { VetServiceItem } from "../../contracts/vetServiceContract";
import { WaitingRoomItem } from "../../contracts/waitingRoomContract";
import {
  createClinicalAttention,
  findAllClinicalAttentions,
  findClinicalAttentionById,
  findClinicalAttentionsByAppointmentId,
  findClinicalAttentionsByPetId,
  updateClinicalAttention,
} from "../../services/clinicalAttentionService";
import { findAllAppointments } from "../../services/appointmentService";
import { findAllPets } from "../../services/petService";
import {
  createPrescription,
  findPrescriptionById,
  findPrescriptionsByAttentionId,
  updatePrescription,
} from "../../services/prescriptionService";
import {
  createTreatmentPlan,
  findTreatmentPlanById,
  findTreatmentPlansByAttentionId,
  updateTreatmentPlan,
  updateTreatmentPlanStatus,
} from "../../services/treatmentPlanService";
import {
  cancelFollowUp,
  completeFollowUp,
  createFollowUp,
  findFollowUpsByAttentionId,
} from "../../services/followUpService";
import { findPetOwnerPrincipal } from "../../services/petService";
import { findAllTriages } from "../../services/triageService";
import { findAllVetServices } from "../../services/vetCatalogService";
import { findWaitingRoomEntries } from "../../services/waitingRoomService";
import "./ClinicalAttention.css";

const initialFormData: CreateClinicalAttentionRequest = {
  appointmentId: 0,
  reasonForConsultation: "",
  symptoms: "",
  diagnosis: "",
  clinicalObservations: "",
  treatment: "",
  triageId: 0,
};

const initialPrescriptionDetail: CreatePrescriptionDetailRequest = {
  medicamento: "",
  presentacion: "",
  dosis: "",
  frecuencia: "",
  duracion: "",
  viaAdministracion: "",
  indicaciones: "",
};

const initialPrescriptionFormData: CreatePrescriptionRequest = {
  diagnostico: "",
  notasAdicionales: "",
  veterinarioId: 0,
  detalles: [{ ...initialPrescriptionDetail }],
};

const treatmentPlanStatuses = ["ACTIVO", "COMPLETADO", "SUSPENDIDO"] as const;

const initialTreatmentPlanActivity: CreateTreatmentPlanActivityRequest = {
  tipo: "",
  descripcion: "",
  fechaProgramada: "",
  horaProgramada: "",
  frecuencia: "",
  responsable: "",
  observaciones: "",
};

const initialTreatmentPlanFormData: CreateTreatmentPlanRequest = {
  titulo: "",
  descripcion: "",
  fechaInicio: "",
  fechaFinEstimada: "",
  veterinarioId: 0,
  actividades: [{ ...initialTreatmentPlanActivity }],
};

const initialFollowUpFormData: CreateFollowUpRequest = {
  veterinarioId: 0,
  tipo: "",
  fechaProgramada: "",
  motivo: "",
};

function formatDateTime(value: string) {
  if (!value) {
    return "Sin fecha";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  });
}

function getAppointmentPetName(appointment: AppointmentItem, pets: PetItem[]) {
  return (
    appointment.mascota.nombre ||
    pets.find((pet) => pet.id === appointment.mascota.id)?.nombre ||
    `Mascota #${appointment.mascota.id}`
  );
}

function getAppointmentServiceName(
  appointment: AppointmentItem,
  services: VetServiceItem[],
) {
  return (
    appointment.servicio.nombre ||
    services.find((service) => service.id === appointment.servicio.id)?.nombre ||
    `Servicio #${appointment.servicio.id}`
  );
}

function getAppointmentLabel(
  appointment: AppointmentItem,
  pets: PetItem[],
  services: VetServiceItem[],
) {
  return `${getAppointmentPetName(appointment, pets)} · ${getAppointmentServiceName(
    appointment,
    services,
  )} · ${formatDateTime(appointment.fechaHora)}`;
}

function getAppointmentSummary(
  appointment: AppointmentItem,
  services: VetServiceItem[],
) {
  return `${getAppointmentServiceName(appointment, services)} · ${formatDateTime(
    appointment.fechaHora,
  )}`;
}

function renderAppointmentSummary(
  appointment: AppointmentItem | undefined,
  services: VetServiceItem[],
  fallbackAppointmentId: number,
) {
  if (!appointment) {
    return <span>{`Cita #${fallbackAppointmentId}`}</span>;
  }

  return (
    <span className="clinical-attention-appointment-summary">
      <span className="clinical-attention-appointment-summary__service">
        {getAppointmentServiceName(appointment, services)}
      </span>
      <span className="clinical-attention-appointment-summary__datetime">
        {formatDateTime(appointment.fechaHora)}
      </span>
    </span>
  );
}

function getAppointmentVeterinarianName(appointment: AppointmentItem) {
  const fullName =
    `${appointment.veterinario.nombre ?? ""} ${appointment.veterinario.apellido ?? ""}`.trim();

  return fullName || appointment.veterinario.email || `Veterinario #${appointment.veterinario.id}`;
}

function getClinicalAttentionErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const responseData = error.response?.data;
  const backendMessage =
    (typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message) ||
    (typeof responseData === "object" &&
      responseData !== null &&
      "detail" in responseData &&
      typeof responseData.detail === "string" &&
      responseData.detail) ||
    (typeof responseData === "string" ? responseData : "");

  return backendMessage || fallback;
}

const ClinicalAttention: React.FC = () => {
  const currentRole = getCurrentUserRole();
  const canManageClinicalAttention = currentRole === "VETERINARIO";
  const [clinicalAttentions, setClinicalAttentions] = useState<
    ClinicalAttentionItem[]
  >([]);
  const [allClinicalAttentions, setAllClinicalAttentions] = useState<
    ClinicalAttentionItem[]
  >([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [triages, setTriages] = useState<TriageItem[]>([]);
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [waitingRoomEntries, setWaitingRoomEntries] = useState<WaitingRoomItem[]>(
    [],
  );
  const [query, setQuery] = useState("");
  const [petFilter, setPetFilter] = useState("0");
  const [appointmentFilter, setAppointmentFilter] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isDependenciesLoading, setIsDependenciesLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [editingAttentionId, setEditingAttentionId] = useState<number | null>(null);
  const [selectedAttention, setSelectedAttention] =
    useState<ClinicalAttentionItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [formData, setFormData] =
    useState<CreateClinicalAttentionRequest>(initialFormData);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionItem | null>(null);
  const [isPrescriptionLoading, setIsPrescriptionLoading] = useState(false);
  const [isPrescriptionSaving, setIsPrescriptionSaving] = useState(false);
  const [isPrescriptionFormVisible, setIsPrescriptionFormVisible] =
    useState(false);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    number | null
  >(null);
  const [prescriptionError, setPrescriptionError] = useState("");
  const [prescriptionFormError, setPrescriptionFormError] = useState("");
  const [prescriptionFormData, setPrescriptionFormData] =
    useState<CreatePrescriptionRequest>(initialPrescriptionFormData);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlanItem[]>([]);
  const [selectedTreatmentPlan, setSelectedTreatmentPlan] =
    useState<TreatmentPlanItem | null>(null);
  const [isTreatmentPlanLoading, setIsTreatmentPlanLoading] = useState(false);
  const [isTreatmentPlanSaving, setIsTreatmentPlanSaving] = useState(false);
  const [isTreatmentPlanFormVisible, setIsTreatmentPlanFormVisible] =
    useState(false);
  const [editingTreatmentPlanId, setEditingTreatmentPlanId] = useState<
    number | null
  >(null);
  const [updatingTreatmentPlanStatusId, setUpdatingTreatmentPlanStatusId] =
    useState<number | null>(null);
  const [treatmentPlanError, setTreatmentPlanError] = useState("");
  const [treatmentPlanFormError, setTreatmentPlanFormError] = useState("");
  const [treatmentPlanFormData, setTreatmentPlanFormData] =
    useState<CreateTreatmentPlanRequest>(initialTreatmentPlanFormData);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpItem | null>(
    null,
  );
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [isFollowUpSaving, setIsFollowUpSaving] = useState(false);
  const [isFollowUpFormVisible, setIsFollowUpFormVisible] = useState(false);
  const [followUpError, setFollowUpError] = useState("");
  const [followUpFormError, setFollowUpFormError] = useState("");
  const [followUpFormData, setFollowUpFormData] =
    useState<CreateFollowUpRequest>(initialFollowUpFormData);
  const [followUpOwner, setFollowUpOwner] = useState<OwnerItem | null>(null);
  const [isFollowUpOwnerLoading, setIsFollowUpOwnerLoading] = useState(false);
  const [followUpCompletionDraft, setFollowUpCompletionDraft] = useState("");
  const [completingFollowUpId, setCompletingFollowUpId] = useState<number | null>(
    null,
  );
  const [updatingFollowUpId, setUpdatingFollowUpId] = useState<number | null>(
    null,
  );
  const detailSectionRef = useRef<HTMLElement | null>(null);

  async function loadDependencies() {
    try {
      setIsDependenciesLoading(true);

      const [
        appointmentsResult,
        petsResult,
        triagesResult,
        servicesResult,
        waitingRoomResult,
      ] = await Promise.allSettled([
        findAllAppointments(),
        findAllPets(),
        findAllTriages(),
        findAllVetServices(),
        findWaitingRoomEntries(),
      ]);

      setAppointments(
        appointmentsResult.status === "fulfilled" ? appointmentsResult.value : [],
      );
      setPets(petsResult.status === "fulfilled" ? petsResult.value : []);
      setTriages(triagesResult.status === "fulfilled" ? triagesResult.value : []);
      setServices(
        servicesResult.status === "fulfilled" ? servicesResult.value : [],
      );
      setWaitingRoomEntries(
        waitingRoomResult.status === "fulfilled" ? waitingRoomResult.value : [],
      );

      const failedDependencies = [
        appointmentsResult,
        petsResult,
        triagesResult,
        servicesResult,
        waitingRoomResult,
      ].filter((result) => result.status === "rejected").length;

      if (failedDependencies > 0) {
        setError(
          "Algunos catálogos auxiliares no se pudieron cargar por completo, pero la pantalla seguirá mostrando la información disponible.",
        );
      }
    } finally {
      setIsDependenciesLoading(false);
    }
  }

  async function loadClinicalAttentions() {
    try {
      setIsLoading(true);
      setError("");

      let items: ClinicalAttentionItem[];

      if (Number(appointmentFilter) > 0) {
        items = await findClinicalAttentionsByAppointmentId(
          Number(appointmentFilter),
        );
      } else if (Number(petFilter) > 0) {
        items = await findClinicalAttentionsByPetId(Number(petFilter));
      } else {
        items = await findAllClinicalAttentions();
      }

      setClinicalAttentions(items);
    } catch (err) {
      console.error("No se pudieron cargar las atenciones clinicas:", err);
      setError("No se pudieron cargar las atenciones clinicas del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAllClinicalAttentionsForValidation() {
    try {
      const items = await findAllClinicalAttentions();
      setAllClinicalAttentions(items);
    } catch (err) {
      console.error(
        "No se pudieron cargar todas las atenciones clinicas para validacion:",
        err,
      );
    }
  }

  async function loadPrescriptions(attentionId: number) {
    try {
      setIsPrescriptionLoading(true);
      setPrescriptionError("");
      const items = await findPrescriptionsByAttentionId(attentionId);
      setPrescriptions(items);
    } catch (err) {
      console.error("No se pudieron cargar las recetas:", err);
      setPrescriptionError("No se pudieron cargar las recetas de la atención.");
    } finally {
      setIsPrescriptionLoading(false);
    }
  }

  async function loadTreatmentPlans(attentionId: number) {
    try {
      setIsTreatmentPlanLoading(true);
      setTreatmentPlanError("");
      const items = await findTreatmentPlansByAttentionId(attentionId);
      setTreatmentPlans(items);
    } catch (err) {
      console.error("No se pudieron cargar los planes de tratamiento:", err);
      setTreatmentPlanError(
        "No se pudieron cargar los planes de tratamiento de la atención.",
      );
    } finally {
      setIsTreatmentPlanLoading(false);
    }
  }

  async function loadFollowUps(attentionId: number) {
    try {
      setIsFollowUpLoading(true);
      setFollowUpError("");
      const items = await findFollowUpsByAttentionId(attentionId);
      setFollowUps(items);
    } catch (err) {
      console.error("No se pudieron cargar los seguimientos:", err);
      setFollowUpError("No se pudieron cargar los seguimientos de la atención.");
    } finally {
      setIsFollowUpLoading(false);
    }
  }

  useEffect(() => {
    void loadDependencies();
  }, []);

  useEffect(() => {
    void loadClinicalAttentions();
  }, [appointmentFilter, petFilter]);

  useEffect(() => {
    void loadAllClinicalAttentionsForValidation();
  }, []);

  useEffect(() => {
    if (!selectedAttention && !isDetailLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      detailSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [selectedAttention, isDetailLoading]);

  useEffect(() => {
    if (!selectedAttention) {
      setPrescriptions([]);
      setSelectedPrescription(null);
      setIsPrescriptionFormVisible(false);
      setEditingPrescriptionId(null);
      setPrescriptionFormData(initialPrescriptionFormData);
      setTreatmentPlans([]);
      setSelectedTreatmentPlan(null);
      setIsTreatmentPlanFormVisible(false);
      setEditingTreatmentPlanId(null);
      setTreatmentPlanFormData(initialTreatmentPlanFormData);
      setFollowUps([]);
      setSelectedFollowUp(null);
      setIsFollowUpFormVisible(false);
      setFollowUpFormData(initialFollowUpFormData);
      setFollowUpCompletionDraft("");
      setCompletingFollowUpId(null);
      return;
    }

    void loadPrescriptions(selectedAttention.id);
    void loadTreatmentPlans(selectedAttention.id);
    void loadFollowUps(selectedAttention.id);
  }, [selectedAttention]);

  const usedTriageIds = useMemo(
    () => new Set(allClinicalAttentions.map((item) => item.triageId)),
    [allClinicalAttentions],
  );

  const waitingRoomByAppointmentId = useMemo(
    () =>
      new Map(
        waitingRoomEntries.map((entry) => [entry.appointmentId, entry] as const),
      ),
    [waitingRoomEntries],
  );

  const availableTriages = useMemo(
    () =>
      triages.filter((triage) => {
        const isCurrentTriage = triage.id === formData.triageId;
        const waitingRoomEntry = waitingRoomByAppointmentId.get(
          triage.appointmentId,
        );

        return (
          (!usedTriageIds.has(triage.id) || isCurrentTriage) &&
          (isCurrentTriage || waitingRoomEntry?.status === "EN_ATENCION")
        );
      }),
    [formData.triageId, triages, usedTriageIds, waitingRoomByAppointmentId],
  );

  const selectedAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) => appointment.id === formData.appointmentId,
      ) ?? null,
    [appointments, formData.appointmentId],
  );

  const selectedAttentionAppointment = useMemo(
    () =>
      selectedAttention
        ? appointments.find(
            (appointment) => appointment.id === selectedAttention.appointmentId,
          ) ?? null
        : null,
    [appointments, selectedAttention],
  );

  const filteredClinicalAttentions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clinicalAttentions.filter((attention) => {
      const appointment = appointments.find(
        (appointmentItem) => appointmentItem.id === attention.appointmentId,
      );
      const pet = pets.find((petItem) => petItem.id === attention.petId);

      return (
        normalizedQuery.length === 0 ||
        attention.reasonForConsultation.toLowerCase().includes(normalizedQuery) ||
        attention.diagnosis.toLowerCase().includes(normalizedQuery) ||
        attention.treatment.toLowerCase().includes(normalizedQuery) ||
        (appointment
          ? getAppointmentLabel(appointment, pets, services)
              .toLowerCase()
              .includes(normalizedQuery)
          : false) ||
        (pet?.nombre.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
  }, [appointments, clinicalAttentions, pets, query, services]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingAttentionId(null);
    setFormError("");
    setIsFormVisible(false);
  }

  function resetPrescriptionForm() {
    setPrescriptionFormData(initialPrescriptionFormData);
    setEditingPrescriptionId(null);
    setPrescriptionFormError("");
    setIsPrescriptionFormVisible(false);
  }

  function updateField<K extends keyof CreateClinicalAttentionRequest>(
    field: K,
    value: CreateClinicalAttentionRequest[K],
  ) {
    setFormData((current) => {
      const nextState = {
        ...current,
        [field]: value,
      };

      if (field === "triageId") {
        const triage = availableTriages.find((item) => item.id === Number(value));

        if (triage) {
          nextState.appointmentId = triage.appointmentId;
        } else {
          nextState.appointmentId = 0;
        }
      }

      return nextState;
    });
  }

  function getDefaultPrescriptionForm(
    attention: ClinicalAttentionItem | null,
  ): CreatePrescriptionRequest {
    const appointment = attention
      ? appointments.find((item) => item.id === attention.appointmentId)
      : null;

    return {
      diagnostico: attention?.diagnosis ?? "",
      notasAdicionales: "",
      veterinarioId:
        attention?.veterinarianId ?? appointment?.veterinario.id ?? 0,
      detalles: [{ ...initialPrescriptionDetail }],
    };
  }

  function getDefaultTreatmentPlanForm(
    attention: ClinicalAttentionItem | null,
  ): CreateTreatmentPlanRequest {
    const appointment = attention
      ? appointments.find((item) => item.id === attention.appointmentId)
      : null;

    return {
      titulo: "",
      descripcion: "",
      fechaInicio: "",
      fechaFinEstimada: "",
      veterinarioId:
        attention?.veterinarianId ?? appointment?.veterinario.id ?? 0,
      actividades: [{ ...initialTreatmentPlanActivity }],
    };
  }

  function getDefaultFollowUpForm(
    attention: ClinicalAttentionItem | null,
  ): CreateFollowUpRequest {
    const appointment = attention
      ? appointments.find((item) => item.id === attention.appointmentId)
      : null;

    return {
      veterinarioId:
        attention?.veterinarianId ?? appointment?.veterinario.id ?? 0,
      tipo: "",
      fechaProgramada: "",
      motivo: "",
    };
  }

  function updatePrescriptionField<K extends keyof CreatePrescriptionRequest>(
    field: K,
    value: CreatePrescriptionRequest[K],
  ) {
    setPrescriptionFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updatePrescriptionDetailField(
    index: number,
    field: keyof CreatePrescriptionDetailRequest,
    value: string,
  ) {
    setPrescriptionFormData((current) => ({
      ...current,
      detalles: current.detalles.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [field]: value } : detail,
      ),
    }));
  }

  function addPrescriptionDetail() {
    setPrescriptionFormData((current) => ({
      ...current,
      detalles: [...current.detalles, { ...initialPrescriptionDetail }],
    }));
  }

  function removePrescriptionDetail(index: number) {
    setPrescriptionFormData((current) => ({
      ...current,
      detalles:
        current.detalles.length === 1
          ? [{ ...initialPrescriptionDetail }]
          : current.detalles.filter((_, detailIndex) => detailIndex !== index),
    }));
  }

  function resetTreatmentPlanForm() {
    setTreatmentPlanFormData(initialTreatmentPlanFormData);
    setEditingTreatmentPlanId(null);
    setTreatmentPlanFormError("");
    setIsTreatmentPlanFormVisible(false);
  }

  function updateTreatmentPlanField<K extends keyof CreateTreatmentPlanRequest>(
    field: K,
    value: CreateTreatmentPlanRequest[K],
  ) {
    setTreatmentPlanFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateTreatmentPlanActivityField(
    index: number,
    field: keyof CreateTreatmentPlanActivityRequest,
    value: string,
  ) {
    setTreatmentPlanFormData((current) => ({
      ...current,
      actividades: current.actividades.map((activity, activityIndex) =>
        activityIndex === index ? { ...activity, [field]: value } : activity,
      ),
    }));
  }

  function addTreatmentPlanActivity() {
    setTreatmentPlanFormData((current) => ({
      ...current,
      actividades: [...current.actividades, { ...initialTreatmentPlanActivity }],
    }));
  }

  function removeTreatmentPlanActivity(index: number) {
    setTreatmentPlanFormData((current) => ({
      ...current,
      actividades:
        current.actividades.length === 1
          ? [{ ...initialTreatmentPlanActivity }]
          : current.actividades.filter(
              (_, activityIndex) => activityIndex !== index,
            ),
    }));
  }

  function resetFollowUpForm() {
    setFollowUpFormData(initialFollowUpFormData);
    setFollowUpOwner(null);
    setIsFollowUpOwnerLoading(false);
    setFollowUpFormError("");
    setIsFollowUpFormVisible(false);
  }

  function updateFollowUpField<K extends keyof CreateFollowUpRequest>(
    field: K,
    value: CreateFollowUpRequest[K],
  ) {
    setFollowUpFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function openFollowUpForm(attention: ClinicalAttentionItem) {
    setFollowUpFormError("");
    setIsFollowUpFormVisible(true);
    setIsFollowUpOwnerLoading(true);

    const defaultForm = getDefaultFollowUpForm(attention);
    setFollowUpFormData(defaultForm);
    setFollowUpOwner(null);

    try {
      if (attention.petId > 0) {
        const owner = await findPetOwnerPrincipal(attention.petId);
        setFollowUpOwner(owner);
        setFollowUpFormData((current) => ({
          ...current,
          duenoNotificadoId: owner.id,
        }));
      }
    } catch (err) {
      console.error("No se pudo cargar el dueño principal de la mascota:", err);
      setFollowUpFormError(
        "No se pudo cargar automáticamente el dueño principal de la mascota.",
      );
    } finally {
      setIsFollowUpOwnerLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      formData.triageId <= 0 ||
      formData.appointmentId <= 0 ||
      !formData.reasonForConsultation.trim() ||
      !formData.diagnosis.trim() ||
      !canManageClinicalAttention
    ) {
      setFormError(
        canManageClinicalAttention
          ? "Completa el triaje, el motivo de consulta y el diagnóstico."
          : "Solo los veterinarios pueden registrar atención clínica.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingAttentionId !== null) {
        await updateClinicalAttention(
          editingAttentionId,
          formData as UpdateClinicalAttentionRequest,
        );
      } else {
        await createClinicalAttention(formData);
      }

      resetForm();
      await loadClinicalAttentions();
      await loadAllClinicalAttentionsForValidation();
    } catch (err) {
      console.error("No se pudo guardar la atencion clinica:", err);
      setFormError(
        getClinicalAttentionErrorMessage(
          err,
          "No se pudo guardar la atencion clinica. Inténtalo nuevamente.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleViewDetail(attentionId: number) {
    try {
      setIsDetailLoading(true);
      const detail = await findClinicalAttentionById(attentionId);
      setSelectedAttention(detail);
    } catch (err) {
      console.error("No se pudo cargar el detalle de la atencion clinica:", err);
      setError("No se pudo cargar el detalle de la atencion clinica.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleStartEdit(attentionId: number) {
    try {
      setIsDetailLoading(true);
      const detail = await findClinicalAttentionById(attentionId);
      setEditingAttentionId(detail.id);
      setFormData({
        appointmentId: detail.appointmentId,
        triageId: detail.triageId,
        reasonForConsultation: detail.reasonForConsultation,
        symptoms: detail.symptoms,
        diagnosis: detail.diagnosis,
        clinicalObservations: detail.clinicalObservations,
        treatment: detail.treatment,
      });
      setIsFormVisible(true);
    } catch (err) {
      console.error("No se pudo cargar la atencion clinica para editar:", err);
      setError("No se pudo cargar la atencion clinica para editar.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleViewPrescription(prescriptionId: number) {
    try {
      setIsPrescriptionLoading(true);
      const detail = await findPrescriptionById(prescriptionId);
      setSelectedPrescription(detail);
    } catch (err) {
      console.error("No se pudo cargar el detalle de la receta:", err);
      setPrescriptionError("No se pudo cargar el detalle de la receta.");
    } finally {
      setIsPrescriptionLoading(false);
    }
  }

  async function handleStartPrescriptionEdit(prescriptionId: number) {
    try {
      setIsPrescriptionLoading(true);
      const detail = await findPrescriptionById(prescriptionId);
      setSelectedPrescription(detail);
      setEditingPrescriptionId(detail.id);
      setPrescriptionFormData({
        diagnostico: detail.diagnostico,
        notasAdicionales: detail.notasAdicionales,
        veterinarioId: detail.veterinarioId,
        detalles:
          detail.detalles.length > 0
            ? detail.detalles.map((item) => ({
                medicamento: item.medicamento,
                presentacion: item.presentacion,
                dosis: item.dosis,
                frecuencia: item.frecuencia,
                duracion: item.duracion,
                viaAdministracion: item.viaAdministracion,
                indicaciones: item.indicaciones,
              }))
            : [{ ...initialPrescriptionDetail }],
      });
      setIsPrescriptionFormVisible(true);
      setPrescriptionFormError("");
    } catch (err) {
      console.error("No se pudo cargar la receta para editar:", err);
      setPrescriptionError("No se pudo cargar la receta para editar.");
    } finally {
      setIsPrescriptionLoading(false);
    }
  }

  async function handlePrescriptionSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAttention) {
      setPrescriptionFormError("Selecciona primero una atención clínica.");
      return;
    }

    const validDetails = prescriptionFormData.detalles.filter(
      (detail) =>
        detail.medicamento.trim() ||
        detail.presentacion.trim() ||
        detail.dosis.trim() ||
        detail.frecuencia.trim() ||
        detail.duracion.trim() ||
        detail.viaAdministracion.trim() ||
        detail.indicaciones.trim(),
    );

    const hasInvalidDetail = validDetails.some(
      (detail) =>
        !detail.medicamento.trim() ||
        !detail.dosis.trim() ||
        !detail.frecuencia.trim() ||
        !detail.duracion.trim(),
    );

    if (
      !canManageClinicalAttention ||
      !prescriptionFormData.diagnostico.trim() ||
      prescriptionFormData.veterinarioId <= 0
    ) {
      setPrescriptionFormError(
        canManageClinicalAttention
          ? "Completa el diagnóstico y el veterinario de la receta."
          : "Solo los veterinarios pueden registrar recetas.",
      );
      return;
    }

    if (hasInvalidDetail) {
      setPrescriptionFormError(
        "Cada detalle con datos debe completar medicamento, dosis, frecuencia y duración.",
      );
      return;
    }

    try {
      setIsPrescriptionSaving(true);
      setPrescriptionFormError("");

      if (editingPrescriptionId !== null) {
        await updatePrescription(editingPrescriptionId, {
          ...prescriptionFormData,
          detalles: validDetails,
        });
      } else {
        await createPrescription(selectedAttention.id, {
          ...prescriptionFormData,
          detalles: validDetails,
        });
      }

      resetPrescriptionForm();
      await loadPrescriptions(selectedAttention.id);
    } catch (err) {
      console.error("No se pudo guardar la receta:", err);
      setPrescriptionFormError("No se pudo guardar la receta. Inténtalo nuevamente.");
    } finally {
      setIsPrescriptionSaving(false);
    }
  }

  async function handleViewTreatmentPlan(planId: number) {
    try {
      setIsTreatmentPlanLoading(true);
      const detail = await findTreatmentPlanById(planId);
      setSelectedTreatmentPlan(detail);
    } catch (err) {
      console.error("No se pudo cargar el detalle del plan:", err);
      setTreatmentPlanError("No se pudo cargar el detalle del plan.");
    } finally {
      setIsTreatmentPlanLoading(false);
    }
  }

  async function handleStartTreatmentPlanEdit(planId: number) {
    try {
      setIsTreatmentPlanLoading(true);
      const detail = await findTreatmentPlanById(planId);
      setSelectedTreatmentPlan(detail);
      setEditingTreatmentPlanId(detail.id);
      setTreatmentPlanFormData({
        titulo: detail.titulo,
        descripcion: detail.descripcion,
        fechaInicio: detail.fechaInicio,
        fechaFinEstimada: detail.fechaFinEstimada,
        veterinarioId: detail.veterinarioId,
        actividades:
          detail.actividades.length > 0
            ? detail.actividades.map((activity) => ({
                tipo: activity.tipo,
                descripcion: activity.descripcion,
                fechaProgramada: activity.fechaProgramada,
                horaProgramada: activity.horaProgramada,
                frecuencia: activity.frecuencia,
                responsable: activity.responsable,
                observaciones: activity.observaciones,
              }))
            : [{ ...initialTreatmentPlanActivity }],
      });
      setTreatmentPlanFormError("");
      setIsTreatmentPlanFormVisible(true);
    } catch (err) {
      console.error("No se pudo cargar el plan para editar:", err);
      setTreatmentPlanError("No se pudo cargar el plan para editar.");
    } finally {
      setIsTreatmentPlanLoading(false);
    }
  }

  async function handleTreatmentPlanSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAttention) {
      setTreatmentPlanFormError("Selecciona primero una atención clínica.");
      return;
    }

    const validActivities = treatmentPlanFormData.actividades.filter(
      (activity) =>
        activity.tipo.trim() ||
        activity.descripcion.trim() ||
        activity.fechaProgramada.trim() ||
        activity.horaProgramada.trim() ||
        activity.frecuencia.trim() ||
        activity.responsable.trim() ||
        activity.observaciones.trim(),
    );

    const hasInvalidActivity = validActivities.some(
      (activity) => !activity.tipo.trim() || !activity.descripcion.trim(),
    );

    if (
      !canManageClinicalAttention ||
      !treatmentPlanFormData.titulo.trim() ||
      !treatmentPlanFormData.fechaInicio.trim() ||
      treatmentPlanFormData.veterinarioId <= 0
    ) {
      setTreatmentPlanFormError(
        canManageClinicalAttention
          ? "Completa el título, la fecha de inicio y el veterinario del plan."
          : "Solo los veterinarios pueden registrar planes de tratamiento.",
      );
      return;
    }

    if (hasInvalidActivity) {
      setTreatmentPlanFormError(
        "Cada actividad con datos debe completar tipo y descripción.",
      );
      return;
    }

    try {
      setIsTreatmentPlanSaving(true);
      setTreatmentPlanFormError("");

      if (editingTreatmentPlanId !== null) {
        await updateTreatmentPlan(editingTreatmentPlanId, {
          ...treatmentPlanFormData,
          actividades: validActivities,
        });
      } else {
        await createTreatmentPlan(selectedAttention.id, {
          ...treatmentPlanFormData,
          actividades: validActivities,
        });
      }

      resetTreatmentPlanForm();
      await loadTreatmentPlans(selectedAttention.id);
    } catch (err) {
      console.error("No se pudo guardar el plan de tratamiento:", err);
      setTreatmentPlanFormError(
        "No se pudo guardar el plan de tratamiento. Inténtalo nuevamente.",
      );
    } finally {
      setIsTreatmentPlanSaving(false);
    }
  }

  async function handleTreatmentPlanStatusChange(planId: number, status: string) {
    const currentPlan = treatmentPlans.find((item) => item.id === planId);

    if (!currentPlan || currentPlan.estado === status) {
      return;
    }

    try {
      setUpdatingTreatmentPlanStatusId(planId);
      setTreatmentPlanError("");
      await updateTreatmentPlanStatus(planId, status);

      if (selectedAttention) {
        await loadTreatmentPlans(selectedAttention.id);
      }
    } catch (err) {
      console.error("No se pudo actualizar el estado del plan:", err);
      setTreatmentPlanError(
        "No se pudo actualizar el estado del plan de tratamiento.",
      );
    } finally {
      setUpdatingTreatmentPlanStatusId(null);
    }
  }

  async function handleFollowUpSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAttention) {
      setFollowUpFormError("Selecciona primero una atención clínica.");
      return;
    }

    if (
      !canManageClinicalAttention ||
      followUpFormData.veterinarioId <= 0 ||
      !followUpFormData.tipo.trim() ||
      !followUpFormData.fechaProgramada.trim() ||
      !followUpFormData.motivo.trim()
    ) {
      setFollowUpFormError(
        canManageClinicalAttention
          ? "Completa el tipo, la fecha programada, el motivo y el veterinario."
          : "Solo los veterinarios pueden registrar seguimientos.",
      );
      return;
    }

    try {
      setIsFollowUpSaving(true);
      setFollowUpFormError("");
      await createFollowUp(selectedAttention.id, followUpFormData);
      resetFollowUpForm();
      await loadFollowUps(selectedAttention.id);
    } catch (err) {
      console.error("No se pudo guardar el seguimiento:", err);
      setFollowUpFormError(
        "No se pudo guardar el seguimiento. Inténtalo nuevamente.",
      );
    } finally {
      setIsFollowUpSaving(false);
    }
  }

  async function handleCompleteFollowUp(followUpId: number) {
    if (!selectedAttention) {
      return;
    }

    if (!followUpCompletionDraft.trim()) {
      setFollowUpError("Ingresa un resultado para completar el seguimiento.");
      return;
    }

    try {
      setUpdatingFollowUpId(followUpId);
      setFollowUpError("");
      await completeFollowUp(followUpId, followUpCompletionDraft);
      setCompletingFollowUpId(null);
      setFollowUpCompletionDraft("");
      await loadFollowUps(selectedAttention.id);
    } catch (err) {
      console.error("No se pudo completar el seguimiento:", err);
      setFollowUpError("No se pudo completar el seguimiento.");
    } finally {
      setUpdatingFollowUpId(null);
    }
  }

  async function handleCancelFollowUp(followUpId: number) {
    if (!selectedAttention) {
      return;
    }

    try {
      setUpdatingFollowUpId(followUpId);
      setFollowUpError("");
      await cancelFollowUp(followUpId);
      if (completingFollowUpId === followUpId) {
        setCompletingFollowUpId(null);
        setFollowUpCompletionDraft("");
      }
      await loadFollowUps(selectedAttention.id);
    } catch (err) {
      console.error("No se pudo cancelar el seguimiento:", err);
      setFollowUpError("No se pudo cancelar el seguimiento.");
    } finally {
      setUpdatingFollowUpId(null);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Atención Clínica" />
      <IonContent>
        <div className="clinical-attention-screen">
          <section className="clinical-attention-hero">
            <div>
              <div className="clinical-attention-hero__title-row">
                <IonIcon icon={fitnessOutline} />
                <h1>Atención Clínica</h1>
              </div>
              <p>
                Registra el diagnóstico, tratamiento y observaciones finales de la
                consulta veterinaria.
              </p>
            </div>

            {canManageClinicalAttention ? (
              <IonButton
                className="clinical-attention-hero__cta"
                onClick={() => {
                  setFormError("");
                  setFormData(initialFormData);
                  setEditingAttentionId(null);
                  setIsFormVisible((current) => !current);
                }}
              >
                <IonIcon icon={addOutline} slot="start" />
                Nueva Atención
              </IonButton>
            ) : null}
          </section>

          {!canManageClinicalAttention && (
            <IonText color="medium">
              <p className="clinical-attention-feedback">
                El registro y edición de atención clínica está disponible solo para
                usuarios con rol VETERINARIO.
              </p>
            </IonText>
          )}

          {isFormVisible && (
            <section className="clinical-attention-form-card">
              <div className="clinical-attention-form-card__header">
                <div>
                  <h2>
                    {editingAttentionId !== null
                      ? "Editar atención clínica"
                      : "Registrar atención clínica"}
                  </h2>
                  <p>
                    {editingAttentionId !== null
                      ? "Actualiza la evolución y el plan terapéutico."
                      : "Completa el acto clínico a partir de un triaje registrado."}
                  </p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="clinical-attention-form-card__close"
                  fill="clear"
                  onClick={resetForm}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="clinical-attention-form" onSubmit={handleSubmit}>
                <div className="clinical-attention-form__grid">
                  <IonSelect
                    className="clinical-attention-field clinical-attention-field--select clinical-attention-field--full"
                    interface="popover"
                    value={formData.triageId || undefined}
                    disabled={editingAttentionId !== null}
                    placeholder={
                      isDependenciesLoading
                        ? "Cargando triajes..."
                        : availableTriages.length > 0
                          ? "Selecciona un triaje"
                          : "No hay triajes listos para atención clínica"
                    }
                    onIonChange={(event) =>
                      updateField("triageId", Number(event.detail.value ?? 0))
                    }
                  >
                    {availableTriages.map((triage) => (
                      <IonSelectOption key={triage.id} value={triage.id}>
                        {(() => {
                          const appointment = appointments.find(
                            (item) => item.id === triage.appointmentId,
                          );

                          return appointment
                            ? `${getAppointmentPetName(appointment, pets)} · ${getAppointmentServiceName(
                                appointment,
                                services,
                              )} · ${formatDateTime(appointment.fechaHora)}`
                            : `Triaje #${triage.id} · ${triage.reasonForVisit}`;
                        })()}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonInput
                    className="clinical-attention-field clinical-attention-field--full"
                    fill="outline"
                    label="Datos de la cita"
                    labelPlacement="stacked"
                    readonly
                    value={
                      selectedAppointment
                        ? getAppointmentLabel(
                            selectedAppointment,
                            pets,
                            services,
                          )
                        : ""
                    }
                    placeholder="Se completará al seleccionar un triaje"
                  />

                  <IonInput
                    className="clinical-attention-field"
                    fill="outline"
                    label="Motivo de consulta"
                    labelPlacement="stacked"
                    value={formData.reasonForConsultation}
                    onIonInput={(event) =>
                      updateField(
                        "reasonForConsultation",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />

                  <IonTextarea
                    className="clinical-attention-field"
                    fill="outline"
                    label="Síntomas"
                    labelPlacement="stacked"
                    autoGrow
                    value={formData.symptoms}
                    onIonInput={(event) =>
                      updateField("symptoms", String(event.detail.value ?? ""))
                    }
                  />

                  <IonTextarea
                    className="clinical-attention-field"
                    fill="outline"
                    label="Diagnóstico"
                    labelPlacement="stacked"
                    autoGrow
                    value={formData.diagnosis}
                    onIonInput={(event) =>
                      updateField("diagnosis", String(event.detail.value ?? ""))
                    }
                  />

                  <IonTextarea
                    className="clinical-attention-field"
                    fill="outline"
                    label="Observaciones clínicas"
                    labelPlacement="stacked"
                    autoGrow
                    value={formData.clinicalObservations}
                    onIonInput={(event) =>
                      updateField(
                        "clinicalObservations",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />
                </div>

                <IonTextarea
                  className="clinical-attention-field"
                  fill="outline"
                  label="Tratamiento"
                  labelPlacement="stacked"
                  autoGrow
                  value={formData.treatment}
                  onIonInput={(event) =>
                    updateField("treatment", String(event.detail.value ?? ""))
                  }
                />

                {formError && (
                  <IonText color="danger">
                    <p className="clinical-attention-feedback">{formError}</p>
                  </IonText>
                )}

                {!isDependenciesLoading && availableTriages.length === 0 ? (
                  <IonText color="medium">
                    <p className="clinical-attention-feedback">
                      No hay triajes elegibles. Primero debe existir un triaje
                      registrado, la cita debe seguir en EN_ATENCION y además no
                      debe tener una atención clínica previa asociada.
                    </p>
                  </IonText>
                ) : null}

                <div className="clinical-attention-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetForm}>
                    Cancelar
                  </IonButton>
                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving
                      ? "Guardando..."
                      : editingAttentionId !== null
                        ? "Actualizar atención"
                        : "Guardar atención"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="clinical-attention-table-card">
            <div className="clinical-attention-filters">
              <IonInput
                className="clinical-attention-field"
                fill="outline"
                placeholder="Buscar por motivo, diagnóstico, tratamiento o mascota..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="clinical-attention-field clinical-attention-field--select"
                interface="popover"
                value={petFilter}
                onIonChange={(event) =>
                  setPetFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">Todas las mascotas</IonSelectOption>
                {pets.map((pet) => (
                  <IonSelectOption key={pet.id} value={String(pet.id)}>
                    {pet.nombre}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <IonSelect
                className="clinical-attention-field clinical-attention-field--select"
                interface="popover"
                value={appointmentFilter}
                onIonChange={(event) =>
                  setAppointmentFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">Todas las citas</IonSelectOption>
                {appointments.map((appointment) => (
                  <IonSelectOption key={appointment.id} value={String(appointment.id)}>
                    {getAppointmentLabel(appointment, pets, services)}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            {error && (
              <IonText color="warning">
                <p className="clinical-attention-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="clinical-attention-loading">
                <IonSpinner name="crescent" />
                <span>Cargando atenciones clínicas...</span>
              </div>
            ) : (
              <>
                <div className="clinical-attention-table-wrapper">
                  <table className="clinical-attention-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Mascota</th>
                        <th>Datos de la Cita</th>
                        <th>Diagnóstico</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClinicalAttentions.map((attention, index) => {
                        const appointment = appointments.find(
                          (appointmentItem) =>
                            appointmentItem.id === attention.appointmentId,
                        );
                        const petName =
                          pets.find((pet) => pet.id === attention.petId)?.nombre ||
                          appointment?.mascota.nombre ||
                          `Mascota #${attention.petId}`;

                        return (
                          <tr key={attention.id}>
                            <td>{index + 1}</td>
                            <td>{petName}</td>
                            <td>
                              {renderAppointmentSummary(
                                appointment,
                                services,
                                attention.appointmentId,
                              )}
                            </td>
                            <td>{attention.diagnosis}</td>
                            <td>{formatDateTime(attention.createdAt)}</td>
                            <td>
                              <div className="clinical-attention-actions">
                                {canManageClinicalAttention ? (
                                  <button
                                    className="clinical-attention-action clinical-attention-action--edit"
                                    type="button"
                                    onClick={() => handleStartEdit(attention.id)}
                                  >
                                    <IonIcon icon={pencilOutline} />
                                  </button>
                                ) : null}
                                <button
                                  className="clinical-attention-action clinical-attention-action--view"
                                  type="button"
                                  onClick={() => handleViewDetail(attention.id)}
                                >
                                  <IonIcon icon={eyeOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="clinical-attention-mobile-list">
                  {filteredClinicalAttentions.map((attention, index) => {
                    const appointment = appointments.find(
                      (appointmentItem) =>
                        appointmentItem.id === attention.appointmentId,
                    );
                    const petName =
                      pets.find((pet) => pet.id === attention.petId)?.nombre ||
                      appointment?.mascota.nombre ||
                      `Mascota #${attention.petId}`;

                    return (
                      <article
                        className="clinical-attention-mobile-card"
                        key={attention.id}
                      >
                        <div className="clinical-attention-mobile-card__top">
                          <span className="clinical-attention-mobile-card__index">
                            #{index + 1}
                          </span>
                          <span className="clinical-attention-mobile-card__meta-pill">
                            Triage #{attention.triageId}
                          </span>
                        </div>

                        <h2>{petName}</h2>
                        <p>{attention.reasonForConsultation}</p>

                        <div className="clinical-attention-mobile-card__meta">
                          {renderAppointmentSummary(
                            appointment,
                            services,
                            attention.appointmentId,
                          )}
                          <strong>{formatDateTime(attention.createdAt)}</strong>
                        </div>

                        <div className="clinical-attention-actions">
                          {canManageClinicalAttention ? (
                            <button
                              className="clinical-attention-action clinical-attention-action--edit"
                              type="button"
                              onClick={() => handleStartEdit(attention.id)}
                            >
                              <IonIcon icon={pencilOutline} />
                            </button>
                          ) : null}
                          <button
                            className="clinical-attention-action clinical-attention-action--view"
                            type="button"
                            onClick={() => handleViewDetail(attention.id)}
                          >
                            <IonIcon icon={eyeOutline} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <footer className="clinical-attention-footer">
                  Total de atenciones clínicas: {filteredClinicalAttentions.length}
                </footer>
              </>
            )}
          </section>

          {(selectedAttention || isDetailLoading) && (
            <section
              className="clinical-attention-detail-card"
              ref={detailSectionRef}
            >
              <div className="clinical-attention-form-card__header">
                <div>
                  <h2>Detalle de la atención clínica</h2>
                  <p>Información ampliada del acto clínico seleccionado.</p>
                </div>

                <IonButton
                  aria-label="Cerrar detalle"
                  className="clinical-attention-form-card__close"
                  fill="clear"
                  onClick={() => {
                    setSelectedAttention(null);
                    setSelectedPrescription(null);
                    setSelectedTreatmentPlan(null);
                    setSelectedFollowUp(null);
                    resetPrescriptionForm();
                    resetTreatmentPlanForm();
                    resetFollowUpForm();
                  }}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              {isDetailLoading ? (
                <div className="clinical-attention-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando detalle...</span>
                </div>
              ) : selectedAttention ? (
                <div className="clinical-attention-detail-grid">
                  <div className="clinical-attention-detail-item">
                    <span>Datos de la Cita</span>
                    <strong>
                      {renderAppointmentSummary(
                        appointments.find(
                          (appointment) =>
                            appointment.id === selectedAttention.appointmentId,
                        ),
                        services,
                        selectedAttention.appointmentId,
                      )}
                    </strong>
                  </div>
                  <div className="clinical-attention-detail-item">
                    <span>Mascota</span>
                    <strong>
                      {pets.find((pet) => pet.id === selectedAttention.petId)
                        ?.nombre || `Mascota #${selectedAttention.petId}`}
                    </strong>
                  </div>
                  <div className="clinical-attention-detail-item">
                    <span>Motivo de consulta</span>
                    <strong>{selectedAttention.reasonForConsultation}</strong>
                  </div>
                  <div className="clinical-attention-detail-item">
                    <span>Síntomas</span>
                    <strong>{selectedAttention.symptoms}</strong>
                  </div>
                  <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                    <span>Diagnóstico</span>
                    <strong>{selectedAttention.diagnosis}</strong>
                  </div>
                  <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                    <span>Tratamiento</span>
                    <strong>{selectedAttention.treatment}</strong>
                  </div>
                  <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                    <span>Observaciones clínicas</span>
                    <strong>{selectedAttention.clinicalObservations}</strong>
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {selectedAttention && (
            <section className="clinical-attention-detail-card">
              <div className="clinical-attention-form-card__header">
                <div>
                  <h2>Recetas</h2>
                  <p>Gestiona las recetas asociadas a esta atención clínica.</p>
                </div>

                {canManageClinicalAttention ? (
                  <IonButton
                    className="clinical-attention-hero__cta"
                    onClick={() => {
                      setPrescriptionFormError("");
                      setEditingPrescriptionId(null);
                      setPrescriptionFormData(
                        getDefaultPrescriptionForm(selectedAttention),
                      );
                      setIsPrescriptionFormVisible((current) => !current);
                    }}
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Nueva Receta
                  </IonButton>
                ) : null}
              </div>

              {isPrescriptionFormVisible && (
                <form
                  className="clinical-attention-form"
                  onSubmit={handlePrescriptionSubmit}
                >
                  <div className="clinical-attention-subsection">
                    <div className="clinical-attention-subsection__header">
                      <h3>Detalles de la receta</h3>
                      <IonButton
                        fill="outline"
                        type="button"
                        onClick={addPrescriptionDetail}
                      >
                        Agregar detalle
                      </IonButton>
                    </div>

                    {prescriptionFormData.detalles.map((detail, index) => (
                      <div
                        className="clinical-attention-prescription-detail"
                        key={`prescription-detail-${index}`}
                      >
                        <div className="clinical-attention-form__grid">
                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Medicamento"
                            labelPlacement="stacked"
                            value={detail.medicamento}
                            onIonInput={(event) =>
                              updatePrescriptionDetailField(
                                index,
                                "medicamento",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Presentación"
                            labelPlacement="stacked"
                            value={detail.presentacion}
                            onIonInput={(event) =>
                              updatePrescriptionDetailField(
                                index,
                                "presentacion",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Dosis"
                            labelPlacement="stacked"
                            value={detail.dosis}
                            onIonInput={(event) =>
                              updatePrescriptionDetailField(
                                index,
                                "dosis",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Frecuencia"
                            labelPlacement="stacked"
                            value={detail.frecuencia}
                            onIonInput={(event) =>
                              updatePrescriptionDetailField(
                                index,
                                "frecuencia",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Duración"
                            labelPlacement="stacked"
                            value={detail.duracion}
                            onIonInput={(event) =>
                              updatePrescriptionDetailField(
                                index,
                                "duracion",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Vía de administración"
                            labelPlacement="stacked"
                            value={detail.viaAdministracion}
                            onIonInput={(event) =>
                              updatePrescriptionDetailField(
                                index,
                                "viaAdministracion",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonTextarea
                            className="clinical-attention-field clinical-attention-field--full"
                            fill="outline"
                            label="Indicaciones"
                            labelPlacement="stacked"
                            autoGrow
                            value={detail.indicaciones}
                            onIonInput={(event) =>
                              updatePrescriptionDetailField(
                                index,
                                "indicaciones",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />
                        </div>

                        <div className="clinical-attention-form__actions">
                          <IonButton
                            color="danger"
                            fill="clear"
                            type="button"
                            onClick={() => removePrescriptionDetail(index)}
                          >
                            Quitar detalle
                          </IonButton>
                        </div>
                      </div>
                    ))}
                  </div>

                  {prescriptionFormError && (
                    <IonText color="danger">
                      <p className="clinical-attention-feedback">
                        {prescriptionFormError}
                      </p>
                    </IonText>
                  )}

                  <div className="clinical-attention-form__actions">
                    <IonButton
                      fill="outline"
                      type="button"
                      onClick={resetPrescriptionForm}
                    >
                      Cancelar
                    </IonButton>
                    <IonButton type="submit" disabled={isPrescriptionSaving}>
                      {isPrescriptionSaving
                        ? "Guardando..."
                        : editingPrescriptionId !== null
                          ? "Actualizar receta"
                          : "Guardar receta"}
                    </IonButton>
                  </div>
                </form>
              )}

              {prescriptionError && (
                <IonText color="warning">
                  <p className="clinical-attention-feedback">{prescriptionError}</p>
                </IonText>
              )}

              {isPrescriptionLoading ? (
                <div className="clinical-attention-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando recetas...</span>
                </div>
              ) : prescriptions.length === 0 ? (
                <IonText color="medium">
                  <p className="clinical-attention-feedback">
                    Esta atención clínica aún no tiene recetas registradas.
                  </p>
                </IonText>
              ) : (
                <>
                  <div className="clinical-attention-table-wrapper">
                    <table className="clinical-attention-table clinical-attention-table--compact">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Diagnóstico</th>
                          <th>Estado</th>
                          <th>Detalles</th>
                          <th>Creado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.map((prescription, index) => (
                          <tr key={prescription.id}>
                            <td>{index + 1}</td>
                            <td>{prescription.diagnostico}</td>
                            <td>{prescription.estado}</td>
                            <td>{prescription.detalles.length}</td>
                            <td>{formatDateTime(prescription.createdAt)}</td>
                            <td>
                              <div className="clinical-attention-actions">
                                {canManageClinicalAttention ? (
                                  <button
                                    className="clinical-attention-action clinical-attention-action--edit"
                                    type="button"
                                    onClick={() =>
                                      handleStartPrescriptionEdit(
                                        prescription.id,
                                      )
                                    }
                                  >
                                    <IonIcon icon={pencilOutline} />
                                  </button>
                                ) : null}
                                <button
                                  className="clinical-attention-action clinical-attention-action--view"
                                  type="button"
                                  onClick={() =>
                                    handleViewPrescription(prescription.id)
                                  }
                                >
                                  <IonIcon icon={eyeOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="clinical-attention-mobile-list">
                    {prescriptions.map((prescription, index) => (
                      <article
                        className="clinical-attention-mobile-card"
                        key={prescription.id}
                      >
                        <div className="clinical-attention-mobile-card__top">
                          <span className="clinical-attention-mobile-card__index">
                            #{index + 1}
                          </span>
                          <span className="clinical-attention-mobile-card__meta-pill">
                            {prescription.estado}
                          </span>
                        </div>

                        <h2>{prescription.mascotaNombre || "Receta"}</h2>
                        <p>{prescription.diagnostico}</p>

                        <div className="clinical-attention-mobile-card__meta">
                          <span>{prescription.detalles.length} detalles</span>
                          <strong>{formatDateTime(prescription.createdAt)}</strong>
                        </div>

                        <div className="clinical-attention-actions">
                          {canManageClinicalAttention ? (
                            <button
                              className="clinical-attention-action clinical-attention-action--edit"
                              type="button"
                              onClick={() =>
                                handleStartPrescriptionEdit(prescription.id)
                              }
                            >
                              <IonIcon icon={pencilOutline} />
                            </button>
                          ) : null}
                          <button
                            className="clinical-attention-action clinical-attention-action--view"
                            type="button"
                            onClick={() => handleViewPrescription(prescription.id)}
                          >
                            <IonIcon icon={eyeOutline} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {selectedPrescription && (
                <div className="clinical-attention-prescription-view">
                  <div className="clinical-attention-form-card__header">
                    <div>
                      <h2>Detalle de la receta</h2>
                      <p>Información ampliada y detalle de medicamentos.</p>
                    </div>

                    <IonButton
                      aria-label="Cerrar detalle de receta"
                      className="clinical-attention-form-card__close"
                      fill="clear"
                      onClick={() => setSelectedPrescription(null)}
                    >
                      <IonIcon icon={closeOutline} slot="icon-only" />
                    </IonButton>
                  </div>

                  <div className="clinical-attention-detail-grid">
                    <div className="clinical-attention-detail-item">
                      <span>Diagnóstico</span>
                      <strong>{selectedPrescription.diagnostico}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Estado</span>
                      <strong>{selectedPrescription.estado}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Mascota</span>
                      <strong>{selectedPrescription.mascotaNombre}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Veterinario</span>
                      <strong>{selectedPrescription.veterinarioNombre}</strong>
                    </div>
                    <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                      <span>Notas adicionales</span>
                      <strong>
                        {selectedPrescription.notasAdicionales ||
                          "Sin notas adicionales"}
                      </strong>
                    </div>
                  </div>

                  <div className="clinical-attention-subsection">
                    <div className="clinical-attention-subsection__header">
                      <h3>Medicamentos y detalles</h3>
                    </div>

                    {selectedPrescription.detalles.length === 0 ? (
                      <IonText color="medium">
                        <p className="clinical-attention-feedback">
                          La receta no registra detalles de medicamentos.
                        </p>
                      </IonText>
                    ) : (
                      <div className="clinical-attention-prescription-list">
                        {selectedPrescription.detalles.map((detail) => (
                          <div
                            className="clinical-attention-prescription-item"
                            key={`${selectedPrescription.id}-${detail.id}`}
                          >
                            <strong>{detail.medicamento}</strong>
                            <span>{detail.presentacion || "Sin presentación"}</span>
                            <span>{detail.dosis}</span>
                            <span>{detail.frecuencia}</span>
                            <span>{detail.duracion}</span>
                            <span>
                              {detail.viaAdministracion || "Sin vía de administración"}
                            </span>
                            <p>{detail.indicaciones || "Sin indicaciones"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {selectedAttention && (
            <section className="clinical-attention-detail-card">
              <div className="clinical-attention-form-card__header">
                <div>
                  <h2>Planes de Tratamiento</h2>
                  <p>
                    Organiza actividades, controles y medicación asociadas a esta
                    atención clínica.
                  </p>
                </div>

                {canManageClinicalAttention ? (
                  <IonButton
                    className="clinical-attention-hero__cta"
                    onClick={() => {
                      setTreatmentPlanFormError("");
                      setEditingTreatmentPlanId(null);
                      setTreatmentPlanFormData(
                        getDefaultTreatmentPlanForm(selectedAttention),
                      );
                      setIsTreatmentPlanFormVisible((current) => !current);
                    }}
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Nuevo Plan
                  </IonButton>
                ) : null}
              </div>

              {isTreatmentPlanFormVisible && (
                <form
                  className="clinical-attention-form"
                  onSubmit={handleTreatmentPlanSubmit}
                >
                  <div className="clinical-attention-form__grid">
                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Título"
                      labelPlacement="stacked"
                      value={treatmentPlanFormData.titulo}
                      onIonInput={(event) =>
                        updateTreatmentPlanField(
                          "titulo",
                          String(event.detail.value ?? ""),
                        )
                      }
                    />

                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Fecha de inicio"
                      labelPlacement="stacked"
                      type="date"
                      value={treatmentPlanFormData.fechaInicio}
                      onIonInput={(event) =>
                        updateTreatmentPlanField(
                          "fechaInicio",
                          String(event.detail.value ?? ""),
                        )
                      }
                    />

                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Fecha fin estimada"
                      labelPlacement="stacked"
                      type="date"
                      value={treatmentPlanFormData.fechaFinEstimada}
                      onIonInput={(event) =>
                        updateTreatmentPlanField(
                          "fechaFinEstimada",
                          String(event.detail.value ?? ""),
                        )
                      }
                    />

                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Veterinario"
                      labelPlacement="stacked"
                      readonly
                      value={
                        selectedAttentionAppointment
                          ? getAppointmentVeterinarianName(
                              selectedAttentionAppointment,
                            )
                          : selectedAttention.veterinarianId > 0
                            ? `Veterinario #${selectedAttention.veterinarianId}`
                            : ""
                      }
                    />

                    <IonTextarea
                      className="clinical-attention-field clinical-attention-field--full"
                      fill="outline"
                      label="Descripción"
                      labelPlacement="stacked"
                      autoGrow
                      value={treatmentPlanFormData.descripcion}
                      onIonInput={(event) =>
                        updateTreatmentPlanField(
                          "descripcion",
                          String(event.detail.value ?? ""),
                        )
                      }
                    />
                  </div>

                  <div className="clinical-attention-subsection">
                    <div className="clinical-attention-subsection__header">
                      <h3>Actividades del plan</h3>
                      <IonButton
                        fill="outline"
                        type="button"
                        onClick={addTreatmentPlanActivity}
                      >
                        Agregar actividad
                      </IonButton>
                    </div>

                    {treatmentPlanFormData.actividades.map((activity, index) => (
                      <div
                        className="clinical-attention-prescription-detail"
                        key={`treatment-plan-activity-${index}`}
                      >
                        <div className="clinical-attention-form__grid">
                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Tipo"
                            labelPlacement="stacked"
                            value={activity.tipo}
                            onIonInput={(event) =>
                              updateTreatmentPlanActivityField(
                                index,
                                "tipo",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Responsable"
                            labelPlacement="stacked"
                            value={activity.responsable}
                            onIonInput={(event) =>
                              updateTreatmentPlanActivityField(
                                index,
                                "responsable",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonTextarea
                            className="clinical-attention-field clinical-attention-field--full"
                            fill="outline"
                            label="Descripción"
                            labelPlacement="stacked"
                            autoGrow
                            value={activity.descripcion}
                            onIonInput={(event) =>
                              updateTreatmentPlanActivityField(
                                index,
                                "descripcion",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Fecha programada"
                            labelPlacement="stacked"
                            type="date"
                            value={activity.fechaProgramada}
                            onIonInput={(event) =>
                              updateTreatmentPlanActivityField(
                                index,
                                "fechaProgramada",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Hora programada"
                            labelPlacement="stacked"
                            type="time"
                            value={activity.horaProgramada}
                            onIonInput={(event) =>
                              updateTreatmentPlanActivityField(
                                index,
                                "horaProgramada",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonInput
                            className="clinical-attention-field"
                            fill="outline"
                            label="Frecuencia"
                            labelPlacement="stacked"
                            value={activity.frecuencia}
                            onIonInput={(event) =>
                              updateTreatmentPlanActivityField(
                                index,
                                "frecuencia",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />

                          <IonTextarea
                            className="clinical-attention-field clinical-attention-field--full"
                            fill="outline"
                            label="Observaciones"
                            labelPlacement="stacked"
                            autoGrow
                            value={activity.observaciones}
                            onIonInput={(event) =>
                              updateTreatmentPlanActivityField(
                                index,
                                "observaciones",
                                String(event.detail.value ?? ""),
                              )
                            }
                          />
                        </div>

                        <div className="clinical-attention-form__actions">
                          <IonButton
                            color="danger"
                            fill="clear"
                            type="button"
                            onClick={() => removeTreatmentPlanActivity(index)}
                          >
                            Quitar actividad
                          </IonButton>
                        </div>
                      </div>
                    ))}
                  </div>

                  {treatmentPlanFormError && (
                    <IonText color="danger">
                      <p className="clinical-attention-feedback">
                        {treatmentPlanFormError}
                      </p>
                    </IonText>
                  )}

                  <div className="clinical-attention-form__actions">
                    <IonButton
                      fill="outline"
                      type="button"
                      onClick={resetTreatmentPlanForm}
                    >
                      Cancelar
                    </IonButton>
                    <IonButton type="submit" disabled={isTreatmentPlanSaving}>
                      {isTreatmentPlanSaving
                        ? "Guardando..."
                        : editingTreatmentPlanId !== null
                          ? "Actualizar plan"
                          : "Guardar plan"}
                    </IonButton>
                  </div>
                </form>
              )}

              {treatmentPlanError && (
                <IonText color="warning">
                  <p className="clinical-attention-feedback">
                    {treatmentPlanError}
                  </p>
                </IonText>
              )}

              {isTreatmentPlanLoading ? (
                <div className="clinical-attention-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando planes de tratamiento...</span>
                </div>
              ) : treatmentPlans.length === 0 ? (
                <IonText color="medium">
                  <p className="clinical-attention-feedback">
                    Esta atención clínica aún no tiene planes de tratamiento.
                  </p>
                </IonText>
              ) : (
                <>
                  <div className="clinical-attention-table-wrapper">
                    <table className="clinical-attention-table clinical-attention-table--compact">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Título</th>
                          <th>Estado</th>
                          <th>Inicio</th>
                          <th>Actividades</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentPlans.map((plan, index) => (
                          <tr key={plan.id}>
                            <td>{index + 1}</td>
                            <td>{plan.titulo}</td>
                            <td>
                              <IonSelect
                                className="clinical-attention-status-select"
                                interface="popover"
                                value={plan.estado}
                                disabled={
                                  !canManageClinicalAttention ||
                                  updatingTreatmentPlanStatusId === plan.id
                                }
                                onIonChange={(event) =>
                                  handleTreatmentPlanStatusChange(
                                    plan.id,
                                    String(event.detail.value ?? plan.estado),
                                  )
                                }
                              >
                                {treatmentPlanStatuses.map((status) => (
                                  <IonSelectOption key={status} value={status}>
                                    {status}
                                  </IonSelectOption>
                                ))}
                              </IonSelect>
                            </td>
                            <td>{plan.fechaInicio || "Sin fecha"}</td>
                            <td>{plan.actividades.length}</td>
                            <td>
                              <div className="clinical-attention-actions">
                                {canManageClinicalAttention ? (
                                  <button
                                    className="clinical-attention-action clinical-attention-action--edit"
                                    type="button"
                                    onClick={() =>
                                      handleStartTreatmentPlanEdit(plan.id)
                                    }
                                  >
                                    <IonIcon icon={pencilOutline} />
                                  </button>
                                ) : null}
                                <button
                                  className="clinical-attention-action clinical-attention-action--view"
                                  type="button"
                                  onClick={() => handleViewTreatmentPlan(plan.id)}
                                >
                                  <IonIcon icon={eyeOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="clinical-attention-mobile-list">
                    {treatmentPlans.map((plan, index) => (
                      <article
                        className="clinical-attention-mobile-card"
                        key={plan.id}
                      >
                        <div className="clinical-attention-mobile-card__top">
                          <span className="clinical-attention-mobile-card__index">
                            #{index + 1}
                          </span>
                          <span className="clinical-attention-mobile-card__meta-pill">
                            {plan.estado}
                          </span>
                        </div>

                        <h2>{plan.titulo}</h2>
                        <p>{plan.descripcion || "Sin descripción"}</p>

                        <div className="clinical-attention-mobile-card__meta">
                          <span>{plan.actividades.length} actividades</span>
                          <strong>{plan.fechaInicio || "Sin fecha"}</strong>
                        </div>

                        <div className="clinical-attention-actions">
                          {canManageClinicalAttention ? (
                            <button
                              className="clinical-attention-action clinical-attention-action--edit"
                              type="button"
                              onClick={() => handleStartTreatmentPlanEdit(plan.id)}
                            >
                              <IonIcon icon={pencilOutline} />
                            </button>
                          ) : null}
                          <button
                            className="clinical-attention-action clinical-attention-action--view"
                            type="button"
                            onClick={() => handleViewTreatmentPlan(plan.id)}
                          >
                            <IonIcon icon={eyeOutline} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {selectedTreatmentPlan && (
                <div className="clinical-attention-prescription-view">
                  <div className="clinical-attention-form-card__header">
                    <div>
                      <h2>Detalle del plan de tratamiento</h2>
                      <p>Actividades, fechas y responsables del plan.</p>
                    </div>

                    <IonButton
                      aria-label="Cerrar detalle de plan"
                      className="clinical-attention-form-card__close"
                      fill="clear"
                      onClick={() => setSelectedTreatmentPlan(null)}
                    >
                      <IonIcon icon={closeOutline} slot="icon-only" />
                    </IonButton>
                  </div>

                  <div className="clinical-attention-detail-grid">
                    <div className="clinical-attention-detail-item">
                      <span>Título</span>
                      <strong>{selectedTreatmentPlan.titulo}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Estado</span>
                      <strong>{selectedTreatmentPlan.estado}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Inicio</span>
                      <strong>{selectedTreatmentPlan.fechaInicio || "Sin fecha"}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Fin estimado</span>
                      <strong>
                        {selectedTreatmentPlan.fechaFinEstimada || "Sin fecha"}
                      </strong>
                    </div>
                    <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                      <span>Descripción</span>
                      <strong>
                        {selectedTreatmentPlan.descripcion || "Sin descripción"}
                      </strong>
                    </div>
                  </div>

                  <div className="clinical-attention-subsection">
                    <div className="clinical-attention-subsection__header">
                      <h3>Actividades programadas</h3>
                    </div>

                    {selectedTreatmentPlan.actividades.length === 0 ? (
                      <IonText color="medium">
                        <p className="clinical-attention-feedback">
                          El plan no registra actividades.
                        </p>
                      </IonText>
                    ) : (
                      <div className="clinical-attention-prescription-list">
                        {selectedTreatmentPlan.actividades.map((activity) => (
                          <div
                            className="clinical-attention-prescription-item"
                            key={`${selectedTreatmentPlan.id}-${activity.id}`}
                          >
                            <strong>{activity.tipo}</strong>
                            <span>{activity.descripcion}</span>
                            <span>
                              {activity.fechaProgramada || "Sin fecha"}{" "}
                              {activity.horaProgramada || ""}
                            </span>
                            <span>{activity.frecuencia || "Sin frecuencia"}</span>
                            <span>{activity.responsable || "Sin responsable"}</span>
                            <span>{activity.estado || "Sin estado"}</span>
                            <p>{activity.observaciones || "Sin observaciones"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {selectedAttention && (
            <section className="clinical-attention-detail-card">
              <div className="clinical-attention-form-card__header">
                <div>
                  <h2>Seguimientos</h2>
                  <p>
                    Programa controles posteriores y gestiona su cierre o
                    cancelación.
                  </p>
                </div>

                {canManageClinicalAttention ? (
                  <IonButton
                    className="clinical-attention-hero__cta"
                    onClick={() => {
                      if (isFollowUpFormVisible) {
                        resetFollowUpForm();
                        return;
                      }

                      void openFollowUpForm(selectedAttention);
                    }}
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Nuevo Seguimiento
                  </IonButton>
                ) : null}
              </div>

              {isFollowUpFormVisible && (
                <form className="clinical-attention-form" onSubmit={handleFollowUpSubmit}>
                  <div className="clinical-attention-form__grid">
                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Tipo"
                      labelPlacement="stacked"
                      value={followUpFormData.tipo}
                      onIonInput={(event) =>
                        updateFollowUpField(
                          "tipo",
                          String(event.detail.value ?? ""),
                        )
                      }
                    />

                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Fecha programada"
                      labelPlacement="stacked"
                      type="datetime-local"
                      value={followUpFormData.fechaProgramada}
                      onIonInput={(event) =>
                        updateFollowUpField(
                          "fechaProgramada",
                          String(event.detail.value ?? ""),
                        )
                      }
                    />

                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Dueño notificado"
                      labelPlacement="stacked"
                      readonly
                      value={
                        isFollowUpOwnerLoading
                          ? "Cargando dueño..."
                          : followUpOwner
                            ? `${followUpOwner.nombre} ${followUpOwner.apellido}`.trim()
                            : ""
                      }
                    />

                    <IonInput
                      className="clinical-attention-field"
                      fill="outline"
                      label="Veterinario"
                      labelPlacement="stacked"
                      readonly
                      value={
                        selectedAttentionAppointment
                          ? getAppointmentVeterinarianName(
                              selectedAttentionAppointment,
                            )
                          : selectedAttention.veterinarianId > 0
                            ? `Veterinario #${selectedAttention.veterinarianId}`
                            : ""
                      }
                    />

                    <IonTextarea
                      className="clinical-attention-field clinical-attention-field--full"
                      fill="outline"
                      label="Motivo"
                      labelPlacement="stacked"
                      autoGrow
                      value={followUpFormData.motivo}
                      onIonInput={(event) =>
                        updateFollowUpField(
                          "motivo",
                          String(event.detail.value ?? ""),
                        )
                      }
                    />
                  </div>

                  {followUpFormError && (
                    <IonText color="danger">
                      <p className="clinical-attention-feedback">
                        {followUpFormError}
                      </p>
                    </IonText>
                  )}

                  <div className="clinical-attention-form__actions">
                    <IonButton fill="outline" type="button" onClick={resetFollowUpForm}>
                      Cancelar
                    </IonButton>
                    <IonButton type="submit" disabled={isFollowUpSaving}>
                      {isFollowUpSaving ? "Guardando..." : "Guardar seguimiento"}
                    </IonButton>
                  </div>
                </form>
              )}

              {followUpError && (
                <IonText color="warning">
                  <p className="clinical-attention-feedback">{followUpError}</p>
                </IonText>
              )}

              {isFollowUpLoading ? (
                <div className="clinical-attention-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando seguimientos...</span>
                </div>
              ) : followUps.length === 0 ? (
                <IonText color="medium">
                  <p className="clinical-attention-feedback">
                    Esta atención clínica aún no tiene seguimientos programados.
                  </p>
                </IonText>
              ) : (
                <>
                  <div className="clinical-attention-table-wrapper">
                    <table className="clinical-attention-table clinical-attention-table--compact">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Fecha programada</th>
                          <th>Motivo</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {followUps.map((followUp, index) => (
                          <tr key={followUp.id}>
                            <td>{index + 1}</td>
                            <td>{followUp.tipo}</td>
                            <td>{followUp.estado}</td>
                            <td>{formatDateTime(followUp.fechaProgramada)}</td>
                            <td>{followUp.motivo}</td>
                            <td>
                              <div className="clinical-attention-actions">
                                <button
                                  className="clinical-attention-action clinical-attention-action--view"
                                  type="button"
                                  onClick={() => setSelectedFollowUp(followUp)}
                                >
                                  <IonIcon icon={eyeOutline} />
                                </button>
                                {canManageClinicalAttention &&
                                followUp.estado !== "COMPLETADO" &&
                                followUp.estado !== "CANCELADO" ? (
                                  <button
                                    className="clinical-attention-action clinical-attention-action--edit"
                                    type="button"
                                    onClick={() => {
                                      setSelectedFollowUp(followUp);
                                      setCompletingFollowUpId(followUp.id);
                                      setFollowUpCompletionDraft(
                                        followUp.resultado || "",
                                      );
                                    }}
                                  >
                                    <IonIcon icon={pencilOutline} />
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="clinical-attention-mobile-list">
                    {followUps.map((followUp, index) => (
                      <article
                        className="clinical-attention-mobile-card"
                        key={followUp.id}
                      >
                        <div className="clinical-attention-mobile-card__top">
                          <span className="clinical-attention-mobile-card__index">
                            #{index + 1}
                          </span>
                          <span className="clinical-attention-mobile-card__meta-pill">
                            {followUp.estado}
                          </span>
                        </div>

                        <h2>{followUp.tipo}</h2>
                        <p>{followUp.motivo}</p>

                        <div className="clinical-attention-mobile-card__meta">
                          <span>{formatDateTime(followUp.fechaProgramada)}</span>
                          <strong>{followUp.mascotaNombre}</strong>
                        </div>

                        <div className="clinical-attention-actions">
                          <button
                            className="clinical-attention-action clinical-attention-action--view"
                            type="button"
                            onClick={() => setSelectedFollowUp(followUp)}
                          >
                            <IonIcon icon={eyeOutline} />
                          </button>
                          {canManageClinicalAttention &&
                          followUp.estado !== "COMPLETADO" &&
                          followUp.estado !== "CANCELADO" ? (
                            <button
                              className="clinical-attention-action clinical-attention-action--edit"
                              type="button"
                              onClick={() => {
                                setSelectedFollowUp(followUp);
                                setCompletingFollowUpId(followUp.id);
                                setFollowUpCompletionDraft(
                                  followUp.resultado || "",
                                );
                              }}
                            >
                              <IonIcon icon={pencilOutline} />
                            </button>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {selectedFollowUp && (
                <div className="clinical-attention-prescription-view">
                  <div className="clinical-attention-form-card__header">
                    <div>
                      <h2>Detalle del seguimiento</h2>
                      <p>Programación, estado y resultado del control posterior.</p>
                    </div>

                    <IonButton
                      aria-label="Cerrar detalle de seguimiento"
                      className="clinical-attention-form-card__close"
                      fill="clear"
                      onClick={() => {
                        setSelectedFollowUp(null);
                        setCompletingFollowUpId(null);
                        setFollowUpCompletionDraft("");
                      }}
                    >
                      <IonIcon icon={closeOutline} slot="icon-only" />
                    </IonButton>
                  </div>

                  <div className="clinical-attention-detail-grid">
                    <div className="clinical-attention-detail-item">
                      <span>Tipo</span>
                      <strong>{selectedFollowUp.tipo}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Estado</span>
                      <strong>{selectedFollowUp.estado}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Fecha programada</span>
                      <strong>{formatDateTime(selectedFollowUp.fechaProgramada)}</strong>
                    </div>
                    <div className="clinical-attention-detail-item">
                      <span>Fecha completada</span>
                      <strong>
                        {selectedFollowUp.fechaCompletada
                          ? formatDateTime(selectedFollowUp.fechaCompletada)
                          : "Pendiente"}
                      </strong>
                    </div>
                    <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                      <span>Motivo</span>
                      <strong>{selectedFollowUp.motivo}</strong>
                    </div>
                    <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                      <span>Resultado</span>
                      <strong>{selectedFollowUp.resultado || "Sin resultado"}</strong>
                    </div>
                  </div>

                  {canManageClinicalAttention &&
                  selectedFollowUp.estado !== "COMPLETADO" &&
                  selectedFollowUp.estado !== "CANCELADO" ? (
                    <div className="clinical-attention-subsection">
                      <div className="clinical-attention-subsection__header">
                        <h3>Completar o cancelar seguimiento</h3>
                      </div>

                      <IonTextarea
                        className="clinical-attention-field"
                        fill="outline"
                        label="Resultado"
                        labelPlacement="stacked"
                        autoGrow
                        value={
                          completingFollowUpId === selectedFollowUp.id
                            ? followUpCompletionDraft
                            : ""
                        }
                        onIonInput={(event) =>
                          setFollowUpCompletionDraft(
                            String(event.detail.value ?? ""),
                          )
                        }
                      />

                      <div className="clinical-attention-form__actions">
                        <IonButton
                          type="button"
                          disabled={updatingFollowUpId === selectedFollowUp.id}
                          onClick={() => handleCompleteFollowUp(selectedFollowUp.id)}
                        >
                          Completar seguimiento
                        </IonButton>
                        <IonButton
                          color="danger"
                          fill="outline"
                          type="button"
                          disabled={updatingFollowUpId === selectedFollowUp.id}
                          onClick={() => handleCancelFollowUp(selectedFollowUp.id)}
                        >
                          Cancelar seguimiento
                        </IonButton>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ClinicalAttention;
