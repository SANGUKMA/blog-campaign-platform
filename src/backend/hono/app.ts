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
  
  // API 라우트 등록 (Next.js가 /api/*로 전달하므로 /api prefix 포함)
  app.route('/api/profile', profileRoute);
  app.route('/api/campaigns', campaignRoute);
  app.route('/api/applications', applicationRoute);

  singletonApp = app;

  return app;
};