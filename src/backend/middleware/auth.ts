import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { createServerClient } from '@supabase/ssr';
import type { AppEnv } from '@/backend/hono/context';
import { env } from '@/constants/env';

export const withAuth = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    try {
      // 쿠키에서 Supabase 세션 가져오기
      const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name: string) {
              return getCookie(c, name);
            },
            set() {
              // API 라우트에서는 쿠키 설정 불필요
            },
            remove() {
              // API 라우트에서는 쿠키 제거 불필요
            },
          },
        }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        c.set('userId', user.id);
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
    }

    await next();
  });

