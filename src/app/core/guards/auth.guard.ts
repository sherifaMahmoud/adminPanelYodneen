import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.services';

export const authGuard: CanActivateFn = () => {

    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();
    const role = authService.getRole();

    if (!token) {

        router.navigate(['/login']);
        return false;
    }

    if (role !== 'admin') {

        router.navigate(['/login']);
        return false;
    }

    return true;
};