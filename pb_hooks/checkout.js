onBeforeServe(async (e) => {
  e.router.add("POST", "/checkout", async (c) => {
    // Parse JSON body
    let body;
    try {
      body = await c.req.json();
    } catch (err) {
      return c.json(400, { error: "Invalid JSON" });
    }

    const { user, address, order, orderItems } = body;

    // Use DAO
    const dao = $app.dao();

    try {
      // Run inside a DB transaction
      const result = await dao.runInTransaction(async (txDao) => {
        // 1. Create or reuse user
        let userRec;
        if (user.id) {
          userRec = await txDao.findRecord("users", user.id);
        } else {
          userRec = await txDao.saveRecord(new Record("users", {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: "customer"
          }));
        }

        // 2. Create address
        const addrRec = await txDao.saveRecord(new Record("addresses", {
          user_id: userRec.id,
          name: address.name,
          address_line: address.address_line,
          city: address.city,
          zip_code: address.zip_code,
          primary: address.primary ?? true
        }));

        // 3. Create order
        const orderRec = await txDao.saveRecord(new Record("orders", {
          user_id: userRec.id,
          status: "pending",
          payment_method: order.payment_method,
          payment_status: "pending",
          address_id: addrRec.id,
          total_amount: order.total_amount,
          ordered_at: new Date().toISOString()
        }));

        // 4. Create order_items
        for (const item of orderItems) {
          await txDao.saveRecord(new Record("order_items", {
            order_id: orderRec.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price: item.price,
            addons: item.addons || {},
            meal_type: item.meal_type,
            source: "on_demand"
          }));
        }

        // 5. Create payment_intent
        const piRec = await txDao.saveRecord(new Record("payment_intents", {
          order_id: orderRec.id,
          amount: order.total_amount,
          method: order.payment_method,
          status: "pending",
          created_at: new Date().toISOString()
        }));

        // Return data you want to send back
        return {
          order: orderRec,
          payment_intent: piRec
        };
      }); // end transaction

      return c.json(200, { success: true, ...result });
    } catch (err) {
      console.error("Checkout route error:", err);
      return c.json(500, { error: err.message || "checkout_failed" });
    }
  });
});
