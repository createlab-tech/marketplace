ALTER TABLE orders
	ADD COLUMN IF NOT EXISTS paypal_order_id text,
	ADD COLUMN IF NOT EXISTS paypal_capture_id text,
	ADD COLUMN IF NOT EXISTS payment_provider text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_paypal_order_id
	ON orders(paypal_order_id)
	WHERE paypal_order_id IS NOT NULL;
