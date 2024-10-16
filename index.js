const qs = require('qs');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://trendymart-tm.web.app',

  ],
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded())

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.sk1ew0y.mongodb.net/?retryWrites=true&w=majority&appName=cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const productCollection = client.db("trendyMart").collection("product")
    const productReviewsCollection = client.db("trendyMart").collection("productReviews")
    const userCollection = client.db("trendyMart").collection("users")
    const categoryCollection = client.db("trendyMart").collection("category")
    const subcategoryCollection = client.db("trendyMart").collection("subcategory")
    const brandCollection = client.db("trendyMart").collection("brand")
    const blogCollection = client.db("trendyMart").collection("blog")
    const blogReviewsCollection = client.db("trendyMart").collection("blogReviews")
    const payment = client.db("trendyMart").collection("payment")
    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCRSS_TOKEN_SECRET, { expiresIn: '24h' })
      res.send({ token })
    })
    // Logout
    app.post('/logout', async (req, res) => {
      const user = req.body;
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })
    // middlewares 

    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access,1' });
      }
      const data = req.headers.authorization.split(' ');
      const token = data[1]
      jwt.verify(token, process.env.ACCRSS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access ,2' })
        }
        req.decoded = decoded;

        next();
      })
    }
    // ............category...................


    app.get('/category', async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result)
    })

    app.post('/category', async (req, res) => {
      const product = req.body;
      const result = await categoryCollection.insertOne(product)
      res.send(result);
    })
    app.delete('/category/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await categoryCollection.deleteOne(query)
      res.send(result);

    })

    // ............subcategory...................

    app.get('/subcategory', async (req, res) => {
      const result = await subcategoryCollection.find().toArray();
      res.send(result)
    })

    app.post('/subcategory', async (req, res) => {
      const product = req.body;
      const result = await subcategoryCollection.insertOne(product)
      res.send(result);
    })
    app.delete('/subcategory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await subcategoryCollection.deleteOne(query)
      res.send(result);

    })
    // ............brand...................

    app.get('/brand', async (req, res) => {
      const result = await brandCollection.find().toArray();
      res.send(result)
    })

    app.post('/brand', async (req, res) => {
      const product = req.body;
      const result = await brandCollection.insertOne(product)
      res.send(result);
    })
    app.delete('/brand/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await brandCollection.deleteOne(query)
      res.send(result);

    })
    // .............................blogs.............................
    app.get('/blogs', async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result)
    })
    app.get('/blog/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogCollection.findOne(query)
      res.send(result);
    })
    app.post('/blog', async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog)
      res.send(result);
    })
    app.delete('/blog/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogCollection.deleteOne(query)
      res.send(result);

    })


    // .............................product.............................
    app.get('/products', async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result)
    })
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query)
      res.send(result);
    })
    app.post('/product', async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product)
      res.send(result);
    })
    app.put('/updateproducts/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatequerie = {
        $set: {
          title: product.title,
          brand: product.brand,
          price: product.price,
          descaption: product.descaption,
          category: product.category,
          update: product.update,
          availability_status: product.availability_status,
          minimum_order_quantity: product.minimum_order_quantity,
          return_policy: product.return_policy,
          stock_levels: product.stock_levels,
          discount: product.discount,
          dimensions: product.dimensions,
        }
      };
      const result = await productCollection.updateOne(filter, updatequerie, options);
      res.send(result);
    })

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.deleteOne(query)
      res.send(result);

    })

    // ...............................users...................................

    app.put('/user', async (req, res) => {
      const user = req.body
      const query = { email: user?.email }
      const isExist = await userCollection.findOne(query)
      if (isExist) {
        if (user.status === 'Requested') {
          const result = await userCollection.updateOne(query, {
            $set: { status: user?.status },
          })
          return res.send(result)
        } else {
          return res.send(isExist)
        }
      }

      const options = { upsert: true }

      const updateDoc = {
        $set: {
          ...user,
          Timestamp: Date.now(),
        },
      }
      const result = await userCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })
    app.get('/user', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      // console.log("Requested Email:", email); // Log the email

      const result = await userCollection.findOne({ email });
      // console.log("User Data:", result); // Log the result

      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ message: "User not found" });
      }
    });
    // .............................................
    app.get('/filteruser', verifyToken, async (req, res) => {
      const filter = req.query.filter
      const sort = req.query.sort
      let query = {}
      if (filter) query.role = filter
      let options = {}
      if (sort) options = { sort: { Timestamp: sort === 'asc' ? 1 : -1 } }
      const result = await userCollection.find(query, options).toArray()
      res.send(result)
    })

    // ...........................

    app.patch('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email }
      const updateDoc = {
        $set: { ...user, Timestamp: Date.now() },
      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    app.delete('/users/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    // ..................productReviewsCollection .......................
    app.get('/productReviews', async (req, res) => {
      const result = await productReviewsCollection.find().toArray();
      res.send(result)
    })
    app.get('/productReviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { 'productId': id }
      const result = await productReviewsCollection.find(query).sort({ reviewDate: -1 }).toArray()
      res.send(result)
    })

    app.post('/productReviews', async (req, res) => {
      const querie = req.body;
      const result = await productReviewsCollection.insertOne(querie)
      res.send(result);
    })

    app.delete('/productReview/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productReviewsCollection.deleteOne(query)
      res.send(result);

    })

    // .........................................
    app.get('/blogReviews', async (req, res) => {

      const result = await blogReviewsCollection.find().toArray();
      res.send(result)
    })
    app.get('/blogReviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { 'blogId': id }
      const result = await blogReviewsCollection.find(query).sort({ reviewDate: -1 }).toArray()
      res.send(result)
    })

    app.post('/blogReviews', async (req, res) => {
      const querie = req.body;
      const result = await blogReviewsCollection.insertOne(querie)
      res.send(result);
    })

    app.delete('/blogReview/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogReviewsCollection.deleteOne(query)
      res.send(result);

    })

    // ........................................

    // .......................payments..........................

    app.post('/create-payment', async (req, res) => {
      const paymentinfo = req.body;
      // Calculate total price
      const totalPrice = paymentinfo?.cartItems?.reduce((total, item) => {
        return total + item.product_price * item.product_quantity;
      }, 0);

      const trxId = new ObjectId().toString()
      const initialdata = {
        store_id: process.env.SSLCOMMERZ_STORE_ID,
        store_passwd: process.env.SSLCOMMERZ_STORE_PASS,
        total_amount: totalPrice+50,
        currency: "BDT",
        tran_id: trxId,
        success_url: "https://trendy-mart-server.vercel.app/success-payment",
        fail_url: "https://trendy-mart-server.vercel.app/fail",
        cancel_url: "https://trendy-mart-server.vercel.app/cancel",
        cus_name: paymentinfo.cus_name,
        cus_email: paymentinfo.cus_email,
        cus_add1: paymentinfo.cus_add,
        cus_add2: "",
        cus_city: paymentinfo.cus_city,
        cus_state: "",
        cus_postcode: paymentinfo.cus_postcode,
        cus_country: paymentinfo.cus_country,
        cus_phone: "01711111111",
        cus_fax: "",
        ship_name: "",
        ship_add1: "",
        ship_add2: "",
        ship_city: "",
        ship_state: "",
        ship_postcode: "",
        ship_country: "",
        multi_card_name: "mobilebank,mastercard,visacard,amexcard,internetbank",
        value_a: "",
        value_b: "",
        value_c: "",
        value_d: ""
      };

      try {

        const response = await axios({
          method: "post",
          url: "https://sandbox.sslcommerz.com/gwprocess/v3/api.php",
          data: initialdata, // Encode the data
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",

          }
        });

        const saveData = {
          paymentId: trxId,
          status: "Pending",
          productID: paymentinfo.productID,
          cus_phone: "01711111111",
          cus_name: paymentinfo.cus_name,
          cus_email: paymentinfo.cus_email,
          cus_add1: paymentinfo.cus_add,
          item: paymentinfo.cartItems,
        }
        const savePayment = await payment.insertOne(saveData)
        if (savePayment) {
          res.send({ paymentUrl: response.data.GatewayPageURL });
        }

      } catch (error) {
        console.error("Payment error:", error);
        res.status(500).send('Payment processing error');
      }
    });
    app.post('/success-payment', async (req, res) => {
      const successData = req.body;

      if (successData.status !== "VALID") {
        throw new Error("Unauthorized payment", "Invalid payment")
      }
      const query = {
        paymentId: successData.tran_id,
      }
      const update = {
        $set: {
          status: "SUCCESS",

        },

      }
      await payment.updateOne(query, update)
      res.redirect('https://trendymart-tm.web.app/orderComplete')

    })
    app.post('/fail', async (req, res) => {
      res.redirect('https://trendymart-tm.web.app/orderfail')
    })
    app.post('/cancel', async (req, res) => {
      res.redirect('https://trendymart-tm.web.app/orderCancle')
    })

    // .......................payments..........................
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})