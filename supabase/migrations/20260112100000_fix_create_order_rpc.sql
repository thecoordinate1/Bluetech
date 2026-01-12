CREATE OR REPLACE FUNCTION create_order_with_snapshots(
  p_store_id UUID,
  p_customer_id UUID,
  p_order_payload JSONB,
  p_order_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
BEGIN
  -- Insert into orders
  INSERT INTO orders (
    store_id,
    customer_id,
    customer_name,
    customer_email,
    total_amount,
    status,
    shipping_address,
    billing_address,
    delivery_tier, -- Updated from shipping_method
    payment_method,
    shipping_latitude,
    shipping_longitude,
    delivery_type,
    customer_specification,
    delivery_cost,
    driver_id,
    notes,
    service_fees
  ) VALUES (
    p_store_id,
    p_customer_id,
    p_order_payload->>'customer_name',
    p_order_payload->>'customer_email',
    (p_order_payload->>'total_amount')::DECIMAL,
    p_order_payload->>'status',
    p_order_payload->>'shipping_address',
    p_order_payload->>'billing_address',
    p_order_payload->>'delivery_tier',
    p_order_payload->>'payment_method',
    (p_order_payload->>'shipping_latitude')::FLOAT,
    (p_order_payload->>'shipping_longitude')::FLOAT,
    p_order_payload->>'delivery_type',
    p_order_payload->>'customer_specification',
    (p_order_payload->>'delivery_cost')::DECIMAL,
    (p_order_payload->>'driver_id')::UUID,
    (p_order_payload->>'notes')::JSONB,
    (p_order_payload->>'service_fees')::DECIMAL
  )
  RETURNING id INTO new_order_id;

  -- Insert order items
  FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name_snapshot,
      quantity,
      price_per_unit_snapshot,
      product_image_url_snapshot
    ) VALUES (
      new_order_id,
      (item->>'product_id')::UUID,
      item->>'product_name_snapshot',
      (item->>'quantity')::INTEGER,
      (item->>'price_per_unit_snapshot')::DECIMAL,
      item->>'product_image_url_snapshot'
    );
  END LOOP;

  RETURN new_order_id;
END;
$$;
