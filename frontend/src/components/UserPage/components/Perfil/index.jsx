import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";
import { toast } from "react-toastify";
import { Save, Edit, X, Camera, Trash2, Eye, EyeOff, Link, UserCheck, UserX, AlertCircle } from "lucide-react";
import Qrcode from "../../../QrcodeCreate";
import { buildApiUrl } from "../../../utils/api";

export const Perfil = ({ user = { name: "" }, onUpdate }) => {
    const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
        defaultValues: user
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formErrors, setFormErrors] = useState([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [confirmEditPassword, setConfirmEditPassword] = useState('');
    const [showConfirmEditPassword, setShowConfirmEditPassword] = useState(false);
    const [inviteCodeInput, setInviteCodeInput] = useState('');
    const [trainerInfo, setTrainerInfo] = useState(null);
    const [isAssociating, setIsAssociating] = useState(false);
    const [associateError, setAssociateError] = useState('');
    const [showDisassociationModal, setShowDisassociationModal] = useState(false);
    const [disassociationReason, setDisassociationReason] = useState('');
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

    const loadTrainerInfo = async () => {
        // Tenta usar user.trainer, se não existir usa user.createdBy como fallback
        const trainerId = user?.trainer || user?.createdBy;

        if (trainerId) {
            try {
                const response = await fetch(buildApiUrl(`/api/users/details/${trainerId}`), {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    // Verificar se é PT de forma mais permissiva
                    const roleName = data.role?.name?.toLowerCase() || '';
                    const scopes = Array.isArray(data.role?.scope) ? data.role.scope : [data.role?.scope];
                    const isTrainer = roleName.includes('trainer') || roleName.includes('pt') ||
                        scopes.some(s => s && typeof s === 'string' && s.toLowerCase().includes('trainer'));

                    console.log('Trainer Check:', { id: trainerId, roleName, scopes, isTrainer });

                    if (isTrainer) {
                        setTrainerInfo(data);
                    }
                }
            } catch (error) {
                console.error('Error loading trainer:', error);
            }
        }
    };

    const checkDisassociationStatus = async () => {
        if (!user?.trainer) return;
        try {
            const response = await fetch(buildApiUrl('/api/users/disassociation-request/status'), {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setHasPendingRequest(data.hasPendingRequest);
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    const associateWithTrainer = async () => {
        if (!inviteCodeInput.trim()) {
            setAssociateError('Introduz um código de convite');
            return;
        }
        setIsAssociating(true);
        setAssociateError('');
        try {
            const response = await fetch(buildApiUrl('/api/users/associate-trainer'), {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: inviteCodeInput })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Associado ao Personal Trainer com sucesso!');
                setInviteCodeInput('');
                if (onUpdate) onUpdate();
                loadTrainerInfo();
            } else {
                setAssociateError(data.error || 'Código inválido');
            }
        } catch (error) {
            setAssociateError('Erro de conexão');
        } finally {
            setIsAssociating(false);
        }
    };

    const handleDisassociationSubmit = async () => {
        if (!disassociationReason || disassociationReason.trim().length < 10) {
            toast.error('Por favor explica o motivo (mínimo 10 caracteres)');
            return;
        }

        setIsSubmittingRequest(true);
        try {
            const response = await fetch(buildApiUrl('/api/users/disassociation-request'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason: disassociationReason })
            });

            if (response.ok) {
                toast.success('Pedido enviado ao administrador!');
                setHasPendingRequest(true);
                setShowDisassociationModal(false);
                setDisassociationReason('');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao enviar pedido');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setIsSubmittingRequest(false);
        }
    };

    useEffect(() => {
        loadTrainerInfo();
        checkDisassociationStatus();
    }, [user?.trainer]);

    useEffect(() => {
        if (user && Object.keys(user).length > 0) {
            reset(user);
        }
    }, [user, reset]);

    const sanitizeInput = (value) => {
        if (!value) return '';
        return value.toString().trim().replace(/[<>"']/g, '');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (data) => {
        const errors = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push('Nome é obrigatório');
        } else if (data.name.length < 2) {
            errors.push('O nome deve ter pelo menos 2 caracteres');
        } else if (data.name.length > 100) {
            errors.push('O nome não pode ter mais de 100 caracteres');
        } else if (!/^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(data.name)) {
            errors.push('O nome só pode conter letras, números, espaços, hífens e apóstrofos');
        }

        if (!data.email || data.email.trim().length === 0) {
            errors.push('Email é obrigatório');
        } else if (!validateEmail(data.email)) {
            errors.push('Formato de email inválido');
        } else if (data.email.length > 254) {
            errors.push('Email não pode ter mais de 254 caracteres');
        }

        if (data.birthDate) {
            const birthDate = new Date(data.birthDate);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 14) {
                errors.push('Deves ter pelo menos 14 anos');
            } else if (age > 100) {
                errors.push('Idade máxima é 100 anos');
            }
        }

        if (data.address && data.address.length > 0) {
            if (data.address.length < 5) {
                errors.push('Morada deve ter pelo menos 5 caracteres');
            } else if (data.address.length > 200) {
                errors.push('Morada não pode ter mais de 200 caracteres');
            }
        }

        if (data.country && data.country.length > 0) {
            if (data.country.length < 2) {
                errors.push('País deve ter pelo menos 2 caracteres');
            } else if (data.country.length > 100) {
                errors.push('País não pode ter mais de 100 caracteres');
            } else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(data.country)) {
                errors.push('País só pode conter letras, espaços e hífens');
            }
        }

        return errors;
    };

    const onSubmit = async (data) => {
        setFormErrors([]);

        const sanitizedData = {
            name: sanitizeInput(data.name),
            email: sanitizeInput(data.email),
            birthDate: data.birthDate || null,
            address: sanitizeInput(data.address),
            country: sanitizeInput(data.country)
        };

        const validationErrors = validateForm(sanitizedData);
        if (validationErrors.length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        if (!confirmEditPassword) {
            setFormErrors(['Introduz a tua palavra-passe para confirmar as alterações']);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(buildApiUrl(`/api/users/perfil`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...sanitizedData,
                    password: confirmEditPassword
                }),
            });

            if (response.ok) {
                toast.success('Perfil atualizado com sucesso!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    icon: ({ theme, type }) => <Save size={20} style={{ color: '#dc2626' }} />,
                    style: {
                        background: '#ffffff',
                        color: '#dc2626',

                    },
                    progressClassName: 'toast-progress-red',
                });
                const responseData = await response.json();
                reset(responseData.user);
                setIsEditing(false);
                setConfirmEditPassword('');
                setShowConfirmEditPassword(false);
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                const errorData = await response.json();
                setFormErrors([errorData.error || 'Erro ao atualizar perfil. Tenta novamente.']);
                toast.error(errorData.error || 'Erro ao atualizar perfil. Tenta novamente.', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Erro de conexão. Verifica a tua internet.', {
                position: "top-center",
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Apenas ficheiros de imagem são permitidos', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem não pode ter mais de 2MB', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadPhoto = async () => {
        if (!selectedImage) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('profileImage', selectedImage);

        try {
            const response = await fetch(buildApiUrl('/api/users/perfil/upload-photo'), {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (response.ok) {
                toast.success('Foto de perfil atualizada com sucesso!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    icon: ({ theme, type }) => <Camera size={20} style={{ color: '#dc2626' }} />,
                    style: {
                        background: '#ffffff',
                        color: '#dc2626',
                    },
                    progressClassName: 'toast-progress-red',
                });
                setSelectedImage(null);
                setPreviewUrl(null);
                if (onUpdate) {
                    onUpdate();
                }
                window.dispatchEvent(new Event('profile-update'));
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao fazer upload da foto', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Erro de conexão. Verifica a tua internet.', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeletePhoto = async () => {
        try {
            const response = await fetch(buildApiUrl('/api/users/perfil/delete-photo'), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Foto de perfil removida com sucesso!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    icon: ({ theme, type }) => <Trash2 size={20} style={{ color: '#dc2626' }} />,
                    style: {
                        background: '#ffffff',
                        color: '#dc2626',
                    },
                    progressClassName: 'toast-progress-red',
                });
                if (onUpdate) {
                    onUpdate();
                }
                window.dispatchEvent(new Event('profile-update'));
            } else {
                toast.error('Erro ao remover foto', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Erro de conexão', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setFormErrors([]);

        const errors = [];

        if (!passwordData.currentPassword) {
            errors.push('Palavra-passe atual é obrigatória');
        }

        if (!passwordData.newPassword) {
            errors.push('Nova palavra-passe é obrigatória');
        }

        if (passwordData.newPassword && passwordData.newPassword.length < 6) {
            errors.push('A nova palavra-passe deve ter pelo menos 6 caracteres');
        }

        if (passwordData.newPassword && passwordData.newPassword.length > 128) {
            errors.push('A nova palavra-passe não pode ter mais de 128 caracteres');
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.push('As palavras-passe não coincidem');
        }

        const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
        const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
        const hasNumber = /[0-9]/.test(passwordData.newPassword);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);
        const hasLetterOrNumber = hasUpperCase || hasLowerCase || hasNumber;

        if (passwordData.newPassword && !hasLetterOrNumber) {
            errors.push('A palavra-passe deve conter letras ou números');
        }

        if (passwordData.newPassword && !hasSymbol) {
            errors.push('A palavra-passe deve conter pelo menos um símbolo (!@#$%^&*...)');
        }

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await fetch(buildApiUrl('/api/users/perfil/change-password'), {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (response.ok) {
                toast.success('Palavra-passe alterada! A terminar sessão...', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    icon: ({ theme, type }) => <Save size={20} style={{ color: '#dc2626' }} />,
                    style: {
                        background: '#ffffff',
                        color: '#dc2626',
                    },
                    progressClassName: 'toast-progress-red',
                });

                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPassword({ current: false, new: false, confirm: false });
                setFormErrors([]);
                setShowPasswordModal(false);

                setTimeout(() => {
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.href = '/';
                }, 2000);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao alterar palavra-passe', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Erro de conexão', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <>
            <Container className={styles.container}>
                <div className={styles.profileCard}>
                    <div className={styles.profileGrid}>
                        <div className={styles.sidebar}>
                            <div className={styles.avatarContainer}>
                                {previewUrl || user.profileImage ? (
                                    <img
                                        src={previewUrl || user.profileImage}
                                        alt="Foto de perfil"
                                        className={styles.avatarImage}
                                    />
                                ) : (
                                    <div className={styles.avatar}>
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}

                                <h2 className={styles.userName}>{user.name}</h2>

                                <div className={styles.photoButtons}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        style={{ display: 'none' }}
                                        id="profile-photo-input"
                                    />
                                    <label htmlFor="profile-photo-input" className={styles.uploadBtn}>
                                        <Camera size={18} />
                                        Alterar Foto
                                    </label>

                                    {previewUrl && (
                                        <button
                                            onClick={handleUploadPhoto}
                                            disabled={isUploadingImage}
                                            className={styles.savePhotoBtn}
                                        >
                                            <Save size={18} />
                                            {isUploadingImage ? 'A guardar...' : 'Guardar Foto'}
                                        </button>
                                    )}

                                    {user.profileImage && !previewUrl && (
                                        <button onClick={handleDeletePhoto} className={styles.deleteBtn}>
                                            <Trash2 size={18} />
                                            Remover Foto
                                        </button>
                                    )}
                                </div>

                                <div className={styles.qrSection}>
                                    <p className={styles.qrLabel}>QR Code Login</p>
                                    <Qrcode user={user} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.content}>
                            {!isEditing ? (
                                <>
                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Informações Principais </h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Email</span>
                                                <span className={styles.infoValue}>{user.email}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Data de Nascimento</span>
                                                <span className={styles.infoValue}>
                                                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-PT') : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Informações de Contacto </h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Morada</span>
                                                <span className={styles.infoValue}>{user.address || '—'}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>País</span>
                                                <span className={styles.infoValue}>{user.country || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.actionCenter}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit size={18} />
                                            Editar
                                        </button>
                                    </div>

                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Segurança</h3>
                                        <button
                                            type="button"
                                            className={styles.changePasswordBtnOutline}
                                            onClick={() => setShowPasswordModal(!showPasswordModal)}
                                        >
                                            <Edit size={18} />
                                            {showPasswordModal ? 'Fechar' : 'Alterar Palavra-passe'}
                                        </button>

                                        {showPasswordModal && (
                                            <form onSubmit={handleChangePassword} className={styles.passwordFormInline}>
                                                <div className={styles.passwordGrid}>
                                                    <div className={styles.passwordField}>
                                                        <label className={styles.infoLabel}>Palavra-passe Atual</label>
                                                        <div className={styles.passwordInputWrapper}>
                                                            <input
                                                                type={showPassword.current ? "text" : "password"}
                                                                className={styles.passwordInput}
                                                                value={passwordData.currentPassword}
                                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                                required
                                                            />
                                                            <button type="button" className={styles.togglePassword} onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}>
                                                                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className={styles.passwordField}>
                                                        <label className={styles.infoLabel}>Nova Palavra-passe</label>
                                                        <div className={styles.passwordInputWrapper}>
                                                            <input
                                                                type={showPassword.new ? "text" : "password"}
                                                                className={styles.passwordInput}
                                                                value={passwordData.newPassword}
                                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                                required
                                                                minLength={6}
                                                            />
                                                            <button type="button" className={styles.togglePassword} onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}>
                                                                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                        <small className={styles.passwordHint}>Mín. 6 caracteres, maiúsculas, minúsculas, números e símbolos</small>
                                                    </div>
                                                    <div className={styles.passwordField}>
                                                        <label className={styles.infoLabel}>Confirmar Nova</label>
                                                        <div className={styles.passwordInputWrapper}>
                                                            <input
                                                                type={showPassword.confirm ? "text" : "password"}
                                                                className={styles.passwordInput}
                                                                value={passwordData.confirmPassword}
                                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                                required
                                                                minLength={6}
                                                            />
                                                            <button type="button" className={styles.togglePassword} onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}>
                                                                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {formErrors.length > 0 && (
                                                    <div className={styles.errorMessages}>
                                                        {formErrors.map((error, index) => (
                                                            <p key={index} className={styles.errorMessage}>{error}</p>
                                                        ))}
                                                    </div>
                                                )}
                                                <button
                                                    type="submit"
                                                    className={styles.changePasswordBtn}
                                                    disabled={isChangingPassword}
                                                >
                                                    <Save size={18} />
                                                    {isChangingPassword ? 'A alterar...' : 'Alterar Palavra-passe'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Informações Principais</h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Nome</span>
                                                <input
                                                    type="text"
                                                    required
                                                    {...register("name")}
                                                    className={styles.inlineInput}
                                                />
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Email</span>
                                                <input
                                                    type="email"
                                                    required
                                                    {...register("email")}
                                                    className={styles.inlineInput}
                                                />
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Data de Nascimento</span>
                                                <input
                                                    type="date"
                                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 14)).toISOString().split('T')[0]}
                                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                                                    {...register("birthDate")}
                                                    className={styles.inlineInput}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Informações de Contacto 🦭</h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Morada</span>
                                                <input
                                                    type="text"
                                                    required
                                                    {...register("address")}
                                                    className={styles.inlineInput}
                                                />
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>País</span>
                                                <input
                                                    type="text"
                                                    required
                                                    {...register("country")}
                                                    className={styles.inlineInput}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Confirmar Alterações</h3>
                                        <div className={styles.confirmPasswordField}>
                                            <label className={styles.infoLabel}>Introduz a tua palavra-passe para confirmar</label>
                                            <div className={styles.passwordInputWrapper}>
                                                <input
                                                    type={showConfirmEditPassword ? "text" : "password"}
                                                    className={styles.passwordInput}
                                                    value={confirmEditPassword}
                                                    onChange={(e) => setConfirmEditPassword(e.target.value)}
                                                    placeholder="Palavra-passe atual"
                                                    required
                                                />
                                                <button type="button" className={styles.togglePassword} onClick={() => setShowConfirmEditPassword(!showConfirmEditPassword)}>
                                                    {showConfirmEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {formErrors.length > 0 && (
                                        <div className={styles.errorMessages}>
                                            {formErrors.map((error, index) => (
                                                <p key={index} className={styles.errorMessage}>{error}</p>
                                            ))}
                                        </div>
                                    )}

                                    <div className={styles.actionCenter}>
                                        <button
                                            type="submit"
                                            className={styles.saveBtn}
                                            disabled={!isDirty || isSubmitting}
                                        >
                                            <Save size={18} />
                                            {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.cancelBtn}
                                            onClick={() => {
                                                setIsEditing(false);
                                                reset(user);
                                            }}
                                        >
                                            <X size={18} />
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.trainerSection}>
                    <h3><UserCheck size={20} /> Personal Trainer</h3>
                    {user?.trainer || trainerInfo ? (
                        <div className={styles.trainerCard}>
                            <div className={styles.trainerProfile}>
                                <div className={styles.trainerAvatar}>
                                    {trainerInfo?.profileImage ? (
                                        <img src={trainerInfo.profileImage} alt={trainerInfo.name} />
                                    ) : (
                                        <div className={styles.trainerInitials}>
                                            {trainerInfo?.name?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.trainerDetails}>
                                    <h4>{trainerInfo?.name || 'A carregar...'}</h4>
                                    <span>Personal Trainer</span>
                                </div>
                            </div>

                            <div className={styles.trainerActions}>
                                {hasPendingRequest ? (
                                    <div className={styles.pendingRequestBadge}>
                                        <AlertCircle size={16} />
                                        <span>Pedido Pendente</span>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.leaveTrainerBtn}
                                        onClick={() => setShowDisassociationModal(true)}
                                        title="Deixar de ser acompanhado por este PT"
                                    >
                                        <UserX size={18} />
                                        Sair do PT
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noTrainer}>
                            <p>Ainda não tens um Personal Trainer associado.</p>
                            <p>Insere o código de convite do teu PT:</p>
                            <div className={styles.inviteInputBox}>
                                <input
                                    type="text"
                                    placeholder="Ex: PT-JOAO-4X7K"
                                    value={inviteCodeInput}
                                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                                    className={styles.inviteInput}
                                />
                                <button
                                    onClick={associateWithTrainer}
                                    disabled={isAssociating}
                                    className={styles.associateBtn}
                                >
                                    <Link size={16} />
                                    {isAssociating ? 'A associar...' : 'Associar'}
                                </button>
                            </div>
                            {associateError && (
                                <p className={styles.errorText}>{associateError}</p>
                            )}
                        </div>
                    )}
                </div>
            </Container>

            
            {
                showDisassociationModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h3>Pedir Desassociação</h3>
                                <button className={styles.modalClose} onClick={() => setShowDisassociationModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className={styles.modalContent}>
                                <p className={styles.modalText}>
                                    Queres deixar de ser acompanhado por este Personal Trainer?
                                    O teu pedido será enviado ao administrador para aprovação.
                                </p>

                                <div className={styles.modalField}>
                                    <label>Motivo do pedido (obrigatório):</label>
                                    <textarea
                                        className={styles.reasonInput}
                                        value={disassociationReason}
                                        onChange={(e) => setDisassociationReason(e.target.value)}
                                        placeholder="Explica porque queres mudar de PT ou deixar de ter acompanhamento..."
                                        rows={4}
                                    />
                                    <span className={styles.charCount}>Mínimo 10 caracteres</span>
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => setShowDisassociationModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className={styles.confirmLeaveBtn}
                                        onClick={handleDisassociationSubmit}
                                        disabled={isSubmittingRequest || disassociationReason.trim().length < 10}
                                    >
                                        {isSubmittingRequest ? 'A enviar...' : 'Enviar Pedido'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};