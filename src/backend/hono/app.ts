import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { withAuth } from '@/backend/middleware/auth';
import { registerExampleRoutes } from '@/features/example/backend/route';
import profileRoute from '@/features/profile/backend/route';
import campaignRoute from '@/features/campaign/backend/route';
import applicationRoute from '@/features/application/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  // 개발 환경에서는 캐시 무효화 (HMR 지원)
  if (process.env.NODE_ENV === 'development') {
    singletonApp = null;
  }
  
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());
  app.use('*', withAuth());

  registerExampleRoutes(app);
  
  // API 라우트 등록 - 타입 단언 사용
  app.route('/api/profile', profileRoute as unknown as Hono<AppEnv>);
  app.route('/api/campaigns', campaignRoute as unknown as Hono<AppEnv>);
  app.route('/api/applications', applicationRoute as unknown as Hono<AppEnv>);

  singletonApp = app;

  return app;
};