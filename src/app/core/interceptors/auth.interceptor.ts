import {
    HttpErrorResponse,
    HttpInterceptorFn
} from '@angular/common/http';

import {
    catchError
} from 'rxjs/operators';

import {
    throwError
} from 'rxjs';

export const authInterceptor:
    HttpInterceptorFn = (

        req,
        next

    ) => {

        const token =
            localStorage.getItem('token');

        if (token) {

            req = req.clone({

                setHeaders: {

                    Authorization:
                        `Bearer ${token}`
                }
            });
        }

        return next(req).pipe(

            catchError((error:
                HttpErrorResponse) => {

                if (error.status === 401) {

                    localStorage.clear();

                    window.location.href =
                        '/login';
                }

                return throwError(
                    () => error
                );
            })
        );
    };