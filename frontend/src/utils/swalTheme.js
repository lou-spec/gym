
import Swal from 'sweetalert2';

export const getSwalTheme = () => {
    
    return {
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        iconColor: '#dc2626'
    };
};

export const showSwalConfirm = (options) => {
    const theme = getSwalTheme();
    return Swal.fire({
        ...theme,
        iconColor: '#dc2626',
        showCancelButton: true,
        confirmButtonText: 'Sim, confirmar!',
        cancelButtonText: 'Cancelar',
        ...options,
    });
};

export const showSwalSuccess = (options) => {
    const theme = getSwalTheme();
    return Swal.fire({
        ...theme,
        icon: 'success',
        iconColor: '#dc2626',
        confirmButtonColor: '#dc2626',
        ...options,
    });
};

export const showSwalError = (options) => {
    const theme = getSwalTheme();
    return Swal.fire({
        ...theme,
        icon: 'error',
        iconColor: '#dc2626',
        confirmButtonColor: '#dc2626',
        ...options,
    });
};
