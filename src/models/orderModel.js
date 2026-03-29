const db = require("../config/db");

const getOrdersByUserId = async (userId) => {
  const ordersQuery = `
    SELECT id, total, created_at, delivery_address, payment_method, status, cancel_reason, cancelled_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const orderItemsQuery = `
    SELECT
      oi.id,
      oi.order_id,
      oi.product_id,
      oi.product_name,
      oi.unit_price,
      oi.quantity,
      p.image_url,
      p.name AS current_product_name
    FROM order_items oi
    INNER JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ANY($1::int[])
    ORDER BY oi.id ASC
  `;

  try {
    const { rows: orderRows } = await db.query(ordersQuery, [userId]);

    if (!orderRows.length) {
      return [];
    }

    const orderIds = orderRows.map((order) => order.id);
    const { rows: itemRows } = await db.query(orderItemsQuery, [orderIds]);

    const itemsByOrderId = itemRows.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(item);
      return acc;
    }, {});

    return orderRows.map((order) => ({
      ...order,
      items: itemsByOrderId[order.id] || [],
    }));
  } catch (error) {
    console.error("[orderModel.getOrdersByUserId] DB ERROR:", error.message);
    throw error;
  }
};

const createOrder = async ({ userId, total, deliveryAddress, paymentMethod, items }) => {
  const client = await db.connect();
  try {
    console.log("[orderModel.createOrder] Starting transaction for user:", userId);
    console.log("[orderModel.createOrder] Payload:", { total, deliveryAddress, paymentMethod, itemCounts: items.length });

    await client.query("BEGIN");

    const orderQuery = `
      INSERT INTO orders (user_id, total, delivery_address, payment_method)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    
    // 1. Verify user exists in the CURRENT database to avoid Foreign Key Violations (common when swapping DBs)
    const { rows: userCheck } = await client.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userCheck.length === 0) {
      throw new Error(`USER_NOT_FOUND: User ID ${userId} does not exist in the current database.`);
    }

    let orderId;
    try {
      const { rows: orderRows } = await client.query(orderQuery, [
        userId,
        total,
        typeof deliveryAddress === 'string' ? deliveryAddress : JSON.stringify(deliveryAddress),
        paymentMethod,
      ]);
      orderId = orderRows[0].id;
      console.log("[orderModel.createOrder] Order header created with ID:", orderId);
    } catch (headErr) {
      console.error("[orderModel.createOrder] Failed to insert order header:", headErr.message);
      throw headErr;
    }

    for (const item of items) {
      console.log("[orderModel.createOrder] Validating and reducing stock for item:", item.name || item.title);
      
      // 2. Row-level lock on product for atomicity (FOR UPDATE)
      const stockCheckQuery = "SELECT stock FROM products WHERE id = $1 FOR UPDATE";
      const { rows: productRows } = await client.query(stockCheckQuery, [item.id]);
      
      if (productRows.length === 0) {
        throw new Error(`PRODUCT_NOT_FOUND: Product ID ${item.id} not found.`);
      }

      const currentStock = Number(productRows[0].stock) || 0;
      const requestedQty = Number(item.quantity) || 1;

      if (currentStock < requestedQty) {
        throw new Error(`OUT_OF_STOCK: Product "${item.name || item.title}" has insufficient stock (${currentStock}).`);
      }

      // 3. Update stock (must be within the transaction)
      const updateStockQuery = "UPDATE products SET stock = stock - $1 WHERE id = $2";
      await client.query(updateStockQuery, [requestedQty, item.id]);

      // 4. Insert order item
      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
        VALUES ($1, $2, $3, $4, $5)
      `;
      try {
        await client.query(itemQuery, [
          orderId,
          item.id,
          item.name || item.title || "Unknown Product",
          item.price,
          requestedQty,
        ]);
      } catch (itemErr) {
        console.error("[orderModel.createOrder] Failed to insert item:", item.id, itemErr.message);
        throw itemErr;
      }
    }

    await client.query("COMMIT");
    console.log("[orderModel.createOrder] Transaction committed successfully.");
    return { id: orderId };
  } catch (err) {
    console.error("[orderModel.createOrder] CRITICAL ERROR. Rolling back. Reason:", err.message);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const cancelOrder = async (userId, orderId, reason) => {
  const query = `
    UPDATE orders
    SET status = 'cancelled', cancel_reason = $1, cancelled_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND user_id = $3 AND status = 'placed'
    RETURNING *;
  `;
  try {
    const { rows } = await db.query(query, [reason, orderId, userId]);
    if (rows.length === 0) {
      throw new Error("ORDER_NOT_FOUND_OR_UNCANCELABLE: Order not found or already cancelled.");
    }
    return rows[0];
  } catch (error) {
    console.error("[orderModel.cancelOrder] DB ERROR:", error.message);
    throw error;
  }
};

module.exports = {
  getOrdersByUserId,
  createOrder,
  cancelOrder,
};
