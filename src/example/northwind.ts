import { MongoClient, Db, ObjectId, FindOptions } from 'mongodb';
import { createQuery } from 'odata4-mongodb';
import { Token } from 'odata4-parser/lib/lexer';
import { ODataServer, ODataController, odata } from '../lib/index';
import schemaJson = require('./schema');
import categories = require('./categories');
import products = require('./products');

const mongodb = async function (): Promise<Db> {
  return (await MongoClient.connect('mongodb://localhost:27017/odataserver')).db();
};

class ProductsController extends ODataController {
  @odata.GET
  *find(@odata.query query: Token) {
    const db: Db = yield mongodb();
    const mongodbQuery = createQuery(query);
    if (typeof mongodbQuery.query._id == 'string') mongodbQuery.query._id = new ObjectId(mongodbQuery.query._id);
    if (typeof mongodbQuery.query.CategoryId == 'string') mongodbQuery.query.CategoryId = new ObjectId(mongodbQuery.query.CategoryId);
    return db
      .collection('Products')
      .find(mongodbQuery.query, {
        projection: mongodbQuery.projection,
        skip: mongodbQuery.skip,
        limit: mongodbQuery.limit,
      })
      .toArray();
  }

  @odata.GET
  *findOne(@odata.key key: string, @odata.query query: Token) {
    const db: Db = yield mongodb();
    const mongodbQuery = createQuery(query);
    return db.collection('Products').findOne({ _id: new ObjectId(key) }, mongodbQuery.projection as FindOptions);
  }

  @odata.POST
  async insert(@odata.body data: any) {
    const db = await mongodb();
    if (data.CategoryId) data.CategoryId = new ObjectId(data.CategoryId);
    return await db
      .collection('Products')
      .insertOne(data)
      .then((result) => {
        data._id = result.insertedId;
        return data;
      });
  }
}

class CategoriesController extends ODataController {
  @odata.GET
  *find(@odata.query query: Token): any {
    const db: Db = yield mongodb();
    const mongodbQuery = createQuery(query);
    if (typeof mongodbQuery.query._id == 'string') mongodbQuery.query._id = new ObjectId(mongodbQuery.query._id);
    return db
      .collection('Categories')
      .find(mongodbQuery.query, {
        projection: mongodbQuery.projection,
        skip: mongodbQuery.skip,
        limit: mongodbQuery.limit,
      })
      .toArray();
  }

  @odata.GET
  *findOne(@odata.key key: string, @odata.query query: Token) {
    const db: Db = yield mongodb();
    const mongodbQuery = createQuery(query);
    return db.collection('Categories').findOne({ _id: new ObjectId(key) }, mongodbQuery.projection);
  }
}

@odata.controller(ProductsController, true)
@odata.controller(CategoriesController, true)
class NorthwindServer extends ODataServer {
  async initDb() {
    const db = await mongodb();
    await db.dropDatabase();
    const categoryCollection = db.collection('Categories');
    const productsCollection = db.collection('Products');
    await categoryCollection.insertMany(categories);
    await productsCollection.insertMany(products);
  }
}
NorthwindServer.$metadata(schemaJson);
NorthwindServer.create('/odata', 3000);
