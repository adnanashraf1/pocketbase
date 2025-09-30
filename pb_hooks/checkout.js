onBeforeServe((e) => {
  console.log("✅ Checkout route loaded");

  e.router.add("POST", "/checkout", async (c) => {
    return c.json(200, { success: true, message: "Checkout route working!" });
  });
});
