import type { Collection, InferEntity, OptionalProps } from '@mikro-orm/core';
import { EntitySchema } from '@mikro-orm/core';
import type { IBaseEntity5 } from './BaseEntity5';
import { Book4, type IBook4 } from './Book4';
import { Test4, type ITest4 } from './Test4';
import { BaseEntity5 } from './BaseEntity5';

export interface IPublisher4 extends Omit<IBaseEntity5, typeof OptionalProps> {
  [OptionalProps]?: 'name' | 'type' | IBaseEntity5[typeof OptionalProps];
  name: string;
  type: PublisherType;
  books: Collection<IBook4>;
  tests: Collection<ITest4>;
  enum3?: number;
}

export enum PublisherType {
  LOCAL = 'local',
  GLOBAL = 'global',
}

export const Publisher4 = new EntitySchema<IPublisher4, IBaseEntity5>({
  name: 'Publisher4',
  extends: BaseEntity5,
  properties: {
    name: { type: 'string', default: 'asd' },
    type: { enum: true, items: () => PublisherType, default: PublisherType.LOCAL },
    enum3: { enum: true, items: [1, 2, 3], nullable: true },
    books: { kind: '1:m', entity: 'Book4', mappedBy: 'publisher' },
    tests: { kind: 'm:n', entity:  'Test4', fixedOrder: true },
  },
});

export const Publisher5 = EntitySchema.define({
  name:'Publisher5',
  properties: t => ({
     name: t.string({ default: 'asd' }),
     name1: t.string({ default: 'asd', nullable: true }),
     name2: t.string({ default: 'asd', ref: true }),
     name3: t.string({ default: 'asd', nullable: true, ref: true }),
     type: t.enum(() => PublisherType, { default: PublisherType.LOCAL }),
     enum3: t.enum([1, 2, 3] as const, { nullable: true }),
     books: t.oneToMany(() => Book4, { mappedBy:'publisher' }),
     tests: t.manyToMany(() =>  Test4, { fixedOrder: true }),
   }),
 });

export type IPublisher5 = InferEntity<typeof Publisher5>;
