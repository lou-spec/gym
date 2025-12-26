import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import styles from "../LoginPage/styles.module.scss";
import { Eye, EyeOff } from 'lucide-react';
import { toast } from "react-toastify";

const RegisterForm = () => {
    const { register, handleSubmit, watch } = useForm();
    const [isRegistered, setIsRegistered] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState([]);

    const password = watch("password");

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

        if (!data.password) {
            errors.push('Palavra-passe é obrigatória');
        } else if (data.password.length < 6) {
            errors.push('A palavra-passe deve ter pelo menos 6 caracteres');
        } else if (data.password.length > 128) {
            errors.push('A palavra-passe não pode ter mais de 128 caracteres');
        } else {
            const hasUpperCase = /[A-Z]/.test(data.password);
            const hasLowerCase = /[a-z]/.test(data.password);
            const hasNumber = /[0-9]/.test(data.password);
            const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);

            if (!hasUpperCase) {
                errors.push('A palavra-passe deve conter pelo menos uma letra maiúscula');
            }
            if (!hasLowerCase) {
                errors.push('A palavra-passe deve conter pelo menos uma letra minúscula');
            }
            if (!hasNumber) {
                errors.push('A palavra-passe deve conter pelo menos um número');
            }
            if (!hasSymbol) {
                errors.push('A palavra-passe deve conter pelo menos um símbolo (!@#$%^&*...)');
            }
        }

        if (data.password !== data.confirmPassword) {
            errors.push('As palavras-passe não coincidem');
        }

        return errors;
    };

    const onSubmit = async (data) => {
        setFormErrors([]);
        setRegisterError("");

        const sanitizedData = {
            name: sanitizeInput(data.name),
            email: sanitizeInput(data.email),
            password: data.password
        };

        const validationErrors = validateForm({ ...sanitizedData, confirmPassword: data.confirmPassword });
        if (validationErrors.length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/register", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(sanitizedData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Conta criada com sucesso! Podes fazer login.', {
                    position: "top-right",
                    autoClose: 3000,
                });
                setIsRegistered(true);
            } else {
                setRegisterError(result.message || "Erro ao criar conta. Tenta novamente.");
            }
        } catch (error) {
            console.error("Error:", error);
            setRegisterError("Erro de conexão. Verifica a tua internet.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isRegistered) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={styles.loginForm}>
            <h2 className={styles.form__title}>Criar Conta</h2>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.inputGroup}>
                    <label className={styles['form-control__label']} htmlFor="name">Nome Completo:</label>
                    <input
                        id="name"
                        type="text"
                        required
                        {...register("name")}
                        className={styles['form-control']}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles['form-control__label']} htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        required
                        {...register("email")}
                        className={styles['form-control']}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles['form-control__label']} htmlFor="password">Palavra-passe:</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            {...register("password")}
                            className={styles['form-control']}
                            style={{ marginBottom: 0 }}
                        />
                        {showPassword ? (
                            <EyeOff
                                onClick={() => setShowPassword(false)}
                                style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
                            />
                        ) : (
                            <Eye
                                onClick={() => setShowPassword(true)}
                                style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
                            />
                        )}
                    </div>
                    <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Mín. 6 caracteres, maiúsculas, minúsculas, números e símbolos
                    </small>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles['form-control__label']} htmlFor="confirmPassword">Confirmar Palavra-passe:</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            {...register("confirmPassword")}
                            className={styles['form-control']}
                            style={{ marginBottom: 0 }}
                        />
                        {showConfirmPassword ? (
                            <EyeOff
                                onClick={() => setShowConfirmPassword(false)}
                                style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
                            />
                        ) : (
                            <Eye
                                onClick={() => setShowConfirmPassword(true)}
                                style={{ cursor: 'pointer', position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', color: 'var(--form-text)' }}
                            />
                        )}
                    </div>
                </div>

                {formErrors.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                        {formErrors.map((error, index) => (
                            <p key={index} style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '4px' }}>{error}</p>
                        ))}
                    </div>
                )}

                {registerError && (
                    <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>
                        {registerError}
                    </div>
                )}

                <button type="submit" className={styles['form__submit']} disabled={isSubmitting}>
                    {isSubmitting ? 'A criar conta...' : 'Criar Conta'}
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;
