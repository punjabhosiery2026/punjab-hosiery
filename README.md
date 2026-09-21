# Punjab Hosiery — production storefront

This is a Next.js + TypeScript storefront with Supabase PostgreSQL, Supabase Auth, Supabase Storage, stock-aware ordering, wholesale inquiries, and an admin dashboard.

## 1. Create Supabase database

1. Create a project at Supabase.
2. In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. In **Storage**, create a public bucket named `product-images`.
4. In **Project Settings → API**, copy the project URL, anon key, and service-role key.

## 2. Connect the app

1. Copy `.env.example` to `.env.local`.
2. Fill the Supabase values. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side; never prefix it with `NEXT_PUBLIC_` and never commit `.env.local`.
3. WhatsApp is already set to `919219879392`.
4. Run `pnpm install`, then `pnpm dev` and visit `http://localhost:3000`.

### Order email alerts

To receive an email at `ravindersingh4659@gmail.com` after every successful order, add these values to `.env.local`:

```env
RESEND_API_KEY=re_your_real_key
ORDER_NOTIFICATION_EMAIL=ravindersingh4659@gmail.com
ORDER_NOTIFICATION_FROM=Punjab Hosiery Orders <onboarding@resend.dev>
```

For launch, verify your own sending domain with your email provider and replace `ORDER_NOTIFICATION_FROM` with an address on that domain. An order is still saved if email delivery is temporarily unavailable.

## 3. Create the admin account

1. In Supabase **Authentication → Users**, create an email/password user.
2. Copy the new user's UUID.
3. Run this in the SQL Editor: `insert into public.profiles (id, role) values ('USER_UUID', 'admin') on conflict (id) do update set role = 'admin';`
4. Sign in at `/admin/login`. Middleware and every admin API check the authenticated `admin` role.

## 4. Add products and inventory

Go to `/admin/products`. Add product fields, prices, stock, sizes, colours, status and product images. Retail and wholesale prices are stored separately. Deactivate a product to hide it from the catalogue. A product with stock `0` shows **Out of stock** and cannot be added to cart.

## 5. Orders and stock

The `place_order` PostgreSQL function locks product rows, checks requested quantities, creates the order, then reduces stock in one transaction. This prevents overselling even with concurrent customers. Connect the checkout UI to `POST /api/orders` when you add your payment provider; only call that endpoint after a successful verified payment or confirmed COD order.

## 6. Payments and production hardening

No payment credentials are included. Add your payment provider's secret only in Vercel environment variables, verify webhooks server-side, and call `/api/orders` only after verification. Add rate limiting and transactional email before accepting public orders.

## 7. Deploy to Vercel

1. Push the `punjab-hosiery` folder to a Git repository and import it into Vercel.
2. Set the Vercel project root directory to `punjab-hosiery`.
3. Add every `.env.example` variable in Vercel **Environment Variables** with real values.
4. Deploy. Add the Vercel domain to Supabase **Authentication → URL Configuration**.
5. Test product creation, an out-of-stock product, a wholesale inquiry, admin authorization, and a verified test order before publishing.

## Important

The provided static `index.html` remains in the parent `outputs` folder as the original visual prototype. The Next.js project in this folder is the production replacement. The sample homepage keeps its premium Punjab Hosiery direction while real catalogue data is loaded from Supabase.
