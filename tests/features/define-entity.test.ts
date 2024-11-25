import { EntitySchema, InferEntity, Reference, Collection } from '@mikro-orm/core';
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

    interface IFoo {
      string: string;
      number: number;
      date: Date;
      array: string[];
      enum: 'a' | 'b';
      json: { bar: string };
      uuid: string;
    }

    assert<IsExact<IFoo, InferEntity<typeof Foo>>>(true);
  });

  it('should infer nullable properties', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        default: t.text(),
        required: t.text({ nullable: false }),
        nullable: t.text({ nullable: true }),
      }),
    });

    interface IFoo {
      default: string;
      required: string;
      nullable: string | undefined | null;
    }

    assert<IsExact<IFoo, InferEntity<typeof Foo>>>(true);
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

    interface IFoo {
      directly: IBar;
      ref: Reference<IBar>;
      nullableDirectly: IBar | undefined | null;
      nullableRef: Reference<IBar> | undefined | null;
    }

    assert<IsExact<IFoo, InferEntity<typeof Foo>>>(true);
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

    interface IFoo {
      directly: IBar;
      ref: Reference<IBar>;
      nullableDirectly: IBar | undefined | null;
      nullableRef: Reference<IBar> | undefined | null;
    }

    assert<IsExact<IFoo, InferEntity<typeof Foo>>>(true);
  });

  it('should infer oneToMany relations', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.oneToMany(() => Bar, { mappedBy: 'foo' }),
        nullableDirectly: t.oneToMany(() => Bar, { mappedBy: 'foo', nullable: true }),
      }),
    });

    interface IFoo {
      directly: Collection<IBar>;
      nullableDirectly: Collection<IBar> | undefined | null;
    }

    assert<IsExact<IFoo, InferEntity<typeof Foo>>>(true);
  });

  it('should infer manyToMany relations', () => {
    const Foo = EntitySchema.define({
      name:'foo',
      properties: t => ({
        directly: t.manyToMany(() => Bar, { mappedBy: 'foo' }),
        nullableDirectly: t.manyToMany(() => Bar, { mappedBy: 'foo', nullable: true }),
      }),
    });

    interface IFoo {
      directly: Collection<IBar>;
      nullableDirectly: Collection<IBar> | undefined | null;
    }

    assert<IsExact<IFoo, InferEntity<typeof Foo>>>(true);
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

    interface IFoo {
      directly: IBar;
      ref: Reference<IBar>;
      nullableDirectly: IBar | undefined | null;
      nullableRef: Reference<IBar> | undefined | null;
    }

    assert<IsExact<IFoo, InferEntity<typeof Foo>>>(true);
  });
});
