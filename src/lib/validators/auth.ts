import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다')
    .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해야 합니다'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, '이름은 2자 이상이어야 합니다').max(100),
  phone: z.string().optional(),
  termsAgreed: z.boolean().refine(val => val === true, '이용약관에 동의해주세요'),
  privacyAgreed: z.boolean().refine(val => val === true, '개인정보처리방침에 동의해주세요'),
  marketingConsent: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
});

export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다')
    .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해야 합니다'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
