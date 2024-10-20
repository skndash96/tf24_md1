import { Decimal128, Double, IntegerType, ObjectId } from "mongodb";

export type SaleType = {
    _id: ObjectId;
    userId: String;
    itemId: String;
    price: Double;
    createdAt: Date;
}

export type FullSaleType = SaleType & {
    user: UserType;
    item: ItemType;
}

export type SubscriptionType = {
    _id: ObjectId;
    userId: String;
    cost: Decimal128;
    planName: String;
}

export type FullSubscriptionType = SubscriptionType & {
    user: UserType;
}

export type UserType = {
    _id: ObjectId;
    name: String;
    email: String;
    password: String;
}

export type ItemType = {
    _id: ObjectId;
    name: String;
    price: Double;
    stock: IntegerType;
    category: String;
}