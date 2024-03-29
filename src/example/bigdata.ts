import { createFilter } from 'odata4-inmemory';
import { Token } from 'odata4-parser/lib/lexer';
import { ODataServer, ODataController, Edm, odata } from '../lib/index';

const schemaJson = {
  version: '4.0',
  dataServices: {
    schema: [
      {
        namespace: 'BigData',
        entityType: [
          {
            name: 'Index',
            key: [
              {
                propertyRef: [
                  {
                    name: 'id',
                  },
                ],
              },
            ],
            property: [
              {
                name: 'id',
                type: 'Edm.Int64',
                nullable: false,
              },
            ],
          },
        ],
        entityContainer: {
          name: 'BigDataContext',
          entitySet: [
            {
              name: 'Indices',
              entityType: 'BigData.Index',
            },
          ],
        },
      },
    ],
  },
};

const schemaEntityTypeProperties = schemaJson.dataServices.schema[0].entityType[0].property;
const propertyCount = 1000;
for (let i = 0; i < propertyCount; i++) {
  schemaEntityTypeProperties.push({
    name: `Property${i}`,
    type: 'Edm.String',
    nullable: true,
  });
}
console.log('Schema ready.');

const bigdata = [];
const dataCount = 100;
for (let d = 0; d < dataCount; d++) {
  const data = {
    id: d,
  };
  for (let i = 0; i < propertyCount; i++) {
    data[`Property${i}`] = `StringData${i}-${d}`;
  }
  bigdata.push(data);
}
console.log('Data ready.');

@Edm.OpenType
class Index {
  @Edm.Int64
  id: number;
}

@odata.type(Index)
class IndicesController extends ODataController {
  @odata.GET
  find(@odata.filter filter: Token, @odata.query query: Token) {
    let mapper = (it) => it;
    if (query) {
      const $select = query.value.options.find((t) => t.type == 'Select');
      if ($select) {
        const props = $select.value.items.map((t) => t.raw);
        mapper = (it) => {
          const r = {};
          props.forEach((p) => (r[p] = it[p]));
          return r;
        };
      }
    }
    if (filter) return bigdata.filter(createFilter(filter)).map(mapper);
    return bigdata.map(mapper);
  }
}

@odata.namespace('BigData')
@odata.controller(IndicesController, true)
class BigDataServer extends ODataServer {}
BigDataServer.$metadata(schemaJson);
BigDataServer.create('/odata', 3000);
console.log('OData ready.');
