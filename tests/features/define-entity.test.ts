import { EntitySchema, InferEntity, Reference, Collection, InferEntityFromProperties, RequiredEntityData, Opt, Ref, m, TextType, types, ReferenceKind } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/sqlite';
import { IsExact, assert } from 'conditional-type-checks';

describe('define-entity', () => {
  const Bar = EntitySchema.define({
    name:'bar',
    properties: t => ({
      foo: m.string(),
    }),
  });

  interface IBar extends InferEntity<typeof Bar> {}

  it('should define entity with properties', () => {
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

    const FooExpected = new EntitySchema({
      name: 'foo',
      properties: {
        string:{ type: types.string },
        number:{ type: types.float },
        date:{ type: types.datetime },
        array:{ type: types.array },
        enum:{ enum: true, items:['a', 'b'] },
        json: { type: types.json },
        text:{ type: TextType },
        text1:{ type: 'text' },
        float:{ type: 'float', onCreate: expect.any(Function) },
        uuid:{ type: types.uuid },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with properties from combination', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        createdAt:{ type: types.datetime },
        updatedAt:{ type: types.datetime },
        bar:{ type: types.string },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with nullable properties', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        directly:{ type: types.text },
        required:{ type: types.text, nullable: false },
        nullable:{ type: types.text, nullable: true },
        json:{ type: types.json },
        jsonRequired:{ type: types.json, nullable: false },
        jsonOptional:{ type: types.json, onCreate: expect.any(Function) },
        jsonNullable:{ type: types.json, nullable: true },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with manyToOne relations', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        directly:{ kind: ReferenceKind.MANY_TO_ONE, entity: expect.any(Function) },
        ref:{ kind: ReferenceKind.MANY_TO_ONE, entity: expect.any(Function), ref: true },
        nullableDirectly:{ kind: ReferenceKind.MANY_TO_ONE, entity: expect.any(Function), nullable: true },
        nullableRef:{ kind: ReferenceKind.MANY_TO_ONE, entity: expect.any(Function), ref:true, nullable: true },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with oneToOne relations', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        directly: { kind: ReferenceKind.ONE_TO_ONE, entity: expect.any(Function) },
        ref: { kind: ReferenceKind.ONE_TO_ONE, entity: expect.any(Function), ref: true },
        nullableDirectly: { kind: ReferenceKind.ONE_TO_ONE, entity: expect.any(Function), nullable: true },
        nullableRef: { kind: ReferenceKind.ONE_TO_ONE, entity: expect.any(Function), ref:true, nullable: true },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with oneToMany relations', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        directly: { kind: ReferenceKind.ONE_TO_MANY, entity: expect.any(Function), mappedBy : 'foo' },
        nullableDirectly: { kind: ReferenceKind.ONE_TO_MANY, entity: expect.any(Function), mappedBy : 'foo', nullable: true },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with manyToMany relations', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        directly: { kind: ReferenceKind.MANY_TO_MANY, entity: expect.any(Function), mappedBy : 'foo' },
        nullableDirectly: { kind: ReferenceKind.MANY_TO_MANY, entity: expect.any(Function), mappedBy : 'foo', nullable: true },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with embedded properties', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        directly:{ kind: ReferenceKind.EMBEDDED, entity: expect.any(Function) },
        ref:{ kind: ReferenceKind.EMBEDDED, entity: expect.any(Function), ref: true },
        nullableDirectly:{ kind: ReferenceKind.EMBEDDED, entity: expect.any(Function), nullable: true },
        nullableRef:{ kind: ReferenceKind.EMBEDDED, entity: expect.any(Function), ref: true, nullable: true },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
  });

  it('should define entity with enum properties', () => {
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

    const FooExpected = new EntitySchema<IFooExpected>({
      name: 'foo',
      properties: {
        items: { enum: true, items: ab },
        arrayItems: { enum: true, items: ab, array: true },
        refItems: { enum: true, items: ab, ref: true },
        nullableItems: { enum: true, items: ab, nullable: true },
        nullableRefItems: { enum: true, items: ab, ref: true, nullable: true },

        enum: { enum: true, items: expect.any(Function) },
        enumArray: { enum: true, items: expect.any(Function), array: true },
        enumRef: { enum: true, items: expect.any(Function), ref: true },
        nullableEnum: { enum: true, items: expect.any(Function), nullable: true },
        nullableEnumRef: { enum: true, items: expect.any(Function), ref: true, nullable: true },
      },
    });

    expect(Foo.meta.properties).toEqual(FooExpected.meta.properties);
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

