import { EntitySchema, InferEntity, Reference, Collection, InferEntityFromProperties, RequiredEntityData, Opt, Ref } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/sqlite';
import { IsExact, assert } from 'conditional-type-checks';

describe('InferEntity', () => {
  const Bar = EntitySchema.define({
    name:'bar',
    properties: t => ({
      foo: t.string(),
    }),
  });

  interface IBar extends InferEntity<typeof Bar> {}

  it('should infer properties', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        string: t.string(),
        number: t.float(),
        date: t.datetime(),
        array: t.array(),
        enum: t.enum(['a', 'b'] as const),
        json: t.json<{ bar: string }>(),
        uuid: t.uuid(),
      }),
    });

    interface IFooExpected {
      string: string;
      number: number;
      date: Date;
      array: string[];
      enum: 'a' | 'b';
      json: { bar: string };
      uuid: string;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer properties from combination', () => {
    const WithTimes = EntitySchema.define({
      name:'WithTimes',
      properties: t => ({
        createdAt: t.datetime(),
        updatedAt: t.datetime(),
      }),
    });

    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        ...WithTimes.properties,
        bar: t.string(),
      }),
    });

    interface IFooExpected {
      createdAt: Date;
      updatedAt: Date;
      bar: string;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer nullable properties', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.text(),
        required: t.text({ nullable: false }),
        nullable: t.text({ nullable: true }),
        json: t.json<{ bar: string }>(),
        jsonRequired: t.json<{ bar: string }>({ nullable: false }),
        jsonOptional: t.json<{ bar: string }>({ onCreate: () => ({ bar:'' }) }),
        jsonNullable: t.json<{ bar: string }>({ nullable: true }),
      }),
    });

    interface IFooExpected {
      directly: string;
      required: string;
      nullable: string | undefined | null;
      json: { bar: string };
      jsonRequired: { bar: string };
      jsonOptional: Opt<{ bar: string }>;
      jsonNullable: { bar: string } | undefined | null;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer manyToOne relations', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.manyToOne(() => Bar),
        ref: t.manyToOne(() => Bar, { ref: true }),
        nullableDirectly: t.manyToOne(() => Bar, { nullable: true }),
        nullableRef: t.manyToOne(() => Bar, { ref: true, nullable: true }),
      }),
    });

    interface IFooExpected {
      directly: IBar;
      ref: Reference<IBar>;
      nullableDirectly: IBar | undefined | null;
      nullableRef: Reference<IBar> | undefined | null;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer oneToOne relations', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.oneToOne(() => Bar),
        ref: t.oneToOne(() => Bar, { ref: true }),
        nullableDirectly: t.oneToOne(() => Bar, { nullable: true }),
        nullableRef: t.oneToOne(() => Bar, { ref: true, nullable: true }),
      }),
    });

    interface IFooExpected {
      directly: IBar;
      ref: Reference<IBar>;
      nullableDirectly: IBar | undefined | null;
      nullableRef: Reference<IBar> | undefined | null;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer oneToMany relations', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.oneToMany(() => Bar, { mappedBy: 'foo' }),
        nullableDirectly: t.oneToMany(() => Bar, { mappedBy: 'foo', nullable: true }),
      }),
    });

    interface IFooExpected {
      directly: Collection<IBar>;
      nullableDirectly: Collection<IBar> | undefined | null;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer manyToMany relations', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.manyToMany(() => Bar, { mappedBy: 'foo' }),
        nullableDirectly: t.manyToMany(() => Bar, { mappedBy: 'foo', nullable: true }),
      }),
    });

    interface IFooExpected {
      directly: Collection<IBar>;
      nullableDirectly: Collection<IBar> | undefined | null;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer embedded properties', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.embedded(() => Bar),
        ref: t.embedded(() => Bar, { ref: true }),
        nullableDirectly: t.embedded(() => Bar, { nullable: true }),
        nullableRef: t.embedded(() => Bar, { ref: true, nullable: true }),
      }),
    });

    interface IFooExpected {
      directly: IBar;
      ref: Reference<IBar>;
      nullableDirectly: IBar | undefined | null;
      nullableRef: Reference<IBar> | undefined | null;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer enum properties', () => {
    enum Baz {
      A,
      B,
    }

    const ab: ('a' | 'b')[] = ['a', 'b'];

    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        items: t.enum(ab),
        arrayItems: t.enum(ab, { array: true }),
        refItems: t.enum(ab, { ref: true }),
        nullableItems: t.enum(ab, { nullable: true }),
        nullableRefItems: t.enum(ab, { ref: true, nullable: true }),
        enum: t.enum(() => Baz),
        enumArray: t.enum(() => Baz, { array: true }),
        enumRef: t.enum(() => Baz, { ref: true }),
        nullableEnum: t.enum(() => Baz, { nullable: true }),
        nullableEnumRef: t.enum(() => Baz, { ref: true, nullable: true }),
      }),
    });

    interface IFooExpected {
      items: 'a' | 'b';
      arrayItems: ('a' | 'b')[];
      refItems: Ref<'a'> | Ref<'b'>;
      nullableItems: 'a' | 'b' | undefined | null;
      nullableRefItems: Ref<'a'> | Ref<'b'> | undefined | null;

      enum: Baz | string;
      enumArray: (Baz | string)[];
      enumRef: Ref<Baz> | Ref<string>;
      nullableEnum: Baz | string | undefined | null;
      nullableEnumRef: Ref<Baz> | Ref<string> | undefined | null;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer properties for circular reference entity', () => {
    const FooProperties = EntitySchema.defineProperties(t => ({
      bar: t.manyToOne(() => Bar, { ref: true }),
      text: t.text(),
    }));

    interface IFoo extends InferEntityFromProperties<typeof FooProperties> {
      parent: Reference<IFoo>;
    }

    const Foo: EntitySchema<IFoo> = EntitySchema.define({
      name:'foo',
      properties: t => ({
        ...FooProperties,
        parent: t.manyToOne(() => Foo, { ref: true }),
      }),
    });

    interface IFooExpected {
      bar: Reference<IBar>;
      text: string;
      parent: Reference<IFoo>;
    }

    assert<IsExact<IFooExpected, InferEntity<typeof Foo>>>(true);
  });

  it('should infer Required properties', () => {
    const Foo = EntitySchema.define({
      name:'Foo',
      properties: t => ({
        id: t.integer({ primary: true }),
        normal: t.string(),
        withNullable: t.string({ nullable: true }),
        withDefault: t.string({ default: 'foo' }),
      }),
    });

    type IFoo = InferEntity<typeof Foo>;

    type RequiredFoo = RequiredEntityData<IFoo>;

    interface IBar {
      text: Opt<string>;
    }

    type RequiredBar = RequiredEntityData<IBar>;

  });

});

describe('define-entity', () => {
  const Foo = EntitySchema.define({
    name:'Foo',
    properties: t => ({
      id: t.integer({ primary: true }),
      createdAt: t.datetime({ onCreate: () => new Date() }),
      byDefault: t.text({ default: 'foo' }),
    }),
  });
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init({
      entities: [Foo],
      dbName: ':memory:',
    });
    await orm.schema.createSchema();
  });
  beforeEach(async () => orm.schema.clearDatabase());
  afterAll(() => orm.close(true));

  it('should create entity with default values', async () => {
    const foo = orm.em.create(Foo, {});
    expect(foo.createdAt).toBeInstanceOf(Date);
    expect(foo.byDefault).toBeUndefined();
    await orm.em.flush();
    expect(foo.createdAt).toBeInstanceOf(Date);
    expect(foo.byDefault).toEqual('foo');
  });
});

