ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_status TEXT NOT NULL DEFAULT 'pending';

UPDATE public.orders
SET order_status = CASE
  WHEN lower(coalesce(delivery_status, '')) = 'completed' THEN 'completed'
  WHEN lower(coalesce(payment_status, '')) = 'approved' THEN 'approved'
  ELSE 'pending'
END
WHERE order_status IS NULL OR order_status = '';

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_order_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_order_status_check
CHECK (order_status IN ('pending', 'approved', 'completed'));
