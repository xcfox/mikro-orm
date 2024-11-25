import type { EmbeddedOptions, EnumOptions, ManyToManyOptions, ManyToOneOptions, OneToManyOptions, OneToOneOptions, PropertyOptions } from '../decorators';
import { ReferenceKind } from '../enums';
import { EntitySchema } from '../metadata/EntitySchema';
import { types, type InferJSType, type Type } from '../types';
import type { Constructor, Dictionary, EntityMetadata, EntityName, InferEntityFromProperties, Ref } from '../typings';
import type { Collection } from './Collection';
import type { Reference } from './Reference';

export type TypeType = string | NumberConstructor | StringConstructor | BooleanConstructor | DateConstructor | ArrayConstructor | Constructor<Type<any>> | Type<any>;

export type TypeDef<Target> = { type: TypeType } | { entity: string | (() => string | EntityName<Target>) };

export type EmbeddedTypeDef<Target> = { type: TypeType } | { entity: string | (() => string | EntityName<Target> | EntityName<Target>[]) };

export interface PropertyFactory<Value> {
  (options?: Omit<PropertyOptions<unknown, Value>, 'type'> & { nullable?: false; ref?: false }): PropertyOptions<unknown, Value>;
  (options?: Omit<PropertyOptions<unknown, Value>, 'type'> & { nullable: true; ref?: false }): PropertyOptions<unknown, Value | null | undefined>;
  (options?: Omit<PropertyOptions<unknown, Value>, 'type'> & { nullable?: false; ref: true }): PropertyOptions<unknown, Ref<Value>>;
  (options?: Omit<PropertyOptions<unknown, Value>, 'type'> & { nullable: true; ref: true }): PropertyOptions<unknown, Ref<Value> | null | undefined>;
}

type InferType<T extends TypeType> = T extends string ? any :
  T extends NumberConstructor ? number :
  T extends StringConstructor ? string :
  T extends BooleanConstructor ? boolean :
  T extends DateConstructor ? Date :
  T extends ArrayConstructor ? string[] :
  T extends Constructor<infer TType> ?
    TType extends Type<any, any> ? NonNullable<InferJSType<TType>> : TType :
  T extends Type<any, any> ? NonNullable<InferJSType<T>> :
  never;


export interface TypedPropertyFactory {
  <Value extends TypeType>(type: Value, options?: Omit<PropertyOptions<unknown, InferType<Value>>, 'type'> & { nullable?: false; ref?: false }): PropertyOptions<unknown, InferType<Value>>;
  <Value extends TypeType>(type: Value, options?: Omit<PropertyOptions<unknown, InferType<Value>>, 'type'> & { nullable: true; ref?: false }): PropertyOptions<unknown, InferType<Value> | null | undefined>;
  <Value extends TypeType>(type: Value, options?: Omit<PropertyOptions<unknown, InferType<Value>>, 'type'> & { nullable?: false; ref: true }): PropertyOptions<unknown, Ref<InferType<Value>>>;
  <Value extends TypeType>(type: Value, options?: Omit<PropertyOptions<unknown, InferType<Value>>, 'type'> & { nullable: true; ref: true }): PropertyOptions<unknown, Ref<InferType<Value>> | null | undefined>;
}

export interface JsonPropertyFactory {
  <Payload = any>(options?: Omit<PropertyOptions<unknown, Payload>, 'type'> & { nullable?: false; ref?: false }): PropertyOptions<unknown, Payload>;
  <Payload = any>(options?: Omit<PropertyOptions<unknown, Payload>, 'type'> & { nullable: true; ref?: false }): PropertyOptions<unknown, Payload | null | undefined>;
  <Payload = any>(options?: Omit<PropertyOptions<unknown, Payload>, 'type'> & { nullable?: false; ref: true }): PropertyOptions<unknown, Ref<Payload>>;
  <Payload = any>(options?: Omit<PropertyOptions<unknown, Payload>, 'type'> & { nullable: true; ref: true }): PropertyOptions<unknown, Ref<Payload> | null | undefined>;
}

export interface ManyToOneFactory {
  <Target extends object>(entity: () => EntityName<Target>, options?: ManyToOneOptions<unknown, Target> & { nullable?: false }): ({ kind: ReferenceKind.MANY_TO_ONE } & TypeDef<Target> & ManyToOneOptions<unknown, Target>);
  <Target extends object>(entity: () => EntityName<Target>, options?: ManyToOneOptions<unknown, Target> & { nullable: true }): ({ kind: ReferenceKind.MANY_TO_ONE } & TypeDef<Target> & ManyToOneOptions<unknown, Target, Collection<Target> | null | undefined>);
}

export interface OneToOneFactory {
  <Target extends object>(entity: () => EntityName<Target>, options?: OneToOneOptions<unknown, Target> & { nullable?: false }): ({ kind: ReferenceKind.ONE_TO_ONE } & TypeDef<Target> & OneToOneOptions<unknown, Target>);
  <Target extends object>(entity: () => EntityName<Target>, options?: OneToOneOptions<unknown, Target> & { nullable: true }): ({ kind: ReferenceKind.ONE_TO_ONE } & TypeDef<Target> & OneToOneOptions<unknown, Target, Reference<Target> | null | undefined>);
}

export interface OneToManyFactory {
  <Target extends object>(entity: () => EntityName<Target>, options: OneToManyOptions<unknown, Target> & { nullable?: false }): ({ kind: ReferenceKind.ONE_TO_MANY } & TypeDef<Target> & OneToManyOptions<unknown, Target>);
  <Target extends object>(entity: () => EntityName<Target>, options: OneToManyOptions<unknown, Target> & { nullable: true }): ({ kind: ReferenceKind.ONE_TO_MANY } & TypeDef<Target> & OneToManyOptions<unknown, Target, Collection<Target, object> | null | undefined>);
}

export interface ManyToManyFactory {
  <Target extends object>(entity: () => EntityName<Target>, options?: ManyToManyOptions<unknown, Target> & { nullable?: false }): ({ kind: ReferenceKind.MANY_TO_MANY } & TypeDef<Target> & ManyToManyOptions<unknown, Target>);
  <Target extends object>(entity: () => EntityName<Target>, options?: ManyToManyOptions<unknown, Target> & { nullable: true }): ({ kind: ReferenceKind.MANY_TO_MANY } & TypeDef<Target> & ManyToManyOptions<unknown, Target, Collection<Target, object> | null | undefined>);
}

export interface EmbeddedFactory {
  <Target extends object>(entity: () => EntityName<Target>, options?: EmbeddedOptions & PropertyOptions<unknown> & { nullable?: false }): ({ kind: ReferenceKind.EMBEDDED } & EmbeddedTypeDef<Target> & EmbeddedOptions & PropertyOptions<unknown, Reference<Target>>);
  <Target extends object>(entity: () => EntityName<Target>, options?: EmbeddedOptions & PropertyOptions<unknown> & { nullable: true }): ({ kind: ReferenceKind.EMBEDDED } & EmbeddedTypeDef<Target> & EmbeddedOptions & PropertyOptions<unknown, Reference<Target> | null | undefined>);
}

export interface EnumFactory {
  <EnumType>(items: () => Dictionary<EnumType>, option?: EnumOptions<unknown, EnumType> & { nullable?: false }) : ({ enum: true } & EnumOptions<unknown, EnumType>);
  <EnumType>(items: () => Dictionary<EnumType>, option?: EnumOptions<unknown, EnumType> & { nullable: true }) : ({ enum: true } & EnumOptions<unknown, EnumType | null | undefined>);
  <ItemTypes extends (number | string)[]>(items: ItemTypes, option?: EnumOptions<unknown, ItemTypes[number]> & { nullable?: false }) : ({ enum: true } & EnumOptions<unknown, ItemTypes[number]>);
  <ItemTypes extends (number | string)[]>(items: ItemTypes, option?: EnumOptions<unknown, ItemTypes[number]> & { nullable: true }) : ({ enum: true } & EnumOptions<unknown, ItemTypes[number] | null | undefined>);
}

function propertyFactory<ValueType extends Type<unknown, unknown>>(type: Constructor<ValueType>): PropertyFactory<NonNullable<InferJSType<ValueType>>> {
  return (options => ({ ...options, type })) as PropertyFactory<NonNullable<InferJSType<ValueType>>>;
}

const typePropertyFactory: TypedPropertyFactory = (type, options) => {
  return { ...options, type };
};

const manyToOneFactory: ManyToOneFactory = (entity, options) => {
  return { ...options, kind: ReferenceKind.MANY_TO_ONE, ref: true, entity };
};

const oneToOneFactory: OneToOneFactory = (entity, options) => {
  return { ...options, kind: ReferenceKind.ONE_TO_ONE, ref: true, entity };
};

const oneToManyFactory: OneToManyFactory = (entity, options) => {
  return { ...options, kind: ReferenceKind.ONE_TO_MANY, entity };
};

const manyToManyFactory: ManyToManyFactory = (entity, options) => {
  return { ...options, kind: ReferenceKind.MANY_TO_MANY, entity };
};

const embeddedFactory: EmbeddedFactory = (entity: () => any, options) => {
  return { ...options, kind: ReferenceKind.EMBEDDED, entity };
};

const enumFactory: EnumFactory = (items: (number | string)[] | (() => Dictionary), options?: EnumOptions<unknown>) => {
  return { ...options, enum: true as const, items };
};

const propertyFactories = {
  date: propertyFactory(types.date),
  time: propertyFactory(types.time),
  datetime: propertyFactory(types.datetime),
  bigint: propertyFactory(types.bigint),
  blob: propertyFactory(types.blob),
  uint8array: propertyFactory(types.uint8array),
  array: propertyFactory(types.array),
  json: propertyFactory(types.json) as JsonPropertyFactory,
  integer: propertyFactory(types.integer),
  smallint: propertyFactory(types.smallint),
  tinyint: propertyFactory(types.tinyint),
  mediumint: propertyFactory(types.mediumint),
  float: propertyFactory(types.float),
  double: propertyFactory(types.double),
  boolean: propertyFactory(types.boolean),
  decimal: propertyFactory(types.decimal),
  character: propertyFactory(types.character),
  string: propertyFactory(types.string),
  uuid: propertyFactory(types.uuid),
  text: propertyFactory(types.text),
  interval: propertyFactory(types.interval),
  unknown: propertyFactory(types.unknown),

  property: typePropertyFactory,

  manyToOne: manyToOneFactory,
  oneToOne: oneToOneFactory,
  oneToMany: oneToManyFactory,
  manyToMany: manyToManyFactory,
  embedded: embeddedFactory,

  enum: enumFactory,
};

export function defineEntity<Properties extends Record<string, PropertyOptions<unknown, unknown>>>(
  meta: Omit<Partial<EntityMetadata<InferEntityFromProperties<Properties>>>, 'properties' | 'extends'> & {
    name: string;
    properties: ((factories: typeof propertyFactories) => Properties) | Properties;
  }) {
  const { properties: getProperties, ...options } = meta;
  const properties = typeof getProperties === 'function' ? getProperties(propertyFactories) : getProperties;
  return new EntitySchema({ properties, ...options } as any);
}

export function defineEntityProperties<Properties extends Record<string, PropertyOptions<unknown, unknown>>>(properties: (factories: typeof propertyFactories) => Properties): Properties {
  return properties(propertyFactories);
}
