import { HttpInterceptorFn } from '@angular/common/http';
import { SHOP_API_BASE_URL, SHOP_API_KEY } from '../config/api.config';


export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(SHOP_API_BASE_URL)) {
    return next(req);
  }

  const authorizedReq = req.clone({
    setHeaders: {
      'X-Api-Key': SHOP_API_KEY,
    },
  });

  return next(authorizedReq);
};
