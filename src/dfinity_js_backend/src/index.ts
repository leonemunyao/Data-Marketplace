import { query, update, text, Record, StableBTreeMap, Vec, Result, Principal, Canister, nat64 } from "azle";
import { Ledger } from "azle/canisters/ledger";
import { v4 as uuidv4 } from "uuid";

// Define record types
const DataItem = Record({
    id: text,
    title: text,
    description: text,
    price: nat64,
    seller: text,
    attachmentURL: text,
    dataFormat: text,
    status: text,
    quality: text,
    rating: nat64
});

const Purchaser = Record({
    id: text,
    name: text,
    price: nat64,
    message: text,
    purchasedItem: Vec(text)
});

const PurchaserPayload = Record({
    name: text,
    price: nat64,
    message: text,
});

const DataItemPayload = Record({
    title: text,
    description: text,
    price: nat64,
    seller: text,
    attachmentURL: text,
    dataFormat: text,
    status: text,
    quality: text,
    rating: nat64
});

// Define message variants
const Message = Record({
    NotFound: text,
    InvalidPayload: text,
    PaymentFailed: text,
    PaymentCompleted: text
});

/**
 * `productsStorage` - it's a key-value datastructure that is used to store products by sellers.
 * {@link StableBTreeMap} is a self-balancing tree that acts as a durable data storage that keeps data across canister upgrades.
 * For the sake of this contract we've chosen {@link StableBTreeMap} as a storage for the next reasons:
 * - `insert`, `get` and `remove` operations have a constant time complexity - O(1)
 * - data stored in the map survives canister upgrades unlike using HashMap where data is stored in the heap and it's lost after the canister is upgraded
 * 
 * Brakedown of the `StableBTreeMap(text, Product)` datastructure:
 * - the key of map is a `productId`
 * - the value in this map is a product itself `Product` that is related to a given key (`productId`)
 * 
 * Constructor values:
 * 1) 0 - memory id where to initialize a map
 * 2) 16 - it's a max size of the key in bytes.
 * 3) 1024 - it's a max size of the value in bytes. 
 * 2 and 3 are not being used directly in the constructor but the Azle compiler utilizes these values during compile time
 */

// Define storage data structures
const DataItemsStorage = StableBTreeMap(0, text, DataItem);
const purchasersStorage = StableBTreeMap(1, text , Purchaser);

// Initialize Ledger canister
const ledgerCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

export default Canister({

    getDataItems: query([], Vec(DataItem), () => DataItemsStorage.values()),

    getPurchasers: query([], Vec(Purchaser), () => purchasersStorage.values()),

    getDataItem: query([text], Result(DataItem, text), (id) => {
        const dataOpt = DataItemsStorage.get(id);
        return dataOpt ? Result.Ok(dataOpt) : Result.Err("Data Item not found");
    }),

    getPurchaser: query([text], Result(Purchaser, text), (name) => {
        const purchaserOpt = purchasersStorage.get(name);
        return purchaserOpt ? Result.Ok(purchaserOpt) : Result.Err("Purchaser not found");
    }),

    addDataItem: update([DataItemPayload], Result(DataItem, Message), (payload) => {
        const id = uuidv4();
        const data = { id, ...payload };
        DataItemsStorage.insert(id, data);
        return Result.Ok(data);
    }),

    addPurchaser: update([PurchaserPayload], Result(Purchaser, Message), (payload) => {
        const id = uuidv4();
        const purchaser = { id, ...payload, purchasedItem: [] };
        purchasersStorage.insert(id, purchaser);
        return Result.Ok(purchaser);
    }),

    updateDataItem: update([text, DataItemPayload], Result(DataItem, Message), (id, payload) => {
        const data = DataItemsStorage.get(id);
        if (!data) {
            return Result.Err({ NotFound: "Data not found" });
        }
        const updatedData = { ...data, ...payload };
        DataItemsStorage.insert(id, updatedData);
        return Result.Ok(updatedData);
    }),

    updatePurchaser: update([text, PurchaserPayload], Result(Purchaser, Message), (id, payload) => {
        const purchaser = purchasersStorage.get(id);
        if (!purchaser) {
            return Result.Err({ NotFound: "Purchaser not found" });
        }
        const updatedPurchaser = { ...purchaser, ...payload };
        purchasersStorage.insert(id, updatedPurchaser);
        return Result.Ok(updatedPurchaser);
    }),

    deleteDataItem: update([text], Result(text, Message), (id) => {
        const deletedDataItem = DataItemsStorage.remove(id);
        return deletedDataItem ? Result.Ok(deletedDataItem.id) : Result.Err({ NotFound: `DataItem with id=${id} not found` });
    }),

    deletePurchaser: update([text], Result(text, Message), (id) => {
        const deletedPurchaser = purchasersStorage.remove(id);
        return deletedPurchaser ? Result.Ok(deletedPurchaser.id) : Result.Err({ NotFound: `Purchaser with id=${id} not found` });
    }),

    addPurchasedItem: update([text, text], Result(text, Message), (purchaserId, itemId) => {
        const purchaser = purchasersStorage.get(purchaserId);
        if (!purchaser) {
            return Result.Err({ NotFound: "Purchaser not found" });
        }
        purchaser.purchasedItem.push(itemId);
        purchasersStorage.insert(purchaserId, purchaser);
        return Result.Ok("Item added to Purchaser");
    }),

    searchDataItem: query([text], Vec(DataItem), (query) => {
        const datas = DataItemsStorage.values();
        return datas.filter(datum => datum.title.toLowerCase().includes(query.toLowerCase()) || datum.description.toLowerCase().includes(query.toLowerCase()));
    }),

    filterDataItem: query([text], Vec(DataItem), (query) => {
        const datas = DataItemsStorage.values();
        return datas.filter(datum => datum.dataFormat.toLowerCase().includes(query.toLowerCase()));
    }),

    getInitialDataItem: query([], Vec(DataItem), () => DataItemsStorage.values().slice(0, 2)),

    getMoreDataItems: query([nat64, nat64], Vec(DataItem), (start, limit) => {
        const datas = DataItemsStorage.values();
        return datas.slice(Number(start), Number(start + limit));
    }),

});

// Polyfill for uuid package
globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    }
};
