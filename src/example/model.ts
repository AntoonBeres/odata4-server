/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'mongodb';
import { Edm } from '../lib/index';

const toObjectID = (_id) => (_id && !(_id instanceof ObjectId) ? ObjectId.createFromHexString(_id) : _id);

@Edm.Annotate({
  term: 'UI.DisplayName',
  string: 'Products',
})
export class Product {
  @Edm.Key
  @Edm.Computed
  @Edm.TypeDefinition(ObjectId)
  @Edm.Annotate(
    {
      term: 'UI.DisplayName',
      string: 'Product identifier',
    },
    {
      term: 'UI.ControlHint',
      string: 'ReadOnly',
    },
  )
  _id: ObjectId;

  @Edm.TypeDefinition(ObjectId)
  @Edm.Required
  CategoryId: ObjectId;

  @Edm.ForeignKey('CategoryId')
  @Edm.EntityType(Edm.ForwardRef(() => Category))
  @Edm.Partner('Products')
  Category: Category;

  @Edm.Boolean
  Discontinued: boolean;

  @Edm.String
  @Edm.Annotate(
    {
      term: 'UI.DisplayName',
      string: 'Product title',
    },
    {
      term: 'UI.ControlHint',
      string: 'ShortText',
    },
  )
  Name: string;

  @Edm.String
  @Edm.Annotate(
    {
      term: 'UI.DisplayName',
      string: 'Product English name',
    },
    {
      term: 'UI.ControlHint',
      string: 'ShortText',
    },
  )
  QuantityPerUnit: string;

  @Edm.Decimal
  @Edm.Annotate(
    {
      term: 'UI.DisplayName',
      string: 'Unit price of product',
    },
    {
      term: 'UI.ControlHint',
      string: 'Decimal',
    },
  )
  UnitPrice: number;
}

@Edm.OpenType
@Edm.Annotate({
  term: 'UI.DisplayName',
  string: 'Categories',
})
export class Category {
  @Edm.Key
  @Edm.Computed
  @Edm.TypeDefinition(ObjectId)
  @Edm.Annotate(
    {
      term: 'UI.DisplayName',
      string: 'Category identifier',
    },
    {
      term: 'UI.ControlHint',
      string: 'ReadOnly',
    },
  )
  _id: ObjectId;

  @Edm.String
  Description: string;

  @Edm.String
  @Edm.Annotate(
    {
      term: 'UI.DisplayName',
      string: 'Category name',
    },
    {
      term: 'UI.ControlHint',
      string: 'ShortText',
    },
  )
  Name: string;

  @Edm.ForeignKey('CategoryId')
  @Edm.Collection(Edm.EntityType(Product))
  @Edm.Partner('Category')
  Products: Product[];

  @Edm.Collection(Edm.String)
  @Edm.Function
  echo() {
    return ['echotest'];
  }
}

export class NorthwindTypes extends Edm.ContainerBase {
  @Edm.String
  @Edm.URLDeserialize((value: string) => new ObjectId(value))
  @Edm.Deserialize((value) => new ObjectId(value))
  ObjectId = ObjectId;
}
