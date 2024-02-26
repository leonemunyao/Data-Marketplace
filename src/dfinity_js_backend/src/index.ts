import { query, update, text, Record, StableBTreeMap, Variant, Vec, None, Some, Ok, Err, ic, Principal, Opt, nat64, Duration, Result, bool, Canister } from "azle";
import {
    Ledger, binaryAddressFromAddress, binaryAddressFromPrincipal, hexAddressFromPrincipal
} from "azle/canisters/ledger";
import { hashCode } from "hashcode";
import { v4 as uuidv4 } from "uuid";

/**
 * This type represents a product that can be listed on a marketplace.
 * It contains basic properties that are needed to define a product.
 */
const DataItem = Record({
    id: text,
    title: text,
    description: text,
    price: nat64,
    seller: text,
    attachmentURL: text,
    dataFormat: text,
    status:text,
    quality:text,
    rating: nat64
});

const Purchaser = Record({
    id: text,
    name:text,
    price:nat64,
    message:text,
    purchasedItem:Vec(text)
});

const PurchaserPayload = Record({
    name:text,
    price:nat64,
    message:text,
});


const DataItemPayload = Record({
    title: text,
    description: text,
    price: nat64,
    seller: text,
    attachmentURL: text,
    dataFormat: text,
    status:text,
    quality:text,
    rating: nat64
});

const Message = Variant({
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
const DataItemsStorage = StableBTreeMap(0, text, DataItem);
const purchasersStorage = StableBTreeMap(1, text , Purchaser)



/* 
    initialization of the Ledger canister. The principal text value is hardcoded because 
    we set it in the `dfx.json`
*/
const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

export default Canister({

    getDataItems : query([], Vec(DataItem),  () => {
        return  DataItemsStorage.values();
    }
    ),

    getPurchasers : query([], Vec(Purchaser),  () => {
        return  purchasersStorage.values();
    }
    ),

    getDataItem: query([text], Result(DataItem, text), (id) => {
        const dataOpt = DataItemsStorage.get(id);
        if ("None" in dataOpt) {
            return Err("Data Item not found");
        }
        return Ok(dataOpt.Some);
    } 
    ),

    getPurchaser: query([text], Result(Purchaser, text), (name) => {
        const purchaserOpt = purchasersStorage.get(name);
        if ("None" in purchaserOpt) {
            return Err("Purchaser not found");
        }
        return Ok(purchaserOpt.Some);
    } 
    ),


    
    addDataItem: update([DataItemPayload], Result(DataItem, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const data = { id: uuidv4(), ...payload };
        DataItemsStorage.insert(data.id, data);
        return Ok(data);
    }

    ),

    addPurchaser: update([PurchaserPayload], Result(Purchaser, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const purchaser = { id: uuidv4(), ...payload , purchasedItem:[]};
        purchasersStorage.insert(purchaser.id, purchaser);
        return Ok(purchaser);
    }

    ),

    updateDataItem: update([text, DataItemPayload], Result(DataItem, Message), (id, payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const dataOpt = DataItemsStorage.get(id);
        if ("None" in dataOpt) {
            return Err({ NotFound: "Data not found" });
        }
        const data = dataOpt.Some;
        const updatedData = { ...data, ...payload };
        DataItemsStorage.insert(id, updatedData);
        return Ok(updatedData);
    }),

    updatePurchaser: update([text, PurchaserPayload], Result(Purchaser, Message), (id, payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "invalid payoad" })
        }
        const purchaserOpt = purchasersStorage.get(id);
        if ("None" in purchaserOpt) {
            return Err({ NotFound: "Purchaser not found" });
        }
        const purchaser = purchaserOpt.Some;
        const updatedPurchaser = { ...purchaser, ...payload };
        purchasersStorage.insert(id, updatedPurchaser);
        return Ok(updatedPurchaser);
    }),


    deleteDataItem: update([text], Result(text, Message), (id) => {
        const deletedDataItemOpt = DataItemsStorage.remove(id);
        if ("None" in deletedDataItemOpt) {
            return Err({ NotFound: `cannot delete the DataItem: DataItem with id=${id} not found` });
        }
        return Ok(deletedDataItemOpt.Some.id);
    }),

    deletePurchaser: update([text], Result(text, Message), (id) => {
        const deletedPurchaserOpt = purchasersStorage.remove(id);
        if ("None" in deletedPurchaserOpt) {
            return Err({ NotFound: `cannot delete the Purchaser: Purchaser with id=${id} not found` });
        }
        return Ok(deletedPurchaserOpt.Some.id);
    }),

    addPurchasedItem: update([text,text], Result(text, Message), (purchaserId,itemId) => {
        const purchaserOpt = purchasersStorage.get(purchaserId);
        if ("None" in purchaserOpt) {
            return Err({ NotFound: "Purchaser not found" });
        }
        const purchaser = purchaserOpt.Some;
        purchaser.purchasedItem.push(itemId);
        purchasersStorage.insert(purchaserId, purchaser);
        return Ok("Item added to Purchaser");
    } 

    ),

    searchDataItem: query([text], Vec(DataItem), (query) => {
        const datas = DataItemsStorage.values();
        return datas.filter(datum => datum.title.toLowerCase().includes(query.toLowerCase()) || datum.description.toLowerCase().includes(query.toLowerCase()));
    }),

    // filter by data format
    filterDataItem: query([text], Vec(DataItem), (query) => {
        const datas = DataItemsStorage.values();
        return datas.filter(datum => datum.dataFormat.toLowerCase().includes(query.toLowerCase()));
    }),

    getInitialDataItem: query([], Vec(DataItem), () => {
        const datas = DataItemsStorage.values();
        return datas.slice(0, 2);
    }
    ),

     // Load More Data Items
    getMoreDataItems: query([nat64,nat64], Vec(DataItem), (start, limit) => {
        const datas = DataItemsStorage.values();
        return datas.slice(Number(start),Number(start + limit));
    }),


});



// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};


