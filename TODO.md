# TODO: Refactor Login System to Unified Auth Screen with Tabs

## Steps

1. Create a new unified auth screen component `app/auth.tsx`:

   - Implement tabs or segmented control to switch between Client and Deliver user types.
   - Manage mode state for login, register, forgot password forms.
   - Pass userType prop to LoginForm, RegisterForm, ForgotPasswordForm accordingly.
   - ✅ Done

2. Update routing:

   - Remove or redirect `app/(client)/client-auth.tsx` and `app/(deliver)/deliver-auth.tsx`.
   - Update `app/(client)/_layout.tsx` and `app/(deliver)/_layout.tsx` to use the new unified auth screen route.
   - ✅ Done

3. Adjust navigation logic in `LoginForm.tsx` if needed to support unified userType handling.

   - ✅ No changes needed, LoginForm already handles userType correctly.

4. Test the unified auth screen for both Client and Deliver user types:

   - Verify switching tabs changes userType.
   - Verify login, register, forgot password flows work correctly.
   - Verify routing after login redirects to correct tabs.
   - ⏳ Pending (requires running the app)

5. Remove old auth screen files if no longer needed.
   - ✅ Done

## Notes

- Keep UI consistent with existing forms.
- Ensure minimal disruption to existing routing and navigation logic.
