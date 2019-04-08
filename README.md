# Product variables growth - Design

# 1. Database Design -
  1. Fixed variable and derived variable should be stored in different collection or table depending upon whether you are using NoSql or Sql database. Reason for that is that Fixed variable do not change very frequently so we can apply a lot optimization like caheing etc.
  2. Both these collections will have an index on productId.
  3. Ideally fixed variable and derived should come from different services all together. Amazon uses a simmilar design, where static information like product title, bullet points etc come from one service, pricing comes from another and estimated time to delivery comes from another.
  4. Note - In you email you mentioned example of examples for fixed variables: color, finish, purchase price.
  5. It is generally not a good idea to keep pricing along with other fixed variables as it changes more often than product title. Also pricing can change based on country, if you are using same productId. So generally it is a good idea have pricing as a separate service all together.

# 2. How will you ensure that the &#39;derived values&#39; are updated with the latest value.
  1. As there is a separate service which manages derived values, this service should provide an publish interface, where vendor (person/entity for updating these values) can update the values of derived variable.
  2. Once the request to update derived variables comes our we should use some kind of queuing tools like rabbitMQ.
  3. We publish this update request to the rabbitMQ queue.
  4. rabbitMQ queue has a worker sever. Job of this worker is to take the first entry to queue and ensure that it will update the derived variable to all the databases (wherever it is required).
  5. Worker only sends confirmation when derived values are updated everywhere.

# 3. If the business teams need to take a decision based on the derive variables, how will you help the teams get it?
  1. It depends upon the actual requirements.
  2. If the requirement can be fulfilled by the basic aggregation operation provided by  database and it is not slowing the system then we can simply build and api which in turn will call the database query and return the data.
  3. If the requirement is such that it can not filled by direct DB query or the DB query is quite slow then we can pre-calculate and store it somewhere in DB. So writes take a bit longer but reads will much faster.
    1. Also in this case the rabbitMQ worked we talked about does all this precalculation and updates these stats as well.
  4. For business it is always a good idea to build a dashboard with beautiful graphs, which shows all the relevant information.



# Installation- Guide

## Prerequisite

- Npm
- Nodejs
- rabbitMQ
- mongoDB

## How to run

- Run &quot;npm install&quot;
- Start worker - &quot;node rabbitMQ/derivedProductDataWorker.js&quot;
- Start Server - &quot;npm start&quot;
- When you run a server for the first time, it creates a mongoDb database with two collections. It adds dummy information for 10 products.
- Visit - [http://localhost:3000/derivedProductInformation](http://localhost:3000/derivedProductInformation) to view list of products. Use JSON viewer for pretty display. Below is a sample product data.  productId._id is the product id.
  - {&quot;\_id&quot;:&quot;5cab65a76c286c411fe2ffcf&quot;,&quot;timeToAssemble&quot;:100,&quot;secondaryAttribute1&quot;:&quot;secondaryAttribute11&quot;,&quot;secondaryAttribute2&quot;:11,&quot;productId&quot;:{&quot;\_id&quot;:&quot;5cab65a66c286c411fe2ffc5&quot;,&quot;title&quot;:&quot;title1&quot;,&quot;description&quot;:&quot;description1&quot;,&quot;price&quot;:101,&quot;\_\_v&quot;:0},&quot;\_\_v&quot;:0}

- Visit -  [http://localhost:3000](http://localhost:3000/derivedProductInformation) Fill the form with the correct productId and submit it with the new value.
- Again visit - [http://localhost:3000/derivedProductInformation](http://localhost:3000/derivedProductInformation) to see if the information has changed.
