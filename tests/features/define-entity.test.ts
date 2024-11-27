import { EntitySchema, InferEntity, Reference, Collection, InferEntityFromProperties, RequiredEntityData, Opt, Ref, m, TextType } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/sqlite';
import { IsExact, assert } from 'conditional-type-checks';

describe('InferEntity', () => {
  const Bar = EntitySchema.define({
    name:'bar',
    properties: t => ({
      foo: m.string(),
    }),
  });

  interface IBar extends InferEntity<typeof Bar> {}

  it('should infer properties', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: {
        string: m.string(),
        number: m.float(),
        date: m.datetime(),
        array: m.array(),
        enum: m.enum(['a', 'b'] as const),
        json: m.json<{ bar: string }>(),
        text: m.property(TextType),
        text1: m.property('text'),
        float: m.property('float', { onCreate:() => 0 }),
        uuid: m.uuid(),
      },
    });

    interface IFooExpected {
      string: string;
      number: number;
      date: Date;
      array: string[];
      enum: 'a' | 'b';
      json: { bar: string };
      text: string;
      text1: string;
      float: Opt<number>;
      uuid: string;
    }

    type IFoo = InferEntity<typeof Foo>;
    assert<IsExact<IFoo, IFooExpected>>(true);
  });

  it('should infer properties from combination', () => {
    const WithTimes = EntitySchema.define({
      name:'WithTimes',
      properties: {
        createdAt: m.datetime(),
        updatedAt: m.datetime(),
      },
    });

    const Foo = EntitySchema.define({
      name:'foo',
      properties: {
        ...WithTimes.properties,
        bar: m.string(),
      },
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
      properties: {
        directly: m.text(),
        required: m.text({ nullable: false }),
        nullable: m.text({ nullable: true }),
        json: m.json<{ bar: string }>(),
        jsonRequired: m.json<{ bar: string }>({ nullable: false }),
        jsonOptional: m.json<{ bar: string }>({ onCreate: () => ({ bar:'' }) }),
        jsonNullable: m.json<{ bar: string }>({ nullable: true }),
      },
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
      properties: {
        directly: m.manyToOne(() => Bar),
        ref: m.manyToOne(() => Bar, { ref: true }),
        nullableDirectly: m.manyToOne(() => Bar, { nullable: true }),
        nullableRef: m.manyToOne(() => Bar, { ref: true, nullable: true }),
      },
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
      properties: {
        directly: m.oneToOne(() => Bar),
        ref: m.oneToOne(() => Bar, { ref: true }),
        nullableDirectly: m.oneToOne(() => Bar, { nullable: true }),
        nullableRef: m.oneToOne(() => Bar, { ref: true, nullable: true }),
      },
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
      properties: {
        directly: m.oneToMany(() => Bar, { mappedBy: 'foo' }),
        nullableDirectly: m.oneToMany(() => Bar, { mappedBy: 'foo', nullable: true }),
      },
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
      properties: {
        directly: m.manyToMany(() => Bar, { mappedBy: 'foo' }),
        nullableDirectly: m.manyToMany(() => Bar, { mappedBy: 'foo', nullable: true }),
      },
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
      properties: {
        directly: m.embedded(() => Bar),
        ref: m.embedded(() => Bar, { ref: true }),
        nullableDirectly: m.embedded(() => Bar, { nullable: true }),
        nullableRef: m.embedded(() => Bar, { ref: true, nullable: true }),
      },
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
      properties: {
        items: m.enum(ab),
        arrayItems: m.enum(ab, { array: true }),
        refItems: m.enum(ab, { ref: true }),
        nullableItems: m.enum(ab, { nullable: true }),
        nullableRefItems: m.enum(ab, { ref: true, nullable: true }),
        enum: m.enum(() => Baz),
        enumArray: m.enum(() => Baz, { array: true }),
        enumRef: m.enum(() => Baz, { ref: true }),
        nullableEnum: m.enum(() => Baz, { nullable: true }),
        nullableEnumRef: m.enum(() => Baz, { ref: true, nullable: true }),
      },
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
    const FooProperties = m.defineProperties({
      bar: m.manyToOne(() => Bar, { ref: true }),
      text: m.text(),
    });

    interface IFoo extends InferEntityFromProperties<typeof FooProperties> {
      parent: Reference<IFoo>;
    }

    const Foo: EntitySchema<IFoo> = EntitySchema.define({
      name:'foo',
      properties: {
        ...FooProperties,
        parent: m.manyToOne(() => Foo, { ref: true }),
      },
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
        id: m.integer({ primary: true }),
        normal: m.string(),
        withNullable: m.string({ nullable: true }),
        withDefault: m.string({ default: 'foo' }),
        withOnCreate: m.string({ onCreate: () => 'foo' }),
      }),
    });

    type IFoo = InferEntity<typeof Foo>;

    type RequiredFoo = RequiredEntityData<IFoo>;

    interface RequiredFooExpected {
      normal: string;
      id?: number | undefined | null;
      withNullable?: string | undefined | null;
      withDefault?: Opt<string> | undefined | null;
      withOnCreate?: Opt<string> | undefined | null;
    }

    assert<IsExact<RequiredFoo, RequiredFooExpected>>(true);
  });

});

describe('define-entity', () => {
  const WithId = m.defineProperties({
    id: m.integer({ primary: true }),
  });
  const WithCreatedAt = EntitySchema.define({
    name:'WithCreatedAt',
    properties: {
      createdAt: m.datetime({ onCreate: () => new Date() }),
    },
    abstract: true,
  });
  const WithUpdatedAt = {
    updatedAt: m.datetime({
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
    }),
  };
  const WithDeletedAt = {
    deletedAt: m.datetime({ nullable: true }),
  };

  const Composed = EntitySchema.define({
    name:'Composed',
    properties: {
      ...WithId,
      ...WithCreatedAt.properties,
      ...WithUpdatedAt,
      ...WithDeletedAt,
    },
    indexes:[{ properties: ['createdAt'] }],
  });

  const Foo = EntitySchema.define({
    name:'Foo',
    properties: {
      ...WithCreatedAt.properties,
      id: m.integer({ primary: true }),
      byDefault: m.text({ default: 'foo' }),
    },
  });
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init({
      entities: [WithCreatedAt, Foo, Composed],
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

  it('should be able to compose properties', async () => {
    const composed = orm.em.create(Composed, {});
    await orm.em.flush();
    expect(composed.id).toBeDefined();
    expect(composed.createdAt).toBeInstanceOf(Date);
    expect(composed.updatedAt).toBeInstanceOf(Date);
    expect(composed.deletedAt).toBeUndefined();
  });
});

