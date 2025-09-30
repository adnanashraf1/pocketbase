/// pb_hooks/checkout.js

console.log("✅ Checkout hook file loaded");

routerAdd("POST", "/checkout", (c) => {
  return c.json(200, {
    success: true,
    message: "Checkout route working with routerAdd!"
  })
})
