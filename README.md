# Marketplace

## Render deployment

This project is ready to deploy as a Render static site.

Create a new Render Static Site from this repository with these settings:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Node version: `20` or newer

Set these environment variables in the Render dashboard under **Environment**:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The repo also includes a `render.yaml` file with a rewrite rule so direct visits to client-side routes like `/shop` or `/pricing` resolve to `index.html`.

## Local development

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run build
```

## Large model file storage

Digital model files are uploaded directly from the browser to a private Cloudflare R2 bucket. Supabase stores authentication, listings, and the verified R2 object metadata. Deploy `supabase/functions/create-r2-upload-url` as an Edge Function and configure these server-side secrets:

```text
R2_ACCOUNT_ID
R2_BUCKET_NAME
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

The R2 bucket CORS policy must allow `PUT` and `GET` from the deployed CreateLab origin, and allow the `Content-Type` request header. Never expose the R2 access key or secret in `VITE_*` variables. Model uploads are limited to 5 GiB and use 15-minute, user-scoped presigned URLs.

In the R2 bucket CORS settings, use the equivalent of this policy and replace the production origin with the actual CreateLab URL:

```json
[
	{
		"AllowedOrigins": ["http://localhost:5173", "https://your-createlab-domain.com"],
		"AllowedMethods": ["PUT", "HEAD"],
		"AllowedHeaders": ["Content-Type"],
		"ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
		"MaxAgeSeconds": 3600
	}
]
```

Deploy the function with the Supabase CLI from the repository root:

```bash
npx supabase login
npx supabase functions deploy create-r2-upload-url --project-ref fnjhzalauqweptsvezvp
npx supabase secrets set \
	R2_ACCOUNT_ID=your-cloudflare-account-id \
	R2_BUCKET_NAME=your-r2-bucket-name \
	R2_ACCESS_KEY_ID=your-r2-access-key-id \
	R2_SECRET_ACCESS_KEY=your-r2-secret-access-key \
	--project-ref fnjhzalauqweptsvezvp
```

The function endpoint should respond to an `OPTIONS` request after deployment:
`https://fnjhzalauqweptsvezvp.supabase.co/functions/v1/create-r2-upload-url`

## Stripe checkout

Deploy the checkout and webhook functions separately from the Render static site:

```bash
npx supabase functions deploy create-checkout-session --project-ref fnjhzalauqweptsvezvp
npx supabase functions deploy stripe-webhook --project-ref fnjhzalauqweptsvezvp
npx supabase secrets set \
	STRIPE_SECRET_KEY=your-stripe-secret-key \
	STRIPE_WEBHOOK_SECRET=your-stripe-webhook-signing-secret \
	--project-ref fnjhzalauqweptsvezvp
```

Configure the Stripe webhook endpoint as:
`https://fnjhzalauqweptsvezvp.supabase.co/functions/v1/stripe-webhook`

The checkout function creates pending orders and redirects paid carts to Stripe. The webhook marks an order completed only after Stripe confirms payment.

## PayPal checkout

Deploy the PayPal functions and configure PayPal REST API credentials. The client ID and secret must come from the same PayPal environment. Sandbox is the default; set `PAYPAL_ENVIRONMENT=live` with live credentials for production:

```bash
npx supabase functions deploy create-paypal-order --project-ref fnjhzalauqweptsvezvp
npx supabase functions deploy capture-paypal-order --project-ref fnjhzalauqweptsvezvp
npx supabase secrets set \
	PAYPAL_CLIENT_ID=your-paypal-client-id \
	PAYPAL_CLIENT_SECRET=your-paypal-client-secret \
	PAYPAL_ENVIRONMENT=sandbox \
	--project-ref fnjhzalauqweptsvezvp
```

The cart keeps the order pending until PayPal redirects back and the capture function confirms the payment server-side. Never put the PayPal client secret in a `VITE_*` variable.