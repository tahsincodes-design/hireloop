# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Admin signup

Admin signup requires the server-side `ADMIN_SIGNUP_INVITE_CODE` environment
variable. Set it to a strong, private value and share it only with intended
admins. If it is unset, admin signup is rejected. The invite code is not stored
with the user account, and users cannot change their own role after signup.
