/// <reference path="../pb_data/types.d.ts" />

console.log("✅ Checkout hook file loaded");

routerAdd("POST", "/checkout", (c) => {
  return c.json(200, {
    success: true,
    message: "Checkout route working with routerAdd!"
  })
})
