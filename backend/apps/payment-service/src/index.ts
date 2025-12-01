import { serve } from '@hono/node-server'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { Hono } from 'hono';
import { cors } from "hono/cors";
import { shouldBeUser } from './middleware/authMiddleware.js'

const app = new Hono();
app.use("*", clerkMiddleware());
app.use("*", cors({ origin: ["http://localhost:3002"] }));

app.get('/health', (c) => {
  return c.json({
    status:"ok",
    uptime:process.uptime(),
    timestamp: Date.now(),
  });
})


app.get("/pay",shouldBeUser , async(c)=>{
  
  const {products}=await c.req.json()
  const totalPrice = await Promise.all(
    products.map(async (product:any)=>{
      const productInDb:any = await fetch(
        `http://localhost:8000/product/${product.id}`
      );
      return productInDb.price * product.quantity;
    })
  )

  return c.json({
    message:"payment service is authenticated !",userId:c.get("userId")
  });
});

app.get('/test',shouldBeUser, (c) => {

  return c.json({
    message: 'payment service is authenticated !',
    userId:c.get("userId")
  });
});

const start = async () =>{
  try {
    serve({
      fetch: app.fetch,
      port: 8002
    },
    (info) => {
      console.log(`payment service is running on post 8002`)
    }
  );
    } catch (error){
      console.log(error);
      process.exit(1);
    }
};

start();
