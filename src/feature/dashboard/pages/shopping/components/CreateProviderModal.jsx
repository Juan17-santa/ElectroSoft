import { useState, useEffect, useRef, useCallback } from "react";
import {
    X, IdCard, FileText, User, Phone, Mail, MapPin, Building2,
    AlertCircle, CheckCircle2, Truck, Tag, ChevronDown,
} from "lucide-react";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import CustomSelect from "../../../components/ui/CustomSelect";
import { ServicesShopping } from "../services/ServicesShopping";
import { toTitleCase } from "../helpers/shoppingHelpers";

// ─── Indicador de validación ───────────────────────────────────────────────────
function FieldStatus({ estado }) {
    if (estado === null) return null;
    return (
        <div
            className={`flex items-center gap-1 text-xs mt-1 transition-all duration-300 ${
                estado.valido ? "text-green-500" : "text-red-500"
            }`}
            style={{ minHeight: "16px" }}
        >
            {estado.valido
                ? <><CheckCircle2 size={12} /><span>Listo</span></>
                : <><AlertCircle  size={12} /><span>{estado.mensaje}</span></>
            }
        </div>
    );
}

// ─── Clase dinámica del ring ───────────────────────────────────────────────────
function ring(estado) {
    if (estado === null) return "focus:ring-gray-400";
    return estado.valido
        ? "ring-1 ring-green-300 focus:ring-green-400"
        : "ring-1 ring-red-300 focus:ring-red-400";
}

export default function CreateProviderModal({ onClose, onSuccess }) {
    // ─── Campos ────────────────────────────────────────────────────────────────
    const [providerType,      setProviderType]      = useState("NATURAL");
    const [documentType,      setDocumentType]      = useState("");
    const [docNumber,         setDocNumber]         = useState("");
    const [providerName,      setProviderName]      = useState("");
    const [providerEmail,     setProviderEmail]     = useState("");
    const [providerPhone,     setProviderPhone]     = useState("");
    const [address,           setAddress]           = useState("");
    const [contactName,       setContactName]       = useState("");
    const [contactEmail,      setContactEmail]      = useState("");
    const [contactPhone,      setContactPhone]      = useState("");
    const [categoriesAssociated, setCategoriesAssociated] = useState([]);
    const [open,              setOpen]              = useState(false);
    const [saving,            setSaving]            = useState(false);
    const [apiError,          setApiError]          = useState("");

    // ─── Datos auxiliares ──────────────────────────────────────────────────────
    const [categoriesList,       setCategoriesList]       = useState([]);
    const [documentTypes,        setDocumentTypes]        = useState([]);
    const [existingDocuments,    setExistingDocuments]    = useState([]);
    const [existingNames,        setExistingNames]        = useState([]);

    // ─── Ref para dropdown ─────────────────────────────────────────────────────
    const dropdownRef = useRef(null);

    const isNatural  = providerType === "NATURAL";
    const isJuridica = providerType === "JURIDICA";

    // ─── Tocados ───────────────────────────────────────────────────────────────
    const [tocados, setTocados] = useState({
        providerType: false, documentType: false, docNumber: false,
        providerName: false, providerEmail: false, providerPhone: false,
        address: false, contactName: false, contactEmail: false,
        contactPhone: false,
    });

    // ─── Validación de emails únicos (existencias) con debounce ───────────────
    const [emailEstados, setEmailEstados] = useState({
        providerEmail: null, contactEmail: null,
    });
    const emailCheckRef = useRef({ providerEmail: "", contactEmail: "" });

    const validarFormatoEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || "").trim());

    const checkEmailUnico = useCallback(async (field, value) => {
        const correo = String(value || "").trim().toLowerCase();
        if (!correo || !validarFormatoEmail(correo)) return null;
        const result = await ServicesShopping.checkProviderUnique({ [field]: correo });
        if (result && result.exists) {
            return {
                valido: false,
                mensaje: result.message || "Este correo ya se encuentra registrado.",
            };
        }
        return null;
    }, []);

    // Consulta la existencia de los correos en tiempo real (debounce).
    useEffect(() => {
        const timers = {};
        const campos = [
            { field: "providerEmail", value: providerEmail, tocado: tocados.providerEmail },
            { field: "contactEmail", value: contactEmail, tocado: tocados.contactEmail },
        ];

        campos.forEach(({ field, value, tocado }) => {
            emailCheckRef.current[field] = value;
            if (timers[field]) clearTimeout(timers[field]);

            if (!tocado || !value || !validarFormatoEmail(value)) {
                setEmailEstados((prev) => ({ ...prev, [field]: null }));
                return;
            }

            timers[field] = setTimeout(async () => {
                if (emailCheckRef.current[field] !== value) return;
                const res = await checkEmailUnico(field, value);
                if (emailCheckRef.current[field] !== value) return;
                setEmailEstados((prev) => ({ ...prev, [field]: res }));
            }, 300);
        });

        return () => {
            Object.values(timers).forEach((t) => clearTimeout(t));
        };
    }, [providerEmail, contactEmail, tocados, checkEmailUnico]);

    // ─── Tipo de documento NIT ─────────────────────────────────────────────────
    const nitDocumentType = documentTypes.find(
        (doc) => doc.abbreviation === "NIT"
    );

    // ─── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        Promise.all([
            ServicesShopping.fetchCategories(),
            ServicesShopping.fetchProviders(),
            ServicesShopping.fetchDocumentTypes(),
        ])
            .then(([categories, providers, docs]) => {
                if (!mounted) return;
                setCategoriesList(categories.filter((c) => c.estado));
                setDocumentTypes(docs);
                setExistingDocuments(providers.map((p) => (p.document || "").trim().toLowerCase()));
                setExistingNames(providers.map((p) => (p.providerName || "").trim().toLowerCase()));
            })
            .catch((err) => {
                if (mounted) setApiError(err.message || "No se pudieron cargar los catálogos.");
            });
        return () => { mounted = false; };
    }, []);

    // ─── Cerrar dropdown al clickear afuera ────────────────────────────────────
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ─── Cuando cambia el tipo, resetear campos dependientes ───────────────────
    useEffect(() => {
        if (isJuridica) {
            setDocumentType(nitDocumentType?._id || "");
            setContactName("");
            setContactEmail("");
            setContactPhone("");
        } else {
            setDocumentType("");
            setContactName("");
            setContactEmail("");
            setContactPhone("");
        }
        setTocados((t) => ({ ...t, documentType: false }));
    }, [providerType, isJuridica, nitDocumentType?._id]);

    const tocar = (campo) => setTocados((t) => ({ ...t, [campo]: true }));

    const handleToggleCategory = (categoryId) => {
        setCategoriesAssociated((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // ─── Validaciones ─────────────────────────────────────────────────────────
    const validarDocumentType = (val) => {
        if (!val) return { valido: false, mensaje: "Selecciona un tipo de documento." };
        return { valido: true, mensaje: "" };
    };

    const validarDocument = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "El documento es obligatorio." };
        if (!/^\d+$/.test(val)) return { valido: false, mensaje: "Solo se permiten números." };
        if (val.length < 8 || val.length > 12) return { valido: false, mensaje: "Debe tener entre 8 y 12 dígitos." };
        if (existingDocuments.includes(val.trim().toLowerCase())) return { valido: false, mensaje: "Ya existe un proveedor con ese documento." };
        return { valido: true, mensaje: "" };
    };

    const validarProviderName = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "El nombre del proveedor es obligatorio." };
        if (val.trim().length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres." };
        if (isNatural && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val.trim())) return { valido: false, mensaje: "Solo se permiten letras." };
        if (isJuridica && !/^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,&-]+$/.test(val.trim())) return { valido: false, mensaje: "Solo letras, números y símbolos (., &, -)." };
        if (existingNames.includes(val.trim().toLowerCase())) return { valido: false, mensaje: "Ya existe un proveedor con ese nombre." };
        return { valido: true, mensaje: "" };
    };

    const validarProviderEmail = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "El correo es obligatorio." };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return { valido: false, mensaje: "Correo no válido." };
        return { valido: true, mensaje: "" };
    };

    const validarProviderPhone = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "El teléfono es obligatorio." };
        if (!/^\d+$/.test(val)) return { valido: false, mensaje: "Solo se permiten números." };
        if (val.length < 8 || val.length > 14) return { valido: false, mensaje: "Debe tener entre 8 y 14 dígitos." };
        return { valido: true, mensaje: "" };
    };

    const validarAddress = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "La dirección es obligatoria." };
        if (val.trim().length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres." };
        return { valido: true, mensaje: "" };
    };

    const validarContactName = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "El nombre del contacto es obligatorio." };
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val.trim())) return { valido: false, mensaje: "Solo se permiten letras." };
        return { valido: true, mensaje: "" };
    };

    const validarContactEmail = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "El correo del contacto es obligatorio." };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return { valido: false, mensaje: "Correo no válido." };
        return { valido: true, mensaje: "" };
    };

    const validarContactPhone = (val) => {
        if (!val || !val.trim()) return { valido: false, mensaje: "El teléfono del contacto es obligatorio." };
        if (!/^\d+$/.test(val)) return { valido: false, mensaje: "Solo se permiten números." };
        if (val.length < 8 || val.length > 14) return { valido: false, mensaje: "Debe tener entre 8 y 14 dígitos." };
        return { valido: true, mensaje: "" };
    };

    // ─── Estados de validación ────────────────────────────────────────────────
    const estadoDocumentType = tocados.documentType   ? validarDocumentType(documentType)       : null;
    const estadoDocument      = tocados.docNumber  ? validarDocument(docNumber)                : null;
    const estadoProviderName  = tocados.providerName   ? validarProviderName(providerName)        : null;
    const estadoProviderEmail = tocados.providerEmail  ? (emailEstados.providerEmail ?? validarProviderEmail(providerEmail)) : null;
    const estadoProviderPhone = tocados.providerPhone  ? validarProviderPhone(providerPhone)      : null;
    const estadoAddress       = tocados.address        ? validarAddress(address)                  : null;
    const estadoContactName   = tocados.contactName    ? validarContactName(contactName)          : null;
    const estadoContactEmail  = tocados.contactEmail   ? (emailEstados.contactEmail ?? validarContactEmail(contactEmail)) : null;
    const estadoContactPhone  = tocados.contactPhone   ? validarContactPhone(contactPhone)        : null;

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setTocados({
            documentType: true, docNumber: true, providerName: true,
            providerEmail: true, providerPhone: true, address: true,
            contactName: true, contactEmail: true, contactPhone: true,
        });

        // Verificación de unicidad de correos en el momento de enviar.
        const emailRes = await checkEmailUnico("providerEmail", providerEmail);
        setEmailEstados((prev) => ({ ...prev, providerEmail: emailRes }));

        let contactRes = null;
        if (isJuridica) {
            contactRes = await checkEmailUnico("contactEmail", contactEmail);
            setEmailEstados((prev) => ({ ...prev, contactEmail: contactRes }));
        }

        const validations = [
            validarDocumentType(isJuridica ? nitDocumentType?._id : documentType).valido,
            validarDocument(docNumber).valido,
            validarProviderName(providerName).valido,
            (emailRes ? emailRes.valido : validarProviderEmail(providerEmail).valido),
            validarProviderPhone(providerPhone).valido,
            validarAddress(address).valido,
        ];

        if (isJuridica) {
            validations.push(
                validarContactName(contactName).valido,
                (contactRes ? contactRes.valido : validarContactEmail(contactEmail).valido),
                validarContactPhone(contactPhone).valido
            );
        }

        if (!validations.every(Boolean)) return;

        setSaving(true);
        setApiError("");
        try {
            const payload = {
                providerType,
                documentType: isJuridica ? nitDocumentType?._id : documentType,
                document: docNumber.trim(),
                providerName: toTitleCase(providerName.trim()),
                providerEmail: providerEmail.trim().toLowerCase(),
                providerPhone: providerPhone.trim(),
                address: address.trim(),
                categoriesAssociated,
            };

            if (isJuridica) {
                payload.contactName  = toTitleCase(contactName.trim());
                payload.contactEmail = contactEmail.trim().toLowerCase();
                payload.contactPhone = contactPhone.trim();
            } else {
                payload.contactName = toTitleCase(providerName.trim());
            }

            const nuevoProveedor = await ServicesShopping.createProvider(payload);

            if (onSuccess) onSuccess(nuevoProveedor);
            onClose();
        } catch (err) {
            setApiError(err.message || "No se pudo crear el proveedor.");
        } finally {
            setSaving(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-1">
                    <div>
                        <p className="text-base font-semibold flex items-center gap-2">
                            <Truck size={18} className="text-yellow-400" />
                            Crear nuevo <span className="text-yellow-400">proveedor</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Complete todos los campos obligatorios del formulario
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="hover:bg-gray-100 p-1.5 rounded-lg transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* TIPO DE PROVEEDOR */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => { setProviderType("NATURAL"); tocar("providerType"); }}
                        className={`rounded-2xl border-2 p-4 bg-white text-left transition-all duration-300 cursor-pointer ${
                            isNatural ? "border-yellow-400 shadow-lg" : "border-gray-200 hover:border-yellow-300"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isNatural ? "border-yellow-400" : "border-gray-300"}`}>
                                <span className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 ${isNatural ? "bg-yellow-400 scale-100" : "scale-0"}`} />
                            </span>
                            <User size={18} className="text-yellow-400 shrink-0" />
                            <div className="flex flex-col">
                                <h3 className="font-bold text-sm leading-tight">Persona Natural</h3>
                                <p className="text-xs text-gray-500 leading-tight mt-0.5">A título personal.</p>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setProviderType("JURIDICA"); tocar("providerType"); }}
                        className={`rounded-2xl border-2 p-4 bg-white text-left transition-all duration-300 cursor-pointer ${
                            isJuridica ? "border-yellow-400 shadow-lg" : "border-gray-200 hover:border-yellow-300"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isJuridica ? "border-yellow-400" : "border-gray-300"}`}>
                                <span className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 ${isJuridica ? "bg-yellow-400 scale-100" : "scale-0"}`} />
                            </span>
                            <Building2 size={18} className="text-yellow-400 shrink-0" />
                            <div className="flex flex-col">
                                <h3 className="font-bold text-sm leading-tight">Persona Jurídica</h3>
                                <p className="text-xs text-gray-500 leading-tight mt-0.5">Empresas con NIT.</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* SEPARADOR */}
                <div className="mt-4 mb-2 border-b border-gray-200 pb-2">
                    <h3 className="text-sm font-semibold text-gray-800">Datos del proveedor</h3>
                </div>

                {/* CAMPOS */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-2">

                    {/* TIPO DOCUMENTO — solo para NATURAL */}
                    {isNatural && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                <IdCard size={18} />
                                <span>Tipo de documento *</span>
                            </div>
                            <CustomSelect
                                value={documentType}
                                onChange={(val) => { setDocumentType(val); tocar("documentType"); }}
                                options={documentTypes
                                    .filter((doc) => !doc.abbreviation?.includes("NIT"))
                                    .map((doc) => ({
                                        value: doc._id ?? String(doc.id),
                                        label: doc.name
                                            ? (doc.abbreviation ? `${doc.name} (${doc.abbreviation})` : doc.name)
                                            : (doc.abbreviation || "")
                                    }))}
                                placeholder="Selecciona tipo de documento"
                                width="w-full"
                            />
                            <FieldStatus estado={estadoDocumentType} />
                        </div>
                    )}

                    {/* DOCUMENTO */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <FileText size={18} />
                            <span>{isNatural ? "Documento *" : "NIT *"}</span>
                        </div>
                        <input
                            type="text"
                            placeholder={isNatural ? "Ingrese el documento" : "Ingrese el NIT"}
                            value={docNumber}
                            onChange={(e) => { setDocNumber(e.target.value.replace(/\D/g, "")); tocar("docNumber"); }}
                            onBlur={() => tocar("docNumber")}
                            maxLength={12}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoDocument)}`}
                        />
                        <FieldStatus estado={estadoDocument} />
                    </div>

                    {/* NOMBRE PROVEEDOR */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <User size={18} />
                            <span>{isNatural ? "Nombre completo *" : "Razón social *"}</span>
                        </div>
                        <input
                            type="text"
                            placeholder={isNatural ? "Ingrese el nombre completo" : "Ingrese la razón social"}
                            value={providerName}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (isNatural) val = val.replace(/[0-9]/g, "");
                                setProviderName(val.slice(0, 100));
                                tocar("providerName");
                            }}
                            onBlur={() => tocar("providerName")}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoProviderName)}`}
                        />
                        <FieldStatus estado={estadoProviderName} />
                    </div>

                    {/* EMAIL PROVEEDOR */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <Mail size={18} />
                            <span>{isNatural ? "Correo electrónico *" : "Correo de la empresa *"}</span>
                        </div>
                        <input
                            type="email"
                            placeholder={isNatural ? "correo@ejemplo.com" : "correo@empresa.com"}
                            value={providerEmail}
                            onChange={(e) => { setProviderEmail(e.target.value); tocar("providerEmail"); }}
                            onBlur={() => tocar("providerEmail")}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoProviderEmail)}`}
                        />
                        <FieldStatus estado={estadoProviderEmail} />
                    </div>

                    {/* TELÉFONO PROVEEDOR */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <Phone size={18} />
                            <span>{isNatural ? "Teléfono *" : "Teléfono de la empresa *"}</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: 3001234567"
                            value={providerPhone}
                            onChange={(e) => { setProviderPhone(e.target.value.replace(/\D/g, "").slice(0, 14)); tocar("providerPhone"); }}
                            onBlur={() => tocar("providerPhone")}
                            maxLength={14}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoProviderPhone)}`}
                        />
                        <FieldStatus estado={estadoProviderPhone} />
                    </div>

                    {/* DIRECCIÓN */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <MapPin size={18} />
                            <span>Dirección *</span>
                        </div>
                        <input
                            type="text"
                            placeholder={isNatural ? "Ingrese su dirección" : "Ingrese la dirección de la empresa"}
                            value={address}
                            onChange={(e) => { setAddress(e.target.value); tocar("address"); }}
                            onBlur={() => tocar("address")}
                            className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoAddress)}`}
                        />
                        <FieldStatus estado={estadoAddress} />
                    </div>

                    {/* ── DATOS DE CONTACTO — solo JURIDICA ──────────────────────── */}
                    {isJuridica && (
                        <>
                            <div className="col-span-2 mt-2 mb-0 border-b border-gray-200 pb-2">
                                <h3 className="text-sm font-semibold text-gray-800">Datos de contacto</h3>
                            </div>

                            {/* NOMBRE CONTACTO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                    <User size={18} />
                                    <span>Nombre contacto *</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ej: Carlos Rodríguez"
                                    value={contactName}
                                    onChange={(e) => { setContactName(e.target.value.replace(/[0-9]/g, "").slice(0, 100)); tocar("contactName"); }}
                                    onBlur={() => tocar("contactName")}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoContactName)}`}
                                />
                                <FieldStatus estado={estadoContactName} />
                            </div>

                            {/* EMAIL CONTACTO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                    <Mail size={18} />
                                    <span>Correo del contacto *</span>
                                </div>
                                <input
                                    type="email"
                                    placeholder="correo@contacto.com"
                                    value={contactEmail}
                                    onChange={(e) => { setContactEmail(e.target.value); tocar("contactEmail"); }}
                                    onBlur={() => tocar("contactEmail")}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoContactEmail)}`}
                                />
                                <FieldStatus estado={estadoContactEmail} />
                            </div>

                            {/* TELÉFONO CONTACTO */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                                    <Phone size={18} />
                                    <span>Teléfono del contacto *</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ej: 3009876543"
                                    value={contactPhone}
                                    onChange={(e) => { setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 14)); tocar("contactPhone"); }}
                                    onBlur={() => tocar("contactPhone")}
                                    maxLength={14}
                                    className={`bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${ring(estadoContactPhone)}`}
                                />
                                <FieldStatus estado={estadoContactPhone} />
                            </div>
                        </>
                    )}

                    {/* ── CATEGORÍAS ───────────────────────────────────────────── */}
                    <div ref={dropdownRef} className="flex flex-col gap-2 relative">
                        <div className="flex items-center text-yellow-400 gap-2 text-sm font-medium">
                            <Tag size={18} />
                            <span>Categorías asociadas</span>
                            <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            className="bg-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 cursor-pointer"
                        >
                            <span className="text-gray-500">
                                {categoriesAssociated.length > 0
                                    ? `${categoriesAssociated.length} seleccionada(s)`
                                    : "Seleccionar categorías"}
                            </span>
                            <ChevronDown
                                size={18}
                                className={`transition-transform text-gray-500 ${open ? "rotate-180" : ""}`}
                            />
                        </button>

                        {open && (
                            <div className="absolute top-full -mt-5 w-full bg-white shadow-lg rounded-xl p-3 max-h-48 overflow-y-auto z-20">
                                {categoriesList.map((cat) => (
                                    <label
                                        key={cat.id}
                                        className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100 px-2 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={categoriesAssociated.includes(cat.id)}
                                            onChange={() => handleToggleCategory(cat.id)}
                                            className="accent-yellow-400"
                                        />
                                        {cat.nombre}
                                    </label>
                                ))}
                            </div>
                        )}
                        <div style={{ minHeight: "16px" }} />
                    </div>

                </div>

                {apiError && <p className="text-xs text-red-500 mt-3">{apiError}</p>}

                {/* BOTONES */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <PrimaryButton type="button" onClick={handleSubmit} disabled={saving}>
                        {saving ? "Creando..." : "Crear proveedor"}
                    </PrimaryButton>
                </div>

            </div>
        </div>
    );
}
