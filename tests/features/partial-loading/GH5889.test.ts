import { Entity, ManyToOne, MikroORM, OneToOne, PrimaryKey, Property } from '@mikro-orm/sqlite';
import { mockLogger } from '../../helpers';

@Entity()
class ClassName {

  @PrimaryKey()
  id!: number;

  @Property({ length: 10, nullable: true })
  foo?: string;

}

@Entity()
class Product {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => ClassName, nullable: true })
  className?: ClassName;

}

@Entity()
class SubProduct {

  @PrimaryKey()
  id!: number;

  @OneToOne({ entity: () => Product, nullable: true })
  product?: Product;

}

function getRandomBetween1And10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

async function createEntities() {
  const em = orm.em.fork();

  for (let i = 0; i < 10; i++) {
    const className = new ClassName();
    className.foo = `CLSS${i}`;

    em.persist(className);
  }

  await em.flush();

  for (let i = 0; i < 50; i++) {
    const product = new Product();

    em.assign(product, {
      className: getRandomBetween1And10(),
    });

    const subProduct = new SubProduct();

    em.assign(subProduct, {
      product,
    });

    em.persist(product);
    em.persist(subProduct);
  }

  await em.flush();
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    entities: [ClassName, Product, SubProduct],
    dbName: `:memory:`,
  });
  await orm.schema.createSchema();
});

afterAll(() => orm.close(true));

test('foo', async () => {
  await createEntities();

  const mock = mockLogger(orm);
  const entities = await orm.em.fork().findAll(SubProduct, {
    populate: ['product.className'],
    limit: 10,
    offset: 20,
    orderBy: { id: 'ASC' },
  });
  expect(entities).toHaveLength(10);
  expect(mock).toHaveBeenCalledTimes(1);

  mock.mockReset();
  const entities1 = await orm.em.fork().findAll(SubProduct, {
    populate: ['product.className'],
    fields: [
      'product.className.foo',
    ],
    limit: 10,
    offset: 20,
    orderBy: { id: 'ASC' },
  });
  expect(entities1).toHaveLength(10);
  expect(mock).toHaveBeenCalledTimes(1);
});